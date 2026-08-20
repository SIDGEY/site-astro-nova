#!/usr/bin/env node
/**
 * Backlog éditorial léger pour le skill `dynasty-article`. Pas de scoring pondéré par
 * cluster (pas justifié à l'échelle de ce blog, ~8 articles) : juste un backlog
 * persistant (editorial/backlog.jsonl, gitignored) qui évite de reproposer un sujet
 * déjà traité ou rejeté, alimenté par six signaux :
 *
 *   1. Activité de dev du jeu (.game-activity-cache, scripts/game-activity-fetch.mjs)
 *      — PR "feat"/"fix" mergées sur Dynasty-Nova/Frontend + Dynasty-Nova/Backend,
 *      pas encore couvertes -> angle "dev-diary" (le seul mode qui crée un contenu
 *      non copiable, ancré sur une fonctionnalité réellement livrée).
 *   2. GSC play-astronova.com (legacy "Astro Nova") — quelles requêtes/pages avaient
 *      déjà de la demande sous l'ancienne marque, pour ne pas perdre ce capital en
 *      migrant vers Dynasty Nova.
 *   3. GSC dynastynova.com — requêtes à fort impressions / faible position, pas
 *      encore couvertes par un article.
 *   4. GA4 dynastynova.com (filtré par hostName, la propriété 468587506 est partagée
 *      avec le jeu) — quelles pages du nouveau site engagent déjà, pour prioriser un
 *      refresh plutôt qu'un article neuf le cas échéant.
 *   5. Beryldesign — cluster "jeux" (beryldesign.fr écrit déjà sur Dynasty Nova/OGame ;
 *      son cluster jeux fait 78% des clics du site — cf. son editorial/clusters.json).
 *      Croisé avec ses propres exports GSC/GA4 (même compte de service) pour
 *      remonter les angles PROUVÉS pas encore couverts sur dynastynova.com.
 *   6. Mots-clés longue traîne de docs/seo-checklist.md (section "Mots-clés cibles"
 *      uniquement) non encore couverts.
 *
 * Usage :
 *   node scripts/dynasty-ideas.mjs --generate --apply
 *   node scripts/dynasty-ideas.mjs --list [--status proposed] [--json]
 *   node scripts/dynasty-ideas.mjs --queue <id...> --apply
 *   node scripts/dynasty-ideas.mjs --claim <id> --apply
 *   node scripts/dynasty-ideas.mjs --complete <id> --slug <s> --apply
 *   node scripts/dynasty-ideas.mjs --reject <id> --reason "..." --apply
 *   node scripts/dynasty-ideas.mjs --release <id> --apply
 */

import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const BACKLOG_PATH = path.join(ROOT, "editorial", "backlog.jsonl");
const ARTICLES_DIR = path.join(ROOT, "src", "content", "articles");
const SEO_CHECKLIST = path.join(ROOT, "docs", "seo-checklist.md");

const BERYLDESIGN_ROOT = "/Users/ghambourger/Documents/Github/beryldesign/beryldesign";
const BERYLDESIGN_POSTS = path.join(BERYLDESIGN_ROOT, "src", "content", "post");
const BERYLDESIGN_GSC_CACHE = path.join(BERYLDESIGN_ROOT, ".gsc-cache");
const BERYLDESIGN_GA4_CACHE = path.join(BERYLDESIGN_ROOT, ".ga4-cache");

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const o = { apply: false, json: false, status: null, ids: [] };
  let cmd = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--generate") cmd = "generate";
    else if (a === "--list") cmd = "list";
    else if (["--queue", "--claim", "--complete", "--reject", "--release"].includes(a)) {
      cmd = a.slice(2);
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) o.ids.push(argv[++i]);
    } else if (a === "--apply") o.apply = true;
    else if (a === "--json") o.json = true;
    else if (a === "--status") o.status = argv[++i];
    else if (a === "--slug") o.slug = argv[++i];
    else if (a === "--reason") o.reason = argv[++i];
    else fail(`Option inconnue : ${a}`);
  }
  o.cmd = cmd;
  return o;
}

// --- backlog persistence ---------------------------------------------------

async function loadBacklog() {
  try {
    const raw = await fs.readFile(BACKLOG_PATH, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

async function saveBacklog(items) {
  await fs.mkdir(path.dirname(BACKLOG_PATH), { recursive: true });
  await fs.writeFile(BACKLOG_PATH, items.map((i) => JSON.stringify(i)).join("\n") + "\n");
}

function shortId(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 8);
}

// --- dedup against the existing corpus ---------------------------------------
//
// Comparing by title-word-overlap (>= 2 shared significant words) rather than
// "does any single keyword appear anywhere in any article body" — the latter
// false-positives constantly (e.g. "guide" or "navigateur" alone matches almost
// any article and silently drops real candidates).

const STOPWORDS = new Set([
  "dans", "pour", "avec", "cette", "notre", "votre", "leur", "leurs", "vous",
  "nous", "elle", "il", "les", "des", "une", "un", "de", "du", "la", "le",
]);

function significantWords(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));
}

