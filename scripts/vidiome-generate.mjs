#!/usr/bin/env node
/**
 * Vidiome — YouTube -> article structuré (JSON brut).
 *
 * Module DÉTERMINISTE de la chaîne éditoriale (adapté du script du même nom dans le
 * repo beryldesign, même compte/API Vidiome) : génère un article Vidiome pour CHAQUE
 * URL YouTube fournie et sauvegarde le JSON brut. Il NE publie RIEN et ne fusionne
 * RIEN : il produit les matières premières que l'étape de rédaction (skill
 * dynasty-article) transforme ensuite en un article de synthèse Markdown.
 *
 * Usage :
 *   node scripts/vidiome-generate.mjs <url...> --slug jeu-navigateur-2026
 *   node scripts/vidiome-generate.mjs <url1> <url2> <url3> --lang fr --out .vidiome-cache/mon-theme
 *   node scripts/vidiome-generate.mjs <url> --dry            # n'appelle pas l'API
 *
 * Options :
 *   --slug <s>     nom du thème -> dossier de sortie .vidiome-cache/<s> (défaut: "run")
 *   --out <dir>    dossier de sortie explicite (prioritaire sur --slug)
 *   --base <url>   base de l'API (défaut: www.vidiome.com ; ex. http://localhost:3000
 *                  pour un serveur Vidiome local). Aussi via env VIDIOME_API_BASE.
 *   --lang <code>  langue de l'article : en fr es de pt ru uk tr hi id (défaut: fr)
 *   --delay <ms>   pause entre 2 appels réussis (défaut: 7000 ; le quota est 10/min)
 *   --retries <n>  tentatives sur 502/429/erreur réseau (défaut: 4)
 *   --dry          n'appelle pas l'API : montre seulement ce qui serait fait
 *
 * La clé API est lue depuis .env (VIDIOME_API_KEY) — jamais affichée ni loggée.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// NB: l'apex vidiome.com fait un 307 -> www (Vercel). On tape www directement et on
// refuse de suivre les redirections (redirect:'manual') : une redirection suivie
// par fetch masquait l'erreur réelle.
const DEFAULT_BASE = 'https://www.vidiome.com';
const articlesUrlFrom = (base) => `${base.replace(/\/+$/, '')}/api/v1/articles`;
const SUPPORTED_LANGS = ['en', 'fr', 'es', 'de', 'pt', 'ru', 'uk', 'tr', 'hi', 'id'];

function parseArgs(argv) {
  const opts = {
    urls: [],
    lang: 'fr',
    out: null,
    slug: 'run',
    base: process.env.VIDIOME_API_BASE || DEFAULT_BASE,
    delay: 7000,
    retries: 4,
    dry: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') opts.dry = true;
    else if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--slug') opts.slug = argv[++i];
    else if (a === '--base') opts.base = argv[++i];
    else if (a === '--delay') opts.delay = Number(argv[++i]);
    else if (a === '--retries') opts.retries = Number(argv[++i]);
    else if (a.startsWith('--')) fail(`Option inconnue : ${a}`);
    else opts.urls.push(a);
  }
  return opts;
}

function fail(msg, code = 1) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(code);
}

async function loadApiKey() {
  if (process.env.VIDIOME_API_KEY) return process.env.VIDIOME_API_KEY.trim();
  let raw;
  try {
    raw = await fs.readFile(path.resolve('.env'), 'utf8');
  } catch {
    fail('VIDIOME_API_KEY introuvable (ni dans l\'environnement, ni dans .env).');
  }
  const line = raw.split(/\r?\n/).find((l) => l.startsWith('VIDIOME_API_KEY='));
  if (!line) fail('VIDIOME_API_KEY absente du .env.');
  const key = line.slice('VIDIOME_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
  if (!key) fail('VIDIOME_API_KEY vide dans le .env.');
  return key;
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/);
    if (m) return m[1];
  } catch {
    /* URL invalide */
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOne(url, { apiUrl, apiKey, lang, retries }) {
  const body = JSON.stringify({ youtubeUrl: url, language: lang });
  for (let attempt = 1; attempt <= retries; attempt++) {
    let res;
    try {
      res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body,
        redirect: 'manual',
      });
    } catch (e) {
      if (attempt < retries) {
        const wait = 2000 * attempt;
        console.warn(`   ⚠ réseau (${e.message}) — retry ${attempt}/${retries - 1} dans ${wait}ms`);
        await sleep(wait);
        continue;
      }
      return { ok: false, kind: 'network', message: e.message };
    }

    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }

    if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
      return {
        ok: false,
        kind: 'redirect',
        message: `${apiUrl} redirige — utilise l'URL finale (ex. --base https://www.vidiome.com)`,
      };
    }

    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* corps non-JSON */
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 60;
      if (attempt < retries) {
        console.warn(`   ⚠ 429 rate-limit — pause ${retryAfter}s puis retry ${attempt}/${retries - 1}`);
        await sleep(retryAfter * 1000);
        continue;
      }
      return { ok: false, kind: 'rate-limit', status: 429, detail };
    }
    if (res.status === 502) {
      if (attempt < retries) {
        const wait = 3000 * attempt;
        console.warn(`   ⚠ 502 upstream — retry ${attempt}/${retries - 1} dans ${wait}ms`);
        await sleep(wait);
        continue;
      }
      return { ok: false, kind: 'upstream', status: 502, detail };
    }
    return { ok: false, kind: 'http', status: res.status, detail };
  }
  return { ok: false, kind: 'exhausted' };
}

