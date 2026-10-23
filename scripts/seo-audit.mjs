#!/usr/bin/env node
/**
 * Audit SEO déterministe de dynastynova.com, pour l'agent `seo-expert` (skill `seo`) :
 * ce qu'un crawler et un tableur feraient, sans rien envoyer nulle part.
 *
 * 1. Crawl du build (dist/, lancer `npm run build` avant) : par page indexable, title,
 *    meta description, canonical, robots, H1, volume de texte, liens internes entrants et
 *    sortants (zone <main> seule, hors menu et pied de page), images sans alt, JSON-LD.
 *    Croisé avec le sitemap : page noindex dans le sitemap, page indexable absente du
 *    sitemap, lien interne cassé, page orpheline, title ou description en double.
 * 2. Search Console (dernier export de .gsc-cache/, scripts/gsc-fetch.mjs) : part marque /
 *    hors marque, requêtes hors marque, requêtes partagées entre plusieurs pages
 *    (cannibalisation), pages à impressions sans clic.
 *
 * Écrit dans .seo-cache/<date>/ (gitignored) et n'affiche qu'un résumé court.
 *
 * Usage :
 *   node scripts/seo-audit.mjs               # dist/ + dernier export GSC dynastynova.com
 *   node scripts/seo-audit.mjs --no-gsc      # build seul
 *   node scripts/seo-audit.mjs --out .seo-cache
 */
import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const SITE = "https://dynastynova.com";
const DIST = path.resolve("dist");
// Ni le CMS ni les fichiers du jeu ne sont des pages du site.
const SKIP_DIRS = ["admin"];
// Toutes les graphies de la marque, ancienne (Astro Nova) comprise.
const BRAND_RE = /dyn?ast(y|ie)\s*-?nova|nova\s*dynast|astr[oa]\s*-?nova|astron\s*nova/i;

const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const THIN_WORDS = 300;

