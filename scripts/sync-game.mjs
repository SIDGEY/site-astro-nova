#!/usr/bin/env node
/**
 * Synchronise la page d'accueil avec le jeu : catalogue (noms, descriptions FR, images) et visuels.
 *
 * Les écrans « téléphone » de la home ne sont plus des captures : ce sont des composants Astro
 * (`src/components/game/`) qui reconstruisent l'interface du jeu. Ce script leur fournit les
 * données, lues à la source plutôt que recopiées à la main :
 *
 *   - le jeu (`Dynasty-Nova/Frontend`), lu sur `origin/main` via git — jamais la copie de travail,
 *     qui suit la branche du moment : la home doit montrer ce qui est en production ;
 *   - le codex (`dynasty-nova-codex`), pour les avatars, qui vivent sur le CDN et pas dans le jeu.
 *     Seuls ceux marqués `surLeCdn` sont repris ;
 *   - le backend (`Astro-Nova-Backend`, `origin/main` aussi), pour la rareté et le prix de chaque
 *     avatar : le catalogue de la boutique est semé par ses migrations (`shop_item`).
 *
 * Sorties (versionnées : la CI de déploiement n'a pas les autres dépôts) :
 *   - `src/data/game.json`       le catalogue, textes français, avec le commit du jeu dont il est tiré ;
 *   - `src/data/game.i18n.json`  les textes du jeu anglais par code, et les libellés d'interface que
 *                                les écrans du site reprennent au jeu, dans chaque langue ;
 *   - `public/game/**`           les images, redimensionnées pour le web.
 *
 * Usage :
 *   node scripts/sync-game.mjs            # lit origin/main tel que connu localement
 *   node scripts/sync-game.mjs --fetch    # git fetch origin main d'abord
 *   node scripts/sync-game.mjs --texts    # les textes seuls, au commit du catalogue en place
 *   FRONTEND_PATH=… CODEX_PATH=… BACKEND_PATH=… GAME_REF=… node scripts/sync-game.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = path.resolve(process.env.FRONTEND_PATH ?? path.join(ROOT, '..', 'Frontend'));
const CODEX = path.resolve(process.env.CODEX_PATH ?? path.join(ROOT, '..', 'dynasty-nova-codex'));
const BACKEND = path.resolve(process.env.BACKEND_PATH ?? path.join(ROOT, '..', 'Astro-Nova-Backend'));
const OUT_PUBLIC = path.join(ROOT, 'public', 'game');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'game.json');
const OUT_TEXTS = path.join(ROOT, 'src', 'data', 'game.i18n.json');
/**
 * `--texts` ne réécrit que `game.i18n.json`, lu au commit dont le catalogue en place est tiré : un
 * libellé que le site emprunte au jeu s'ajoute ainsi sans resynchroniser le jeu ni ses images.
 */
const TEXTS_ONLY = process.argv.includes('--texts');
const REF =
  process.env.GAME_REF ?? (TEXTS_ONLY ? JSON.parse(fs.readFileSync(OUT_DATA, 'utf8')).source.sha : 'origin/main');

/** Largeur des vignettes d'entités : pleine largeur d'un écran de 216px, en densité ×3. */
const ENTITY_WIDTH = 640;
/** Bannières de page, réutilisées en fond de section (75 % de 1280px). */
const BANNER_WIDTH = 1600;
/**
 * La vitrine de la planète 3D : une variante par biome, plus une lune. Choisies sur planche, rendues
 * par le moteur du jeu sous le même angle (16/10/2026) : la plus lisible et la plus contrastée de
 * chaque famille. Le dossier source est `textures/planets/<biome>/<biome>-<n>` ou
 * `textures/moons/moon-<n>` ; une lune est un corps sans atmosphère (`airless`, comme en jeu).
 */
