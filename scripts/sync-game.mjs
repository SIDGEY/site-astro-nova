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
 *     Seuls ceux marqués `surLeCdn` sont repris.
 *
 * Sorties (versionnées : la CI de déploiement n'a pas les autres dépôts) :
 *   - `src/data/game.json`  le catalogue, avec le commit du jeu dont il est tiré ;
 *   - `public/game/**`      les images, redimensionnées pour le web.
 *
 * Usage :
 *   node scripts/sync-game.mjs            # lit origin/main tel que connu localement
 *   node scripts/sync-game.mjs --fetch    # git fetch origin main d'abord
 *   FRONTEND_PATH=… CODEX_PATH=… GAME_REF=… node scripts/sync-game.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = path.resolve(process.env.FRONTEND_PATH ?? path.join(ROOT, '..', 'Frontend'));
const CODEX = path.resolve(process.env.CODEX_PATH ?? path.join(ROOT, '..', 'dynasty-nova-codex'));
const REF = process.env.GAME_REF ?? 'origin/main';
const OUT_PUBLIC = path.join(ROOT, 'public', 'game');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'game.json');

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

const git = (...args) => execFileSync('git', ['-C', FRONTEND, ...args], { maxBuffer: 1 << 28 });
const show = (file) => git('show', `${REF}:${file}`);
const showText = (file) => show(file).toString('utf8');
const showJson = (file) => JSON.parse(showText(file));
const listTree = (dir) =>
  git('ls-tree', '-r', '--name-only', REF, dir).toString('utf8').split('\n').filter(Boolean);

if (process.argv.includes('--fetch')) git('fetch', '--quiet', 'origin', 'main');

const sha = git('rev-parse', REF).toString('utf8').trim();
const commitDate = git('show', '-s', '--format=%cI', REF).toString('utf8').trim();

// --- Catalogue ---------------------------------------------------------------------------------

const i18n = (ns) => showJson(`src/i18n/locales/fr/${ns}.json`);

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
  const re = /code:\s*'([a-z_]+)',\s*name:\s*'([^']+)',\s*description:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)")[\s\S]*?imageUrl:\s*(\w+)/g;
  for (const m of src.matchAll(re)) {
    ships.push({
      code: m[1],
      name: m[2],
      description: (m[3] ?? m[4]).replace(/\\'/g, "'"),
      asset: vars[m[5]],
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
  for (const a of roster.filter((x) => x.surLeCdn).sort((x, y) => x.index - y.index)) {
    const key = a.dossier;
    const image = `avatars/${key}/image.webp`;
    const background = `avatars/${key}/background.webp`;
    await writeImage(fs.readFileSync(path.join(dir, a.fichiers.image)), path.join(OUT_PUBLIC, image), 256, 82);
    await writeImage(fs.readFileSync(path.join(dir, a.fichiers.background)), path.join(OUT_PUBLIC, background), 640);
    catalog.avatars.push({ code: a.cosmeticKey, name: a.nom, image: `/game/${image}`, background: `/game/${background}` });
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