function parseArgs(argv) {
  const o = { out: ".seo-cache", gsc: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") o.out = argv[++i];
    if (argv[i] === "--no-gsc") o.gsc = false;
  }
  return o;
}

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (dir === DIST && SKIP_DIRS.includes(e.name)) continue;
      out.push(...(await walk(p)));
    } else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function toPath(file) {
  const rel = path.relative(DIST, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

// Chemin interne normalisé (slash final, sans ancre ni paramètres), null si externe.
function internalPath(href) {
  if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/.test(href)) return null;
  let u;
  try {
    u = new URL(href, `${SITE}/`);
  } catch {
    return null;
  }
  if (u.hostname !== "dynastynova.com" && u.hostname !== "www.dynastynova.com") return null;
  let p = u.pathname;
  if (!path.extname(p) && !p.endsWith("/")) p += "/";
  return p;
}

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (header, rows) => [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(cell), (cell = "");
    else if (c === "\n") row.push(cell), rows.push(row), (row = []), (cell = "");
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  return rows;
}

async function crawl() {
  const files = await walk(DIST);
  const pages = new Map();
  for (const file of files) {
    const $ = cheerio.load(await fs.readFile(file, "utf8"));
    const p = toPath(file);
    if (p === "/404.html") continue;
    const robots = $('meta[name="robots"]').attr("content") || "index, follow";
    const main = $("main").length ? $("main") : $("body");
    const text = main.clone().find("script, style, nav, footer").remove().end().text();
    const outLinks = new Set();
    main.find("a[href]").each((_, a) => {
      const ip = internalPath($(a).attr("href"));
      if (ip && ip !== p) outLinks.add(ip);
    });
    const jsonLd = [];
    let jsonLdError = "";
    $('script[type="application/ld+json"]').each((_, s) => {
      try {
        const data = JSON.parse($(s).html());
        const nodes = data["@graph"] || [data];
        for (const n of nodes) jsonLd.push([].concat(n["@type"]).join("+"));
      } catch (e) {
        jsonLdError = e.message;
      }
    });
    pages.set(p, {
      path: p,
      title: $("title").first().text().trim(),
      description: $('meta[name="description"]').attr("content")?.trim() || "",
      canonical: $('link[rel="canonical"]').attr("href") || "",
      noindex: /noindex/i.test(robots),
      h1: $("h1").map((_, h) => $(h).text().replace(/\s+/g, " ").trim()).get(),
      words: text.split(/\s+/).filter(Boolean).length,
      outLinks,
      imgNoAlt: main.find("img").filter((_, i) => $(i).attr("alt") === undefined).length,
      jsonLd,
      jsonLdError,
    });
  }
  return pages;
}

async function sitemapPaths() {
  const out = new Set();
  const files = (await fs.readdir(DIST)).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  for (const f of files) {
    const xml = await fs.readFile(path.join(DIST, f), "utf8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) out.add(new URL(m[1]).pathname);
  }
  return out;
}

async function latestGscDir() {
  const dirs = (await fs.readdir(".gsc-cache").catch(() => []))
    .filter((d) => d.startsWith("dynastynova.com-Performance-on-Search-"))
    .sort();
  return dirs.length ? path.join(".gsc-cache", dirs.at(-1)) : null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  await fs.access(DIST).catch(() => {
    console.error("dist/ absent : lancer `npm run build` d'abord.");
    process.exit(1);
  });

  const pages = await crawl();
  const inSitemap = await sitemapPaths();
  const issues = [];
  const add = (page, type, detail) => issues.push([page, type, detail]);

  const inbound = new Map([...pages.keys()].map((p) => [p, 0]));
  for (const pg of pages.values()) {
    for (const target of pg.outLinks) {
      if (inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
      else if (!path.extname(target)) add(pg.path, "lien interne cassé", target);
    }
  }

  const titles = new Map();
  const descs = new Map();
  for (const pg of pages.values()) {
    const selfURL = `${SITE}${pg.path}`;
    if (pg.noindex) {
      if (inSitemap.has(pg.path)) add(pg.path, "noindex dans le sitemap", "");
      continue;
    }
    if (!inSitemap.has(pg.path)) add(pg.path, "indexable hors sitemap", "");
    if (pg.canonical !== selfURL) add(pg.path, "canonical différente", pg.canonical || "(absente)");
    if (!pg.title) add(pg.path, "title absent", "");
    else if (pg.title.length > TITLE_MAX) add(pg.path, "title long", `${pg.title.length} car.`);
    if (!pg.description) add(pg.path, "description absente", "");
    else if (pg.description.length < DESC_MIN || pg.description.length > DESC_MAX)
      add(pg.path, "description hors 120-160", `${pg.description.length} car.`);
    if (pg.h1.length !== 1) add(pg.path, "H1 ≠ 1", `${pg.h1.length}`);
    if (pg.words < THIN_WORDS && pg.path.startsWith("/blog/") && pg.path !== "/blog/")
      add(pg.path, "contenu mince", `${pg.words} mots`);
    if (pg.path !== "/" && inbound.get(pg.path) === 0) add(pg.path, "orpheline (aucun lien depuis un contenu)", "");
    if (pg.imgNoAlt) add(pg.path, "images sans alt", `${pg.imgNoAlt}`);
    if (pg.jsonLdError) add(pg.path, "JSON-LD invalide", pg.jsonLdError);
    titles.set(pg.title, [...(titles.get(pg.title) || []), pg.path]);
    descs.set(pg.description, [...(descs.get(pg.description) || []), pg.path]);
  }
  for (const [t, ps] of titles) if (t && ps.length > 1) for (const p of ps) add(p, "title en double", ps.join(" "));
  for (const [d, ps] of descs) if (d && ps.length > 1) for (const p of ps) add(p, "description en double", ps.join(" "));
  for (const p of inSitemap) if (!pages.has(p)) add(p, "sitemap vers une page absente du build", "");

  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(opts.out, date);
  await fs.mkdir(outDir, { recursive: true });

  const pageRows = [...pages.values()]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((pg) => [
      pg.path, pg.noindex ? "noindex" : "index", inSitemap.has(pg.path) ? "oui" : "non",
      pg.title, pg.title.length, pg.description.length, pg.h1.join(" | "), pg.words,
      inbound.get(pg.path), pg.outLinks.size, pg.jsonLd.join(" "),
    ]);
  await fs.writeFile(
    path.join(outDir, "Pages.csv"),
    toCsv(["Page", "Robots", "Sitemap", "Title", "Long. title", "Long. description", "H1", "Mots", "Liens entrants", "Liens sortants", "JSON-LD"], pageRows),
  );
  await fs.writeFile(path.join(outDir, "Problemes.csv"), toCsv(["Page", "Problème", "Détail"], issues));

  const counts = {};
  for (const [, type] of issues) counts[type] = (counts[type] || 0) + 1;
  console.log(`\n▶ Build : ${pages.size} pages, ${[...pages.values()].filter((p) => !p.noindex).length} indexables, ${inSitemap.size} URLs au sitemap`);
  for (const [type, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${type}`);

  if (opts.gsc) {
    const gscDir = await latestGscDir();
    if (!gscDir) console.log("\n▶ GSC : aucun export dans .gsc-cache/ (npm run gsc:fetch)");
    else {
      const queries = parseCsv(await fs.readFile(path.join(gscDir, "Requêtes.csv"), "utf8")).slice(1).filter((r) => r.length >= 5);
      const qp = parseCsv(await fs.readFile(path.join(gscDir, "Requêtes-Pages.csv"), "utf8")).slice(1).filter((r) => r.length >= 6);
      const gscPages = parseCsv(await fs.readFile(path.join(gscDir, "Pages.csv"), "utf8")).slice(1).filter((r) => r.length >= 5);
      const sum = (rows, i) => rows.reduce((s, r) => s + Number(r[i] || 0), 0);
      const brand = queries.filter((r) => BRAND_RE.test(r[0]));
      const other = queries.filter((r) => !BRAND_RE.test(r[0]));

      await fs.writeFile(
        path.join(outDir, "Requetes-hors-marque.csv"),
        toCsv(["Requête", "Clics", "Impressions", "CTR", "Position"], other.sort((a, b) => b[2] - a[2])),
      );

      const byQuery = new Map();
      for (const [page, q, , imp, , pos] of qp) {
        if (BRAND_RE.test(q) || Number(imp) < 5) continue;
        byQuery.set(q, [...(byQuery.get(q) || []), [new URL(page).pathname, imp, pos]]);
      }
      const cannib = [...byQuery].filter(([, ps]) => ps.length > 1);
      await fs.writeFile(
        path.join(outDir, "Cannibalisation.csv"),
        toCsv(["Requête", "Page", "Impressions", "Position"], cannib.flatMap(([q, ps]) => ps.map((p) => [q, ...p]))),
      );

      // Pages vues en recherche mais jamais cliquées : titre et description à revoir en premier.
      const noClick = gscPages.filter((r) => Number(r[1]) === 0 && Number(r[2]) >= 50).sort((a, b) => b[2] - a[2]);

      console.log(`\n▶ GSC (${path.basename(gscDir)}, ${queries.length} requêtes visibles, les autres sont anonymisées par Google)`);
      console.log(`  marque      : ${sum(brand, 1)} clics / ${sum(brand, 2)} impressions`);
      console.log(`  hors marque : ${sum(other, 1)} clics / ${sum(other, 2)} impressions (${other.length} requêtes)`);
      console.log(`  ${cannib.length} requête(s) hors marque partagée(s) entre plusieurs pages`);
      console.log(`  ${noClick.length} page(s) à ≥ 50 impressions sans clic`);
    }
  }
  console.log(`\nDétail : ${outDir}/ (Pages.csv, Problemes.csv${opts.gsc ? ", Requetes-hors-marque.csv, Cannibalisation.csv" : ""})`);
}

main();
