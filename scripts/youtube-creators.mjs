#!/usr/bin/env node
/**
 * Dresse la liste des créateurs YouTube francophones à contacter pour l'acquisition de
 * joueurs. Deux profils :
 *   - `navigateur` (défaut) : créateurs grand public, 10 k abonnés et plus, qui ont publié
 *     dans l'année des vidéos « jeux navigateur » (tests, tops, jeux gratuits sans
 *     téléchargement, .io, Poki / CrazyGames). Dynasty Nova se joue dans le navigateur :
 *     c'est le format où il entre sans effort pour le créateur ni pour son public.
 *   - `niche` : petites chaînes (1 k à 100 k) sur OGame, la stratégie spatiale et les 4X.
 * Passe par l'API YouTube Data v3 : le site youtube.com n'est pas joignable depuis les
 * sessions cloud, googleapis.com l'est.
 *
 * Pour chaque chaîne : abonnés, vues moyennes des vidéos qui collent au thème, rapport
 * vues / abonnés, dernière mise en ligne, vidéos trouvées, e-mail et liens publics de la
 * description, et un lien tracé vers le jeu propre à la chaîne
 * (`utm_source=youtube&utm_medium=creator&utm_campaign=<chaîne>`) pour mesurer ensuite
 * dans PostHog qui amène des joueurs (`npm run posthog:fetch`, Createurs.csv). Écartées :
 * chaînes « conçues pour les enfants », chaînes d'éditeurs et de médias, chaînes dont aucun
 * titre trouvé n'est en français.
 *
 * Sorties : la liste complète dans .youtube-cache/ (gitignored, avec les e-mails), et le
 * suivi des prises de contact dans editorial/createurs/suivi.csv (commité, sans e-mail) :
 * les nouvelles chaînes y entrent en statut « à qualifier », celles déjà suivies gardent
 * leur statut et leurs notes, seuls leurs chiffres sont mis à jour. Le skill `createurs`
 * part de ce fichier.
 *
 * Prérequis (une seule fois, dans Google Cloud, le projet du compte de service GSC convient) :
 *   1. APIs & Services > Library : activer « YouTube Data API v3 ».
 *   2. APIs & Services > Credentials : créer une clé API, la restreindre à cette API.
 *
 * Quota : 10 000 unités par jour. Une recherche coûte 100 unités, le reste 1 unité par
 * appel ; le profil `navigateur` (14 requêtes, 2 pages chacune) prend environ 3 000 unités,
 * le profil `niche` (16 requêtes, 1 page) environ 1 700.
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   YOUTUBE_API_KEY=AIza...
 *
 * Usage :
 *   node scripts/youtube-creators.mjs                       # profil navigateur : 10 k abonnés et plus, vidéos des 365 derniers jours
 *   node scripts/youtube-creators.mjs --profil niche        # OGame / 4X, 1 k à 100 k abonnés
 *   node scripts/youtube-creators.mjs --min 50000 --max 0 --days 180   # --max 0 : pas de plafond
 *   node scripts/youtube-creators.mjs --query "hades star" --query "eve online fr"   # remplace les requêtes par défaut
 *   node scripts/youtube-creators.mjs --pages 2 --out .youtube-cache
 *   node scripts/youtube-creators.mjs --sans-suivi          # ne touche pas à editorial/createurs/suivi.csv
 *   node scripts/youtube-creators.mjs --check               # vérifie la clé (1 unité de quota) et s'arrête
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API = "https://www.googleapis.com/youtube/v3";

// Requête -> poids dans le score : plus la vidéo est proche de Dynasty Nova (navigateur,
// gratuit, stratégie), plus la chaîne a de chances d'avoir le bon public.
const BROWSER_QUERIES = [
  ["jeu navigateur stratégie", 5],
  ["jeux navigateur", 4],
  ["jeu navigateur", 4],
  ["je teste des jeux navigateur", 4],
  ["meilleurs jeux navigateur", 4],
  ["jeux sur navigateur gratuits", 4],
  ["jeux gratuits sans téléchargement", 3],
  ["jeux en ligne gratuits", 3],
  ["jeux navigateur bizarres", 3],
  ["jeux .io", 2],
  ["jeux poki", 2],
  ["jeux crazygames", 2],
  ["jeux flash", 2],
  ["ogame", 2],
];

const NICHE_QUERIES = [
  ["ogame", 5],
  ["ogame fr", 5],
  ["jeu comme ogame", 5],
  ["jeu navigateur stratégie", 4],
  ["jeu de stratégie spatiale", 4],
  ["jeu stratégie spatiale gratuit", 4],
  ["jeu spatial navigateur", 4],
  ["travian fr", 3],
  ["jeu 4x spatial", 3],
  ["stellaris fr", 2],
  ["endless space 2 fr", 2],
  ["jeu de stratégie mobile gratuit", 2],
  ["star trek fleet command fr", 2],
  ["jeu de gestion gratuit navigateur", 2],
  ["meilleurs jeux de stratégie gratuits", 2],
  ["x4 foundations fr", 1],
];

const PROFILES = {
  navigateur: { queries: BROWSER_QUERIES, min: 10000, max: 0, pages: 2, order: "viewCount" },
  niche: { queries: NICHE_QUERIES, min: 1000, max: 100000, pages: 1, order: "relevance" },
};

// Éditeurs, portails et médias : ils ne relaient pas un jeu concurrent, inutile de les démarcher.
const EXCLUDED = /gameforge|poki|crazygames|jeuxvideo\.com|jvcom|gamekult|millenium|gameblog|ign france|dynasty ?nova|astro ?nova/i;

// Mots outils et accents : un titre qui n'en a aucun n'est très probablement pas en français.
const FRENCH = /[èêàùçœ]|\b(les|des|du|une|jeux?|je|j|est|pour|avec|sur|et|qui|pas|mon|ce|cette|gratuits?|meilleurs?|navigateur)\b/i;

const SUIVI = "editorial/createurs/suivi.csv";
const SUIVI_COLS = [
  "chaine", "url", "profil", "abonnes", "vues_moy_theme", "score", "lien_trace",
  "statut", "contact_le", "relance_le", "reponse", "offre", "video_le", "notes", "vu_le",
];

const FR_COUNTRIES = new Set(["FR", "BE", "CH", "CA", "LU", "MC", "MA", "TN", "SN", "CI", "DZ"]);

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

let dotenvCache = null;
async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (dotenvCache === null) {
    try {
      dotenvCache = await fs.readFile(path.resolve(".env"), "utf8");
    } catch {
      dotenvCache = "";
    }
  }
  const line = dotenvCache.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  if (!line) return null;
  return line
    .slice(name.length + 1)
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseArgs(argv) {
  const profil = argv.includes("--profil") ? argv[argv.indexOf("--profil") + 1] : "navigateur";
  if (!PROFILES[profil]) fail(`--profil attend ${Object.keys(PROFILES).join(" ou ")}.`);
  const { queries, ...defaults } = PROFILES[profil];
  const o = { profil, ...defaults, days: 365, out: ".youtube-cache", queries: [], suivi: true, check: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--profil") i++;
    else if (argv[i] === "--sans-suivi") o.suivi = false;
    else if (argv[i] === "--check") o.check = true;
    else if (argv[i] === "--min") o.min = Number(argv[++i]);
    else if (argv[i] === "--max") o.max = Number(argv[++i]);
    else if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--pages") o.pages = Number(argv[++i]);
    else if (argv[i] === "--order") o.order = argv[++i];
    else if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--query") o.queries.push([argv[++i], 3]);
    else fail(`Option inconnue : ${argv[i]}`);
  }
  for (const k of ["min", "max", "days", "pages"]) {
    if (!Number.isInteger(o[k]) || o[k] < 0) fail(`--${k} attend un entier positif.`);
  }
  if (o.pages < 1 || o.pages > 5) fail("--pages attend un entier de 1 à 5.");
  if (!["relevance", "viewCount", "date"].includes(o.order)) fail("--order attend relevance, viewCount ou date.");
  if (!o.queries.length) o.queries = queries;
  return o;
}

let quotaUsed = 0;
async function yt(apiKey, endpoint, params, cost = 1) {
  const url = new URL(`${API}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey);
  quotaUsed += cost;
  // Erreurs réseau et 5xx : passagères, on réessaie deux fois (2 s puis 4 s).
  let res;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(url);
      if (res.status < 500 || attempt === 2) break;
    } catch (e) {
      if (attempt === 2) fail(`YouTube ${endpoint} injoignable : ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = body?.error?.errors?.[0]?.reason || res.status;
    const msg = body?.error?.message || res.statusText;
    if (reason === "quotaExceeded") fail(`Quota YouTube épuisé pour aujourd'hui (${quotaUsed} unités dans ce run).`);
    fail(`YouTube ${endpoint} : ${reason} — ${msg}`);
  }
  return body;
}

function chunks(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function slug(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function daysSince(iso) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
}

function contactsFrom(description) {
  const emails = [...new Set(description.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [])];
  const links = [...new Set(description.match(/https?:\/\/[^\s)]+/g) || [])].filter((u) =>
    /discord|twitch|twitter|x\.com|instagram|tiktok|linktr|beacons|carrd/i.test(u),
  );
  return { emails, links };
}

function csvCell(v) {
  const s = Array.isArray(v) ? v.join(" | ") : String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(cols, rows) {
  return [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";
}

// Lecteur CSV minimal (guillemets, virgules et retours à la ligne dans les notes).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") row.push(cell), (cell = "");
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += ch;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const [header = [], ...body] = rows.filter((r) => r.some((c) => c !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// Ajoute les nouvelles chaînes au suivi, met à jour les chiffres des autres sans toucher à
// leur statut ni à leurs notes. Renvoie le suivi par URL pour annoter la sortie.
async function mergeSuivi(rows, profil) {
  let existing = [];
  try {
    existing = parseCsv(await fs.readFile(SUIVI, "utf8"));
  } catch {
    // Premier run : le fichier sera créé.
  }
  const byUrl = new Map(existing.map((r) => [r.url, r]));
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;
  for (const r of rows) {
    const prev = byUrl.get(r.url);
    const numbers = { chaine: r.chaine, abonnes: r.abonnes, vues_moy_theme: r.vues_moy_theme, score: r.score, vu_le: today };
    if (prev) Object.assign(prev, numbers);
    else {
      byUrl.set(r.url, { ...numbers, url: r.url, profil, lien_trace: r.lien_trace, statut: "à qualifier" });
      added++;
    }
  }
  const all = [...byUrl.values()].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  await fs.mkdir(path.dirname(SUIVI), { recursive: true });
  await fs.writeFile(SUIVI, toCsv(SUIVI_COLS, all));
  console.log(`🗂️  ${SUIVI} : ${added} nouvelles chaînes, ${all.length} au total`);
  return byUrl;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = await loadEnvVar("YOUTUBE_API_KEY");
  if (!apiKey) fail("YOUTUBE_API_KEY manquante (voir l'en-tête du script et .env.example).");

  if (opts.check) {
    // Chaîne YouTube officielle de Google pour les développeurs : toujours présente.
    const res = await yt(apiKey, "channels", { part: "id", id: "UC_x5XG1OV2P6uZZ5FSM9Ttw" });
    if (!res.items?.length) fail("La clé répond mais l'API ne renvoie rien : vérifier les restrictions de la clé.");
    console.log("✅ Clé YouTube valide, API YouTube Data v3 activée.");
    return;
  }

  const publishedAfter = new Date(Date.now() - opts.days * 86400000).toISOString();

  // 1. Recherche : vidéos récentes en français sur chaque thème, regroupées par chaîne.
  const byChannel = new Map();
  for (const [q, weight] of opts.queries) {
    let pageToken;
    for (let p = 0; p < opts.pages; p++) {
      const res = await yt(
        apiKey,
        "search",
        {
          part: "snippet",
          type: "video",
          q,
          maxResults: 50,
          relevanceLanguage: "fr",
          regionCode: "FR",
          publishedAfter,
          order: opts.order,
          pageToken,
        },
        100,
      );
      for (const item of res.items || []) {
        const id = item.snippet.channelId;
        if (!byChannel.has(id)) byChannel.set(id, { videos: new Map(), relevance: 0, queries: new Set() });
        const c = byChannel.get(id);
        if (!c.videos.has(item.id.videoId)) {
          c.videos.set(item.id.videoId, { title: item.snippet.title, publishedAt: item.snippet.publishedAt });
          c.relevance += weight;
        }
        c.queries.add(q);
      }
      pageToken = res.nextPageToken;
      if (!pageToken) break;
    }
    console.log(`🔎 « ${q} » : ${byChannel.size} chaînes cumulées`);
  }

  // 2. Chaînes : taille, pays, langue, description (contacts), playlist des mises en ligne.
  const channels = [];
  for (const ids of chunks([...byChannel.keys()], 50)) {
    const res = await yt(apiKey, "channels", {
      part: "snippet,statistics,contentDetails,brandingSettings,status",
      id: ids.join(","),
      maxResults: 50,
    });
    channels.push(...(res.items || []));
  }

  const kept = channels.filter((ch) => {
    const subs = Number(ch.statistics.subscriberCount || 0);
    if (ch.statistics.hiddenSubscriberCount) return false;
    // Public enfant : commentaires fermés, pas la cible d'un 4X, et règles publicitaires à part.
    if (ch.status?.madeForKids) return false;
    if (EXCLUDED.test(ch.snippet.title) || EXCLUDED.test(ch.snippet.customUrl || "")) return false;
    if (![...byChannel.get(ch.id).videos.values()].some((v) => FRENCH.test(v.title))) return false;
    if (subs < opts.min || (opts.max && subs > opts.max)) return false;
    const country = ch.snippet.country || ch.brandingSettings?.channel?.country;
    const lang = ch.snippet.defaultLanguage || ch.brandingSettings?.channel?.defaultLanguage || "";
    // Pays absent : fréquent, on garde (les vidéos viennent déjà d'une recherche en français).
    if (country && !FR_COUNTRIES.has(country) && !lang.startsWith("fr")) return false;
    return true;
  });
  const range = opts.max ? `${opts.min} à ${opts.max} abonnés` : `${opts.min} abonnés et plus`;
  console.log(`📺 ${channels.length} chaînes trouvées, ${kept.length} dans la cible (profil ${opts.profil}, ${range}, francophones)`);

  // 3. Activité : dernières mises en ligne (régularité) et vues des vidéos sur le thème.
  const allVideoIds = kept.flatMap((ch) => [...byChannel.get(ch.id).videos.keys()]);
  const views = new Map();
  for (const ids of chunks(allVideoIds, 50)) {
    const res = await yt(apiKey, "videos", { part: "statistics", id: ids.join(","), maxResults: 50 });
    for (const v of res.items || []) views.set(v.id, Number(v.statistics.viewCount || 0));
  }

  const rows = [];
  for (const ch of kept) {
    const found = byChannel.get(ch.id);
    const uploads = ch.contentDetails?.relatedPlaylists?.uploads;
    let lastUpload = null;
    let uploads90 = 0;
    if (uploads) {
      const res = await yt(apiKey, "playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: 20 });
      const dates = (res.items || []).map((i) => i.contentDetails.videoPublishedAt).filter(Boolean).sort().reverse();
      lastUpload = dates[0] || null;
      uploads90 = dates.filter((d) => daysSince(d) <= 90).length;
    }

    const subs = Number(ch.statistics.subscriberCount);
    const themeViews = [...found.videos.keys()].map((id) => views.get(id) || 0);
    const avgViews = themeViews.length ? Math.round(themeViews.reduce((a, b) => a + b, 0) / themeViews.length) : 0;
    const viewRatio = subs ? avgViews / subs : 0;
    const handle = ch.snippet.customUrl || ch.id;
    const { emails, links } = contactsFrom(ch.snippet.description || "");
    const sinceLast = lastUpload ? daysSince(lastUpload) : null;

    // Score : thème (poids des requêtes), portée (vues moyennes, en ordre de grandeur : 1 k
    // vaut 0, 1 M vaut 24), audience réelle (vues / abonnés, plafonné), chaîne active, et un
    // contact direct qui épargne une recherche manuelle.
    const score =
      Math.min(found.relevance, 25) * 2 +
      Math.max(0, Math.log10(avgViews + 1) - 3) * 8 +
      Math.min(viewRatio, 1.5) * 20 +
      (sinceLast === null ? 0 : sinceLast <= 30 ? 15 : sinceLast <= 90 ? 8 : 0) +
      Math.min(uploads90, 12) +
      (emails.length ? 5 : 0);

    rows.push({
      score: Math.round(score),
      chaine: ch.snippet.title,
      url: `https://www.youtube.com/${handle.startsWith("@") ? handle : `channel/${ch.id}`}`,
      abonnes: subs,
      pays: ch.snippet.country || "",
      vues_moy_theme: avgViews,
      ratio_vues_abonnes: Number(viewRatio.toFixed(2)),
      derniere_video_jours: sinceLast ?? "",
      videos_90j: uploads90,
      videos_theme: [...found.videos.values()]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 5)
        .map((v) => `${v.publishedAt.slice(0, 10)} ${v.title}`),
      requetes: [...found.queries],
      emails,
      liens: links,
      lien_trace: `https://play.dynastynova.com/?utm_source=youtube&utm_medium=creator&utm_campaign=${slug(handle)}`,
    });
  }
  rows.sort((a, b) => b.score - a.score);

  if (opts.suivi && rows.length) {
    const suivi = await mergeSuivi(rows, opts.profil);
    for (const r of rows) r.statut = suivi.get(r.url)?.statut || "";
  }

  // 4. Sorties.
  await fs.mkdir(opts.out, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const jsonPath = path.join(opts.out, `creators-${opts.profil}-${stamp}.json`);
  const csvPath = path.join(opts.out, `creators-${opts.profil}-${stamp}.csv`);
  await fs.writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), options: opts, rows }, null, 2));
  await fs.writeFile(csvPath, toCsv(Object.keys(rows[0] || { score: 0 }), rows));

  console.log(`\n🏁 ${rows.length} créateurs, ${quotaUsed} unités de quota utilisées`);
  console.log(`   ${csvPath}\n   ${jsonPath}\n`);
  for (const r of rows.slice(0, 20)) {
    console.log(
      `${String(r.score).padStart(3)}  ${r.chaine} — ${r.abonnes.toLocaleString("fr-FR")} abonnés, ` +
        `${r.vues_moy_theme.toLocaleString("fr-FR")} vues moy. thème, dernière vidéo il y a ${r.derniere_video_jours} j` +
        `${r.emails.length ? `, ${r.emails[0]}` : ""}${r.statut && r.statut !== "à qualifier" ? ` [${r.statut}]` : ""}`,
    );
  }
}

main().catch((e) => fail(e.stack || e.message));
