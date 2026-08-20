#!/usr/bin/env node
/**
 * Génère une cover d'article unique via Cloudflare Workers AI, adapté du script
 * du même nom dans le repo beryldesign (rendu maison "pli de papier" -> ici
 * "ruban de nébuleuse/plasma stellaire", cf. docs/dynasty-cover-style-guide.md).
 * Réservé aux illustrations ABSTRAITES (pas de vraie interface de jeu à
 * représenter — pour ça il faudrait compositer une vraie capture, pas générer).
 *
 * Backend : Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`),
 * même compte que beryldesign (tier gratuit ~10k neurones/jour). Pas de
 * fallback Gemini ici (facturation Google Cloud à activer sur un projet
 * séparé pour un besoin ponctuel — non justifié, cf. style guide §6).
 *
 * Deux façons de fournir le prompt :
 *   1. `--from-article` (recommandé) : lit le champ `coverPrompt` du frontmatter
 *      de l'article (`src/content/articles/<slug>.md`) — un BRIEF court qui nomme
 *      une teinte (voir docs/dynasty-cover-style-guide.md §4) — et l'habille du
 *      rendu maison (préambule + suffixe négatif).
 *   2. `--prompt "<...>"` : prompt complet fourni à la main (utilisé tel quel,
 *      sauf --wrap qui l'habille aussi).
 *
 * Usage :
 *   node scripts/generate-cover.mjs --slug <slug> --from-article
 *   node scripts/generate-cover.mjs --slug <slug> --from-article --dry   # voir le prompt final
 *   node scripts/generate-cover.mjs --slug <slug> --from-article --raw  # coverPrompt sans habillage
 *   node scripts/generate-cover.mjs --slug <slug> --prompt "..." --wrap
 *
 * Sortie par défaut : public/uploads/blog/covers/<slug>.webp, 1600x960 (5:3) —
 * le ratio réel d'affichage du site (`aspect-[5/3]`), pas le format carré des
 * 27 covers de repli existantes. Voir docs/dynasty-cover-style-guide.md §5.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import matter from 'gray-matter';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const DEFAULT_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const ARTICLES_DIR = 'src/content/articles';

// Langage de rendu MAISON (la constante) — cf. docs/dynasty-cover-style-guide.md §2/§3.
// Le `coverPrompt` de l'article (le brief, nommant une teinte) est inséré entre ce
// préambule et ce suffixe. --raw court-circuite l'habillage.
//
// Décision du 2026-08-20 : calé sur le pool de covers de repli EXISTANT
// (public/uploads/blog/covers/cover-{1..27}.webp), pas sur une composition inventée.
// Ces 27 images sont des photos macro très défocalisées, sans forme reconnaissable —
// juste un dégradé doux d'une seule teinte, avec du grain — jamais un ruban/vague net
// à arêtes visibles ni des particules scintillantes. Une première version de ce
// préambule produisait un rendu trop proche d'un "effet VFX énergie" (rubans nets,
// reflets spéculaires, paillettes) — corrigé pour matcher le flou existant.
const RENDER_PREAMBLE = `Extreme macro photograph, shot close and out of focus enough that no sharp object or edge is recognizable, but with a soft, loosely discernible drift of light moving through the frame — like a vague rounded glow, or a gentle diagonal streak of brightness — filling the frame edge to edge, no plain flat field. Exactly ONE dominant hue throughout, the hue named below, with a full tonal range graded smoothly from a rich, deeply saturated tone in the darker areas to a pale, almost-white highlight where the light is brightest — but never fading to true black, never a second unrelated color, never a crisp edge or sharp geometric shape. Fine analog film grain visible across the entire image. Soft, dreamy, ambient light photography — an imperfect, slightly noisy bokeh aesthetic, not a clean digital render.
`;
const NEGATIVE_SUFFIX =
  ' No black background, no dark void, no vignette, no space or starfield imagery, ' +
  'no sharp edges, no crisp specular highlights, no glitter or sparkle particles, ' +
  'no visible geometric shapes, no ribbons, folds, or coils, no multiple contrasting ' +
  'colors, no rainbow palette, no separate floating planets/ships/objects, no wide ' +
  'shot, no text, no letters, no words, no numbers, no logos, no faces, no solid ' +
  'planet surface with continents.';

function wrapPrompt(composition) {
  return RENDER_PREAMBLE + composition.trim() + NEGATIVE_SUFFIX;
}

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

async function readCoverPrompt(slug) {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  let raw;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch {
    fail(`Article introuvable : ${file}`);
  }
  const { data: fm } = matter(raw);
  if (!fm.coverPrompt || !String(fm.coverPrompt).trim()) {
    fail(`Champ "coverPrompt" absent/vide dans ${file}. Ajoute-le (brief nommant une teinte, voir docs/dynasty-cover-style-guide.md §4) ou passe --prompt.`);
  }
  return String(fm.coverPrompt).trim();
}

// Même pattern que scripts/gsc-fetch.mjs : Node ne charge pas .env tout seul.
let dotenvCache = null;
async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (dotenvCache === null) {
    try {
      dotenvCache = await fs.readFile(path.resolve('.env'), 'utf8');
    } catch {
      dotenvCache = '';
    }
  }
  const line = dotenvCache.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  if (!line) return null;
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
}

function parseArgs(argv) {
  const o = {
    slug: null,
    prompt: null,
    fromArticle: false,
    raw: false,
    wrap: null, // null = auto (wrap sauf --raw) ; true forcé avec --prompt
    model: DEFAULT_MODEL,
    out: null,
    width: 1600,
    height: 960,
    dry: false,
    steps: 8, // flux-1-schnell : max autorisé, meilleure qualité (défaut API : 4)
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--slug') o.slug = argv[++i];
    else if (a === '--prompt') o.prompt = argv[++i];
    else if (a === '--from-article') o.fromArticle = true;
    else if (a === '--raw') o.raw = true;
    else if (a === '--wrap') o.wrap = true;
    else if (a === '--model') o.model = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--width') o.width = parseInt(argv[++i], 10);
    else if (a === '--height') o.height = parseInt(argv[++i], 10);
    else if (a === '--steps') o.steps = parseInt(argv[++i], 10);
    else if (a === '--dry') o.dry = true;
    else fail(`Option inconnue : ${a}`);
  }
  if (!o.slug) fail('--slug <slug-article> requis.');
  if (!o.prompt && !o.fromArticle) {
    fail('Fournir soit --prompt "<...>", soit --from-article (lit coverPrompt du .md).');
  }
  if (!o.out) o.out = `public/uploads/blog/covers/${o.slug}.webp`;
  return o;
}

async function resolvePrompt(opts) {
  if (opts.prompt) {
    return opts.wrap ? wrapPrompt(opts.prompt) : opts.prompt;
  }
  const composition = await readCoverPrompt(opts.slug);
  return opts.raw ? composition : wrapPrompt(composition);
}

async function callWorkersAI(accountId, token, model, prompt, steps) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, steps }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    fail(`Cloudflare Workers AI a répondu ${res.status} : ${text.slice(0, 400)}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!json.success) fail(`Échec Workers AI : ${JSON.stringify(json.errors || json)}`);
    const b64 = json.result?.image;
    if (!b64) fail(`Réponse JSON inattendue (pas de result.image) : ${JSON.stringify(json).slice(0, 400)}`);
    return Buffer.from(b64, 'base64');
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const finalPrompt = await resolvePrompt(opts);
  const source = opts.prompt ? '--prompt' : `coverPrompt (${opts.raw ? 'raw' : 'habillé'})`;

  if (finalPrompt.length > 2048) {
    fail(`Prompt final trop long pour Cloudflare Workers AI (${finalPrompt.length}/2048 caractères) — raccourcir le coverPrompt.`);
  }

  if (opts.dry) {
    console.log('\n──────── DRY-RUN (aucun appel API, aucune écriture) ────────\n');
    console.log(`Modèle  : ${opts.model}`);
    console.log(`Source  : ${source}`);
    console.log(`Prompt  : ${finalPrompt}`);
    console.log(`Sortie  : ${opts.out} (${opts.width}x${opts.height})\n`);
    return;
  }

  const accountId = await loadEnvVar('CLOUDFLARE_ACCOUNT_ID');
  const token = await loadEnvVar('CLOUDFLARE_API_TOKEN');
  if (!accountId) fail('CLOUDFLARE_ACCOUNT_ID introuvable (ni env, ni .env).');
  if (!token) fail('CLOUDFLARE_API_TOKEN introuvable (ni env, ni .env).');

  console.log(`→ Génération via Cloudflare Workers AI (${opts.model}, steps=${opts.steps})…`);
  const raw = await callWorkersAI(accountId, token, opts.model, finalPrompt, opts.steps);

  const outDir = path.dirname(opts.out);
  await fs.mkdir(outDir, { recursive: true });

  await sharp(raw)
    .resize({ width: opts.width, height: opts.height, fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(opts.out);

  console.log(`\n✅ Cover écrite : ${opts.out} (${opts.width}x${opts.height})`);
  console.log(`   → Référencer dans le frontmatter de l'article : image: "/${path.relative('public', opts.out)}"`);
  console.log('   → Relire visuellement avant de committer.\n');
}

main().catch((e) => fail(e.stack || e.message));