const FATAL = { 401: 'Clé API invalide/révoquée', 402: 'Crédits insuffisants', 403: 'Compte rétrogradé (plan gratuit)' };

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.urls.length === 0) fail('Aucune URL YouTube fournie.\n   Ex: node scripts/vidiome-generate.mjs <url1> <url2> --slug mon-theme');
  if (!SUPPORTED_LANGS.includes(opts.lang)) fail(`Langue non supportée : ${opts.lang} (attendu : ${SUPPORTED_LANGS.join(', ')})`);

  const items = opts.urls.map((url) => ({ url, videoId: extractVideoId(url) }));
  const bad = items.filter((it) => !it.videoId);
  if (bad.length) fail(`URL(s) YouTube invalide(s) : ${bad.map((b) => b.url).join(', ')}`);

  const outDir = opts.out || path.join('.vidiome-cache', opts.slug);
  await fs.mkdir(outDir, { recursive: true });
  const apiUrl = articlesUrlFrom(opts.base);

  console.log(`\n▶ Vidiome — ${items.length} vidéo(s) | langue=${opts.lang} | base=${opts.base} | out=${outDir}${opts.dry ? ' | DRY-RUN' : ''}`);

  if (opts.dry) {
    items.forEach((it, i) => console.log(`   ${i + 1}. ${it.url}  (id=${it.videoId})`));
    console.log('\n(dry-run : aucun appel API, aucun crédit dépensé)\n');
    return;
  }

  const apiKey = await loadApiKey();
  const summary = [];
  let lastCreditsRemaining = null;

  for (let i = 0; i < items.length; i++) {
    const { url, videoId } = items[i];
    console.log(`\n[${i + 1}/${items.length}] ${url}`);
    const r = await generateOne(url, { apiUrl, apiKey, lang: opts.lang, retries: opts.retries });

    if (r.ok) {
      const file = path.join(outDir, `${videoId}.json`);
      await fs.writeFile(file, JSON.stringify(r.data, null, 2));
      lastCreditsRemaining = r.data.creditsRemaining ?? lastCreditsRemaining;
      console.log(`   ✅ "${r.data.title}" — ${r.data.sections?.length ?? 0} sections | ${r.data.creditsUsed} crédits (reste ${r.data.creditsRemaining}) -> ${file}`);
      summary.push({ url, videoId, ok: true, title: r.data.title, sections: r.data.sections?.length ?? 0, file });
    } else {
      const fatal = r.status && FATAL[r.status];
      const accountKO = r.status === 500 && /user not found/i.test(r.detail || '');
      const label = accountKO
        ? 'Clé reconnue mais non rattachée à un compte Vidiome (régénérer la clé dans le dashboard)'
        : r.status === 404
          ? 'Pas de transcript YouTube (choisir une autre vidéo)'
          : (fatal || `${r.kind}${r.status ? ' ' + r.status : ''}`);
      console.error(`   ❌ ${label}${r.detail ? ' — ' + r.detail : ''}${r.message ? ' — ' + r.message : ''}`);
      summary.push({ url, videoId, ok: false, error: label, status: r.status ?? null });
      if (fatal) {
        console.error(`\n⛔ Erreur bloquante (${r.status}) — arrêt du run.`);
        break;
      }
    }

    if (i < items.length - 1) await sleep(opts.delay);
  }

  const indexFile = path.join(outDir, '_index.json');
  await fs.writeFile(indexFile, JSON.stringify({ lang: opts.lang, generatedFrom: 'vidiome-generate.mjs', items: summary }, null, 2));

  const ok = summary.filter((s) => s.ok).length;
  const ko = summary.length - ok;
  console.log(`\n─── Résumé : ${ok} succès, ${ko} échec(s)${lastCreditsRemaining != null ? ` | crédits restants : ${lastCreditsRemaining}` : ''}`);
  console.log(`Index : ${indexFile}\n`);

  if (ok === 0) process.exit(2);
}

main().catch((e) => fail(e.stack || e.message, 1));