const PLANET_SHOWCASE = {
  normal: '02',
  jungle: '04',
  water: '04',
  ice: '04',
  desert: '04',
  dry: '03',
  gas: '01',
  moon: '01',
};
/**
 * Les traits de chaque dynastie, dans l'ordre de `DynastyKey::traits()` (backend). Le front ne porte
 * que leurs textes : la correspondance est recopiée ici, le Chœur n'est pas jouable et n'en a pas.
 */
const DYNASTY_TRAITS = {
  heritage: ['nothing_is_lost', 'halden_rotation'],
  accord: ['tuning_fork', 'far_listening'],
  choir: [],
};
/** Scène de dynastie (1376×768 en jeu), en fond plein cadre sur la home : gardée à sa taille native. */
const DYNASTY_SCENE_WIDTH = 1376;

const git = (...args) => execFileSync('git', ['-C', FRONTEND, ...args], { maxBuffer: 1 << 28 });
const show = (file) => git('show', `${REF}:${file}`);
const showText = (file) => show(file).toString('utf8');
const showJson = (file) => JSON.parse(showText(file));
const listTree = (dir) =>
  git('ls-tree', '-r', '--name-only', REF, dir).toString('utf8').split('\n').filter(Boolean);

const backendGit = (...args) => execFileSync('git', ['-C', BACKEND, ...args], { maxBuffer: 1 << 28 });

if (process.argv.includes('--fetch')) {
  git('fetch', '--quiet', 'origin', 'main');
  backendGit('fetch', '--quiet', 'origin', 'main');
}

const sha = git('rev-parse', REF).toString('utf8').trim();
const commitDate = git('show', '-s', '--format=%cI', REF).toString('utf8').trim();

// --- Catalogue ---------------------------------------------------------------------------------

const i18n = (ns, lang = 'fr') => showJson(`src/i18n/locales/${lang}/${ns}.json`);

/**
 * Les tables `code → { imageUrl: assetUrl('…') }` des utilitaires d'administration : la seule
 * correspondance code/image écrite côté front pour bâtiments, défenses et recherches (en jeu,
 * l'image arrive par l'API). Lu par motif plutôt qu'importé : le module tire tout le jeu.
 */
function parseInformationTable(file) {
  const src = showText(file);
  const entries = [];
  const re = /^\s{2}([a-z_]+):\s*\{\s*imageUrl:\s*assetUrl\('([^']+)'\)/gm;
  for (const m of src.matchAll(re)) {
    // `planetary_base` apparaît deux fois (base planétaire puis coloniale) : on garde la première.
    if (!entries.some((e) => e.code === m[1])) entries.push({ code: m[1], asset: m[2] });
  }
  if (entries.length === 0) throw new Error(`Aucune entrée lue dans ${file} : le format a changé ?`);
  return entries;
}