async function loadExistingArticleTitleTokens() {
  let files = [];
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch {
    return [];
  }
  const titleSets = [];
  for (const f of files.filter((f) => f.endsWith(".md"))) {
    const raw = await fs.readFile(path.join(ARTICLES_DIR, f), "utf8");
    const fm = parseFrontmatter(raw);
    if (fm.title) titleSets.push(new Set(significantWords(fm.title)));
  }
  return titleSets;
}

function overlapsExisting(candidateTitle, existingTitleTokenSets, minOverlap = 2) {
  const candidateWords = significantWords(candidateTitle);
  return existingTitleTokenSets.some((existing) => {
    const overlap = candidateWords.filter((w) => existing.has(w)).length;
    return overlap >= minOverlap;
  });
}

// --- shared helpers -----------------------------------------------------------

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return fm;
}

function latestDir(baseDir, prefix) {
  if (!fssync.existsSync(baseDir)) return null;
  const dirs = fssync
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(prefix))
    .map((d) => d.name)
    .sort();
  return dirs.length ? path.join(baseDir, dirs[dirs.length - 1]) : null;
}

// Minimal CSV split — good enough here since none of our own generated CSVs quote
// fields containing commas (queries/titles with literal commas are rare and, worst
// case, just misalign one column for that row rather than crash).
function parseCsv(text) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split(","));
}

// --- signal 1: game dev activity ----------------------------------------------