/** Vaisseaux : `shipsData.ts` porte le nom FR, la description et une constante d'image. */
function parseShips() {
  const src = showText('src/data/shipsData.ts');
  const vars = Object.fromEntries(
    [...src.matchAll(/const (\w+) = assetUrl\('([^']+)'\)/g)].map((m) => [m[1], m[2]]),
  );
  const ships = [];
  const str = String.raw`(?:'((?:[^'\\]|\\.)*)'|"([^"]*)")`;
  const re = new RegExp(
    String.raw`code:\s*'([a-z_]+)',\s*name:\s*'([^']+)',\s*description:\s*${str},\s*(?:longDescription:\s*${str},)?[\s\S]*?imageUrl:\s*(\w+)`,
    'g',
  );
  const text = (single, double) => (single ?? double ?? '').replace(/\\'/g, "'");
  for (const m of src.matchAll(re)) {
    ships.push({
      code: m[1],
      name: m[2],
      description: text(m[3], m[4]),
      longDescription: text(m[5], m[6]),
      asset: vars[m[7]],
    });
  }
  if (ships.length === 0) throw new Error('Aucun vaisseau lu dans shipsData.ts : le format a changé ?');
  return ships;
}

const slugOf = (asset) => path.basename(asset, path.extname(asset));

function withTexts(entries, ns) {
  const t = i18n(ns);
  return entries.map(({ code, asset }) => ({
    code,
    name: t.name?.[code] ?? code,
    description: t.description?.[code] ?? '',
    longDescription: t.long_description?.[code] ?? '',
    asset,
  }));
}

const buildingEntries = withTexts(parseInformationTable('src/features/admin/utils/buildings.utils.ts'), 'buildings');
// Le dossier d'image recoupe l'onglet du jeu : `buildings/` sous Ressources, `facilities/` sous
// Installations (cf. `buildingRules.ts`).
const buildings = buildingEntries.filter((b) => b.asset.includes('/buildings/'));
const facilities = buildingEntries.filter((b) => b.asset.includes('/facilities/'));
const defenses = withTexts(parseInformationTable('src/features/admin/utils/defenses.utils.ts'), 'defenses');
const research = withTexts(parseInformationTable('src/features/admin/utils/researches.utils.ts'), 'researches');
const ships = parseShips();

const resourceMeta = {
  metal: { name: 'Métal', icon: 'nut', asset: '/assets/images/resources/metal.webp' },
  crystal: { name: 'Cristal', icon: 'diamonds-four', asset: '/assets/images/resources/crystal.webp' },
  hydrogen: { name: 'Hydrogène', icon: 'drop', asset: '/assets/images/resources/hydrogene.webp' },
  energy: { name: 'Énergie', icon: 'lightning', asset: '/assets/images/resources/energy.webp' },
};
// Les noms et descriptions des ressources vivent dans `resourceIconsData.ts` : on les y relit pour
// suivre une retouche de texte, la table ci-dessus ne fixant que l'ordre et l'icône.
{
  const src = showText('src/data/resourceIconsData.ts');
  for (const m of src.matchAll(/type:\s*'(\w+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)'/g)) {
    if (resourceMeta[m[1]]) Object.assign(resourceMeta[m[1]], { name: m[2], description: m[3] });
  }
  // La description longue, celle de la fiche ressource (`ResourceModal`), vit dans `RESOURCE_DATA`.
  const data = showText('src/features/resources/types/resources.ts');
  const longRow = /^ {2}(\w+): \{[^}]*?longDescription:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/gm;
  for (const m of data.matchAll(longRow)) {
    if (resourceMeta[m[1]]) resourceMeta[m[1]].longDescription = (m[2] ?? m[3]).replace(/\\(.)/g, '$1');
  }
}

const shopFr = showJson('src/i18n/locales/fr/components/shop.json');
const packs = ['base', 'standard', 'premium'].map((tier) => ({
  code: `stellar_${tier}`,
  name: shopFr.packs.stellar[tier].title,
  description: shopFr.packs.stellar[tier].description,
  // Le contenu du pack n'est écrit qu'en toutes lettres dans sa description longue.
  amount: Number(shopFr.packs.stellar[tier].longDescription.match(/(\d[\d\s]*)\s*Stellar Points/)?.[1].replace(/\s/g, '')) || null,
  asset: `/assets/images/packs/pack-stellar-${tier}.webp`,
}));

const navFr = showJson('src/i18n/locales/fr/components/navigation.json');

// --- Textes par langue -------------------------------------------------------------------------

/**
 * Le catalogue porte les textes français. Les textes anglais s'y superposent code par code, tels
 * que le jeu anglais les a : ce qu'il n'écrit qu'en français (noms et descriptions des vaisseaux,
 * `shipsData.ts` ; descriptions des ressources) n'y figure pas, et le site le montre en français,
 * comme le jeu. Les noms des ressources y sont (`components/resources`) ; la fiche ressource du jeu
 * ne s'en sert pas, `ScreenResourceDetail` non plus.
 */
const LANGS = ['fr', 'en'];
const kept = (texts) => Object.fromEntries(Object.entries(texts).filter(([, v]) => typeof v === 'string' && v !== ''));

function englishEntities(entries, ns) {
  const t = i18n(ns, 'en');
  return Object.fromEntries(
    entries.map(({ code }) => [
      code,
      kept({ name: t.name?.[code], description: t.description?.[code], longDescription: t.long_description?.[code] }),
    ]),
  );
}

function englishTexts() {
  const resourcesEn = i18n('components/resources', 'en');
  const shopEn = i18n('components/shop', 'en');
  const dynastiesEn = i18n('dynasties', 'en');
  return {
    nav: i18n('components/navigation', 'en'),
    resources: Object.fromEntries(Object.keys(resourceMeta).map((code) => [code, kept({ name: resourcesEn[code] })])),
    buildings: englishEntities(buildings, 'buildings'),
    facilities: englishEntities(facilities, 'buildings'),
    defenses: englishEntities(defenses, 'defenses'),
    research: englishEntities(research, 'researches'),
    packs: Object.fromEntries(
      packs.map(({ code }) => {
        const pack = shopEn.packs?.stellar?.[code.replace('stellar_', '')] ?? {};
        return [code, kept({ name: pack.title, description: pack.description })];
      }),
    ),
    dynasties: Object.fromEntries(
      Object.entries(DYNASTY_TRAITS).map(([code, traits]) => {
        const t = dynastiesEn[code] ?? {};
        return [
          code,
          {
            ...kept({ name: t.name, people: t.people, motto: t.motto, fiction: t.fiction }),
            traits: Object.fromEntries(traits.map((key) => [key, kept(dynastiesEn.traits?.[key] ?? {})])),
          },
        ];
      }),
    ),
    avatars: Object.fromEntries(
      Object.entries(i18n('avatars', 'en')).map(([code, avatar]) => [code, kept({ name: avatar.name })]),
    ),
  };
}

/**
 * Les libellés d'interface que les écrans du site empruntent au jeu : chaque `gameT(locale, 'ns:clé')`
 * de `src/`, relu dans chaque langue. Une clé écrite en gabarit (`…rarity.${r}`) vaut toutes celles
 * qui commencent ainsi ; une clé au pluriel (`clé_one`, `clé_other`…) vient avec toutes ses formes.
 * Une clé introuvable fait échouer la synchro : le jeu l'a renommée ou retirée.
 */
function uiKeys() {
  const keys = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(astro|ts)$/.test(entry.name)) {
        for (const m of fs.readFileSync(file, 'utf8').matchAll(/gameT\(\s*[\w.]+\s*,\s*(['"`])([^'"`]+)\1/g)) keys.add(m[2]);
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  return [...keys].sort();
}

function uiTexts(keys, lang) {
  const files = new Map();
  const node = (ns, parts) => {
    if (!files.has(ns)) files.set(ns, i18n(ns, lang));
    return parts.reduce((n, part) => n?.[part], files.get(ns));
  };
  const out = {};
  for (const key of keys) {
    const [ns, dotted] = key.split(':');
    if (!dotted) throw new Error(`Clé de libellé « ${key} » : attendu « espace:chemin ».`);
    const template = dotted.indexOf('${');
    const parts = (template >= 0 ? dotted.slice(0, template).replace(/\.$/, '') : dotted).split('.');
    const leaf = template >= 0 ? null : parts.pop();
    const parent = node(ns, parts);
    // La clé elle-même et ses formes plurielles, ou toutes les clés du gabarit.
    const forms = Object.entries(parent ?? {}).filter(
      ([name, text]) =>
        typeof text === 'string' && (leaf === null || name === leaf || new RegExp(`^${leaf}_(zero|one|two|few|many|other)$`).test(name)),
    );
    for (const [name, text] of forms) out[`${ns}:${[...parts, name].join('.')}`] = text;
    if (forms.length === 0) out[key] = null;
  }
  return out;
}

{
  const keys = uiKeys();
  const ui = Object.fromEntries(LANGS.map((lang) => [lang, uiTexts(keys, lang)]));
  const absent = Object.keys(ui.fr).filter((key) => ui.fr[key] === null);
  if (absent.length) throw new Error(`Libellés absents du jeu : ${absent.join(', ')}. Renommés ou retirés ?`);
  // Une clé sans anglais, le jeu anglais l'afficherait brute (son `t()` retombe sur l'anglais,
  // puis sur la clé) : le site garde le français, et la synchro le signale.
  const untranslated = Object.keys(ui.fr).filter((key) => ui.en[key] == null);
  for (const key of untranslated) ui.en[key] = ui.fr[key];
  for (const key of Object.keys(ui.en)) if (!(key in ui.fr)) delete ui.en[key];
  if (untranslated.length) console.warn(`Libellés sans anglais dans le jeu : ${untranslated.join(', ')}`);

  const texts = {
    source: { repo: 'Dynasty-Nova/Frontend', ref: REF, sha, commitDate },
    ui,
    en: englishTexts(),
  };
  fs.mkdirSync(path.dirname(OUT_TEXTS), { recursive: true });
  fs.writeFileSync(OUT_TEXTS, `${JSON.stringify(texts, null, 2)}\n`);
  if (TEXTS_ONLY) {
    console.log(`Textes du jeu ${sha.slice(0, 8)} (${commitDate.slice(0, 10)}) — ${keys.length} libellés, ${LANGS.join(' + ')}.`);
    process.exit(0);
  }
}

// --- Images ------------------------------------------------------------------------------------

let written = 0;
async function writeImage(buffer, dest, width, quality = 78) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
  written++;
}

/** Copie une image du jeu vers `public/game/<family>/<code>.webp` et renvoie son URL publique. */
async function gameImage(asset, family, name, width = ENTITY_WIDTH) {
  const rel = `${family}/${name}.webp`;
  await writeImage(show(`src${asset}`), path.join(OUT_PUBLIC, rel), width);
  return `/game/${rel}`;
}

fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });

async function materialize(list, family) {
  return Promise.all(
    list.map(async ({ asset, ...rest }) => ({ ...rest, image: await gameImage(asset, family, rest.code) })),
  );
}

const catalog = {
  source: {
    repo: 'Dynasty-Nova/Frontend',
    ref: REF,
    sha,
    commitDate,
    syncedAt: new Date().toISOString(),
  },
  nav: navFr,
  resources: Object.fromEntries(
    await Promise.all(
      Object.entries(resourceMeta).map(async ([code, { asset, ...rest }]) => [
        code,
        { code, ...rest, image: await gameImage(asset, 'resources', code) },
      ]),
    ),
  ),
  buildings: await materialize(buildings, 'buildings'),
  facilities: await materialize(facilities, 'facilities'),
  defenses: await materialize(defenses, 'defenses'),
  ships: await materialize(ships, 'ships'),
  research: await materialize(research, 'research'),
  packs: await materialize(packs, 'packs'),
  banners: {},
  planets: {},
  avatars: [],
};

for (const file of listTree('src/assets/images/heroes')) {
  const name = slugOf(file);
  catalog.banners[name] = await gameImage(file.replace(/^src/, ''), 'banners', name, BANNER_WIDTH);
}
// Dynasties : textes de l'écran de choix (`dynasties.json`), scène et bannière de chacune.
const dynastiesFr = i18n('dynasties');
catalog.dynasties = await Promise.all(
  Object.entries(DYNASTY_TRAITS).map(async ([code, traits]) => {
    const t = dynastiesFr[code];
    return {
      code,
      name: t.name,
      people: t.people ?? '',
      motto: t.motto,
      fiction: t.fiction ?? '',
      playable: traits.length > 0,
      traits: traits.map((key) => ({ code: key, ...dynastiesFr.traits[key] })),
      scene: await gameImage(`/assets/images/dynasties/scenes/${code}.webp`, 'dynasties', `${code}-scene`, DYNASTY_SCENE_WIDTH),
      banner: await gameImage(`/assets/images/dynasties/banners/${code}.webp`, 'dynasties', `${code}-banner`, 320),
    };
  }),
);
// Fond de la page Planète (`PLANET_BACKDROP_IMAGE`), posé derrière la scène 3D.
catalog.backdrops = { space: await gameImage('/assets/images/backgrounds/space.webp', 'backgrounds', 'space', 1200) };
catalog.logo = '/game/logo-icon.svg';
fs.writeFileSync(path.join(OUT_PUBLIC, 'logo-icon.svg'), show('public/logo-icon.svg'));

// Planète 3D : la variante vitrine de chaque biome, textures telles que le moteur du jeu les charge.
for (const [biome, variant] of Object.entries(PLANET_SHOWCASE)) {
  const isMoon = biome === 'moon';
  const dir = isMoon
    ? `src/assets/textures/moons/moon-${variant}`
    : `src/assets/textures/planets/${biome}/${biome}-${variant}`;
  const tree = listTree(dir);
  if (tree.length === 0) throw new Error(`Variante vitrine introuvable dans le jeu : ${dir}`);
  const out = path.join(OUT_PUBLIC, 'planets', biome);
  fs.mkdirSync(out, { recursive: true });
  const files = { variant: `${biome}-${variant}`, ...(isMoon ? { airless: true } : {}) };
  for (const file of tree) {
    const base = path.basename(file);
    fs.writeFileSync(path.join(out, base), show(file));
    written++;
    if (base.endsWith('.json')) files.atmosphere = JSON.parse(show(file).toString('utf8'));
    else files[slugOf(base)] = `/game/planets/${biome}/${base}`;
  }
  // Les illustrations 2D de la même variante : `<biome>_full_<n>` la sphère détourée, `<biome>_<n>`
  // l'horizon. Une lune n'en a pas.
  if (!isMoon) {
    const n = Number(variant);
    files.sphere = await gameImage(`/assets/images/planets/${biome}/${biome}_full_${n}.webp`, `planets/${biome}`, 'sphere');
    files.horizon = await gameImage(`/assets/images/planets/${biome}/${biome}_${n}.webp`, `planets/${biome}`, 'horizon');
  }
  catalog.planets[biome] = files;
}

// Moteur de planète : le code du jeu, copié tel quel, comme le codex l'importe (`Planete3D.astro`).
// La planète 3D de la home ne peut donc pas diverger du rendu du jeu — sol, halo, nuages, voile.
{
  const VENDOR = path.join(ROOT, 'src', 'vendor', 'game');
  fs.rmSync(VENDOR, { recursive: true, force: true });
  fs.mkdirSync(VENDOR, { recursive: true });
  const banner = (file) =>
    `// GÉNÉRÉ par scripts/sync-game.mjs — copie de ${file} (Dynasty-Nova/Frontend @ ${sha.slice(0, 8)}).\n// Ne pas modifier ici : relancer \`npm run game:sync\`.\n`;

  const surfaceFile = 'src/features/planets/utils/planetSurface.ts';
  const surface = showText(surfaceFile);
  if (/^import (?!\* as THREE from 'three')/m.test(surface)) {
    throw new Error(`${surfaceFile} importe autre chose que three : la copie ne suffit plus.`);
  }
  fs.writeFileSync(path.join(VENDOR, 'planetSurface.ts'), `// @ts-nocheck\n${banner(surfaceFile)}${surface}`);

  // Le parseur des profils `atmosphere.json`, sans les globs Vite qui le suivent dans le fichier.
  const atmoFile = 'src/features/planets/utils/planetAtmosphere.ts';
  const atmo = showText(atmoFile);
  const start = atmo.indexOf('/**\n * `atmosphere.json`');
  const end = atmo.indexOf('const SHIPPED_PROFILES');
  if (start < 0 || end < 0 || !atmo.includes('export function parsePlanetAtmosphere')) {
    throw new Error(`${atmoFile} a changé de forme : revoir l'extraction de parsePlanetAtmosphere.`);
  }
  fs.writeFileSync(
    path.join(VENDOR, 'planetAtmosphere.ts'),
    `// @ts-nocheck\n${banner(atmoFile)}import type { PlanetAtmosphere, PlanetCloudLayer } from './planetSurface.ts';\n\n${atmo.slice(start, end).trimEnd()}\n`,
  );
  catalog.source.three = JSON.parse(showText('package.json')).dependencies.three;
}

// Avatars : la dernière livraison du codex, restreinte à ce qui est en ligne.
{
  const deliveries = fs
    .readdirSync(path.join(CODEX, 'assets/references'))
    .filter((d) => d.startsWith('livraison-avatars-'))
    .sort();
  const latest = deliveries.at(-1);
  if (!latest) throw new Error(`Aucune livraison d'avatars dans ${CODEX}/assets/references`);
  const dir = path.join(CODEX, 'assets/references', latest);
  const roster = JSON.parse(fs.readFileSync(path.join(dir, 'avatars.json'), 'utf8'));

  // Rareté et prix en Stellar Points : les lignes `shop_item` des migrations du backend, dans
  // l'ordre des fichiers (une ligne plus récente l'emporte). Un avatar absent du catalogue n'est
  // pas en boutique : il n'aura ni rareté ni prix, et la boutique de la home ne le montrera pas.
  const shopRow =
    /\('cosmetic-avatar-[a-z0-9-]+', 'cosmetic', '[a-z_]+', (\d+), 'avatar', '([a-z0-9_]+)', '([a-z]+)'/g;
  const shopCatalog = new Map();
  const migrations = backendGit('grep', '-h', '-E', 'cosmetic-avatar-', 'origin/main', '--', 'migrations')
    .toString('utf8')
    .replace(/\\'/g, "'");
  for (const [, price, key, rarity] of migrations.matchAll(shopRow)) {
    shopCatalog.set(key, { rarity, price: Number(price) });
  }
  if (shopCatalog.size === 0) throw new Error(`Aucun avatar dans les migrations de ${BACKEND}`);
  catalog.source.shop = `Astro-Nova-Backend@${backendGit('rev-parse', '--short', 'origin/main').toString('utf8').trim()}`;

  for (const a of roster.filter((x) => x.surLeCdn).sort((x, y) => x.index - y.index)) {
    const key = a.dossier;
    const image = `avatars/${key}/image.webp`;
    const background = `avatars/${key}/background.webp`;
    await writeImage(fs.readFileSync(path.join(dir, a.fichiers.image)), path.join(OUT_PUBLIC, image), 384, 82);
    await writeImage(fs.readFileSync(path.join(dir, a.fichiers.background)), path.join(OUT_PUBLIC, background), 640);
    catalog.avatars.push({
      code: a.cosmeticKey,
      name: a.nom,
      image: `/game/${image}`,
      background: `/game/${background}`,
      ...shopCatalog.get(a.cosmeticKey),
    });
  }
  catalog.source.avatars = `dynasty-nova-codex/assets/references/${latest}`;
}

fs.mkdirSync(path.dirname(OUT_DATA), { recursive: true });
fs.writeFileSync(OUT_DATA, `${JSON.stringify(catalog, null, 2)}\n`);

const count = (k) => `${catalog[k].length} ${k}`;
console.log(
  `Jeu ${REF} @ ${sha.slice(0, 8)} (${commitDate.slice(0, 10)}) — ${[
    'buildings', 'facilities', 'defenses', 'ships', 'research', 'packs', 'avatars',
  ].map(count).join(', ')}, ${Object.keys(catalog.planets).length} biomes, ${written} fichiers écrits.`,
);