async function gameActivitySignals() {
  const dir = path.join(ROOT, ".game-activity-cache");
  if (!fssync.existsSync(dir)) return [];
  const files = fssync.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  if (!files.length) return [];
  const raw = fssync.readFileSync(path.join(dir, files[files.length - 1]), "utf8");
  const all = JSON.parse(raw);
  // Ne garder que les vraies fonctionnalités/corrections (conventional commits
  // feat/fix) — pas les bump de dépendances, ni le reste du bruit chore/ci/docs.
  return all.filter((pr) => /^(feat|fix)(\(|:)/i.test(pr.title) && !/\bdeps?\b/i.test(pr.title));
}

// --- signal 2: legacy "Astro Nova" GSC (play-astronova.com) -------------------

async function playAstronovaGscSignals() {
  const dir = path.join(ROOT, ".gsc-cache");
  const gscDir = latestDir(dir, "play-astronova.com-Performance-on-Search-");
  if (!gscDir || !fssync.existsSync(path.join(gscDir, "Requêtes.csv"))) return [];
  const rows = parseCsv(fssync.readFileSync(path.join(gscDir, "Requêtes.csv"), "utf8"));
  return rows
    .map(([query, clicks, impressions, ctr, position]) => ({
      query,
      clicks: Number(clicks),
      impressions: Number(impressions),
      position: Number(position),
    }))
    .filter((r) => r.impressions >= 5)
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
}

// --- signal 3: own GSC gaps (dynastynova.com) ---------------------------------

async function ownGscGaps() {
  const dir = path.join(ROOT, ".gsc-cache");
  const gscDir = latestDir(dir, "dynastynova.com-Performance-on-Search-");
  if (!gscDir || !fssync.existsSync(path.join(gscDir, "Requêtes.csv"))) return [];
  const rows = parseCsv(fssync.readFileSync(path.join(gscDir, "Requêtes.csv"), "utf8"));
  return rows
    .map(([query, clicks, impressions, ctr, position]) => ({
      query,
      clicks: Number(clicks),
      impressions: Number(impressions),
      position: Number(position),
    }))
    .filter((r) => r.impressions >= 5 && r.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions);
}

// --- signal 4: own GA4 slice (dynastynova.com, shared property by hostName) ---

async function ownGa4Signals() {
  const dir = path.join(ROOT, ".ga4-cache");
  const ga4Dir = latestDir(dir, "dynastynova.com-GA4-");
  if (!ga4Dir || !fssync.existsSync(path.join(ga4Dir, "Pages.csv"))) return [];
  const rows = parseCsv(fssync.readFileSync(path.join(ga4Dir, "Pages.csv"), "utf8"));
  return rows
    .map(([pagePath, views, , engagementRate]) => ({
      pagePath,
      views: Number(views),
      engagementRate: Number(engagementRate),
    }))
    .filter((r) => r.pagePath.startsWith("/blog/"))
    .sort((a, b) => b.views - a.views);
}

// --- signal 5: beryldesign "jeux" cluster -------------------------------------

async function beryldesignJeuxSignals() {
  if (!fssync.existsSync(BERYLDESIGN_POSTS)) return [];

  const files = fssync.readdirSync(BERYLDESIGN_POSTS).filter((f) => f.endsWith(".md"));
  const jeuxPosts = [];
  for (const f of files) {
    const raw = fssync.readFileSync(path.join(BERYLDESIGN_POSTS, f), "utf8");
    const fm = parseFrontmatter(raw);
    if (fm.category === "jeux" && fm.slug) {
      jeuxPosts.push({ slug: fm.slug, title: fm.title, description: fm.description });
    }
  }

  const gscDir = latestDir(BERYLDESIGN_GSC_CACHE, "beryldesign.fr-Performance-on-Search-");
  const clicksBySlug = new Map();
  if (gscDir && fssync.existsSync(path.join(gscDir, "Pages.csv"))) {
    const rows = parseCsv(fssync.readFileSync(path.join(gscDir, "Pages.csv"), "utf8"));
    for (const [url, clicks, impressions] of rows) {
      const slug = (url.match(/\/post\/([^/?#]+)/) || [])[1];
      if (slug) clicksBySlug.set(slug, { clicks: Number(clicks), impressions: Number(impressions) });
    }
  }

  const ga4Dir = latestDir(BERYLDESIGN_GA4_CACHE, "beryldesign.fr-GA4-Engagement-");
  const viewsBySlug = new Map();
  if (ga4Dir && fssync.existsSync(path.join(ga4Dir, "Pages.csv"))) {
    const rows = parseCsv(fssync.readFileSync(path.join(ga4Dir, "Pages.csv"), "utf8"));
    for (const [pagePath, views] of rows) {
      const slug = (pagePath.match(/\/post\/([^/?#]+)/) || [])[1];
      if (slug) viewsBySlug.set(slug, Number(views));
    }
  }

  return jeuxPosts
    .map((p) => ({
      ...p,
      clicks: clicksBySlug.get(p.slug)?.clicks ?? 0,
      impressions: clicksBySlug.get(p.slug)?.impressions ?? 0,
      views: viewsBySlug.get(p.slug) ?? 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views);
}

// --- signal 6: docs/seo-checklist.md target keywords --------------------------

async function seoChecklistKeywords() {
  let text;
  try {
    text = await fs.readFile(SEO_CHECKLIST, "utf8");
  } catch {
    return [];
  }
  // Section "## 8. Mots-clés cibles" uniquement — les autres "- " du document sont
  // des cases de checklist technique ("- [x] ..."), pas des mots-clés.
  const section = text.split(/^##\s*8\.\s*Mots-clés cibles/m)[1];
  if (!section) return [];
  const stop = section.search(/^---/m);
  const body = stop === -1 ? section : section.slice(0, stop);
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- ") && !l.startsWith("- ["))
    .map((l) => l.replace(/^- /, "").trim())
    .filter(Boolean);
}

// --- generate -----------------------------------------------------------------

async function cmdGenerate(opts) {
  const backlog = await loadBacklog();
  const knownKeys = new Set(backlog.map((i) => i.key));
  const existingTitles = await loadExistingArticleTitleTokens();
  const proposals = [];

  function propose(key, entry) {
    if (knownKeys.has(key)) return;
    if (overlapsExisting(entry.title, existingTitles)) return;
    proposals.push({ id: shortId(key), key, status: "proposed", ...entry });
  }

  console.log("▶ Signal 1/6 — activité de dev du jeu (feat/fix, hors deps)");
  const prs = await gameActivitySignals();
  for (const pr of prs.slice(0, 15)) {
    propose(`pr:${pr.repo}#${pr.number}`, {
      title: pr.title,
      angle: pr.body?.slice(0, 300) || "",
      mode: "dev-diary",
      source: `${pr.repo}#${pr.number}`,
      explain: `PR mergée le ${pr.mergedAt?.slice(0, 10)} sur ${pr.repo} (#${pr.number}) : "${pr.title}".`,
    });
  }

  console.log("▶ Signal 2/6 — GSC play-astronova.com (legacy Astro Nova)");
  const legacy = await playAstronovaGscSignals();
  for (const q of legacy.slice(0, 8)) {
    propose(`legacy-gsc:${q.query}`, {
      title: `Angle éditorial autour de « ${q.query} »`,
      angle: "",
      mode: "research",
      source: `legacy-gsc:${q.query}`,
      explain: `Sous l'ancienne marque, "${q.query}" avait déjà ${q.clicks} clic(s) / ${q.impressions} impression(s) (position moy. ${q.position.toFixed(1)}) — capital de recherche à ne pas perdre dans la migration.`,
    });
  }

  console.log("▶ Signal 3/6 — opportunités GSC dynastynova.com");
  const gaps = await ownGscGaps();
  for (const g of gaps.slice(0, 8)) {
    propose(`gsc-gap:${g.query}`, {
      title: `Angle éditorial autour de « ${g.query} »`,
      angle: "",
      mode: "research",
      source: `gsc-gap:${g.query}`,
      explain: `${g.impressions} impression(s) sur "${g.query}" en position moyenne ${g.position.toFixed(1)}, 0 clic — pas encore d'article ciblant cette requête.`,
    });
  }

  console.log("▶ Signal 4/6 — GA4 dynastynova.com (engagement des articles publiés)");
  const ga4 = await ownGa4Signals();
  if (ga4.length) {
    console.log(
      `  (signal informatif, pas générateur d'idées neuves : ${ga4.length} page(s) /blog/ avec du trafic réel — utile pour prioriser un refresh plutôt qu'un article neuf)`
    );
  } else {
    console.log("  (pas encore de trafic /blog/ mesurable sur ce site — normal, domaine jeune)");
  }

  console.log("▶ Signal 5/6 — cluster jeux de beryldesign.fr");
  const jeux = await beryldesignJeuxSignals();
  for (const p of jeux.slice(0, 10)) {
    propose(`beryldesign:${p.slug}`, {
      title: p.title || p.slug,
      angle: p.description || "",
      mode: "research",
      source: `beryldesign:${p.slug}`,
      explain: `Sur beryldesign.fr, un article très proche ("${p.title}") a généré ${p.clicks} clic(s) / ${p.impressions} impression(s) / ${p.views} vue(s) GA4 — le cluster jeux y fait 78% des clics du site — jamais couvert sur ce blog.`,
    });
  }

  console.log("▶ Signal 6/6 — mots-clés docs/seo-checklist.md");
  const keywords = await seoChecklistKeywords();
  for (const kw of keywords.slice(0, 6)) {
    propose(`seo-checklist:${kw}`, {
      title: `Angle éditorial autour de « ${kw} »`,
      angle: "",
      mode: "research",
      source: `seo-checklist:${kw}`,
      explain: `Mot-clé cible listé dans docs/seo-checklist.md, non encore couvert par un article.`,
    });
  }

  console.log(`\n${proposals.length} nouvelle(s) idée(s) générée(s).`);
  for (const p of proposals) {
    console.log(`  [${p.id}] (${p.mode}) ${p.title}\n      ${p.explain}`);
  }

  if (opts.apply && proposals.length) {
    await saveBacklog([...backlog, ...proposals]);
    console.log(`\n✅ Ajoutées à ${path.relative(ROOT, BACKLOG_PATH)}`);
  } else if (!opts.apply) {
    console.log("\n(dry-run — relancer avec --apply pour écrire dans le backlog)");
  }
}

// --- list / lifecycle ---------------------------------------------------------

async function cmdList(opts) {
  const backlog = await loadBacklog();
  const filtered = opts.status ? backlog.filter((i) => i.status === opts.status) : backlog;
  if (opts.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }
  for (const i of filtered) {
    console.log(`[${i.id}] (${i.status}) (${i.mode}) ${i.title}`);
    console.log(`    ${i.explain}`);
  }
  console.log(`\n${filtered.length} idée(s).`);
}

async function setStatus(opts, status, extra = {}) {
  const backlog = await loadBacklog();
  let changed = 0;
  for (const id of opts.ids) {
    const item = backlog.find((i) => i.id === id);
    if (!item) {
      console.error(`⚠️  Idée introuvable : ${id}`);
      continue;
    }
    Object.assign(item, { status, ...extra });
    changed++;
  }
  if (opts.apply) {
    await saveBacklog(backlog);
    console.log(`✅ ${changed} idée(s) passée(s) à "${status}".`);
  } else {
    console.log(`(dry-run) ${changed} idée(s) passeraient à "${status}" — relancer avec --apply.`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.cmd) fail("Aucune commande. Voir l'en-tête du script pour l'usage.");

  if (opts.cmd === "generate") return cmdGenerate(opts);
  if (opts.cmd === "list") return cmdList(opts);
  if (opts.cmd === "queue") return setStatus(opts, "queued");
  if (opts.cmd === "claim") return setStatus(opts, "in-progress");
  if (opts.cmd === "complete") return setStatus(opts, "done", { slug: opts.slug });
  if (opts.cmd === "reject") return setStatus(opts, "rejected", { reason: opts.reason });
  if (opts.cmd === "release") return setStatus(opts, "proposed");
}

main().catch((e) => fail(e.stack || e.message));
