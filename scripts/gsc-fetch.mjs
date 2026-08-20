#!/usr/bin/env node
/**
 * Récupère les données Search Console FRAÎCHES via l'API officielle (Search Analytics
 * API), sans passer par un export CSV manuel. Écrit le résultat dans .gsc-cache/
 * (gitignored), un dossier par site x date, pour comparer play-astronova.com et
 * dynastynova.com avant/après la migration de domaine.
 *
 * Prérequis (à faire une seule fois, dans Google Cloud Console + Search Console — je ne
 * peux pas le faire à ta place) :
 *   1. Créer/choisir un projet Google Cloud, activer l'API "Google Search Console API".
 *   2. Créer un compte de service (IAM & Admin > Comptes de service), générer une clé
 *      JSON, la télécharger (ex: ~/secrets/gsc-service-account.json — JAMAIS dans le repo).
 *      Un compte de service déjà créé pour un autre projet peut être réutilisé : il suffit
 *      de l'ajouter comme utilisateur sur une propriété GSC supplémentaire (étape 3).
 *   3. Dans Search Console, pour CHAQUE propriété (dynastynova.com ET play-astronova.com,
 *      vérifiées en type "Domaine" au préalable) : Paramètres > Utilisateurs et
 *      autorisations > Ajouter un utilisateur -> coller l'email du compte de service
 *      (finit par @<projet>.iam.gserviceaccount.com), rôle "Restreint" (lecture suffit).
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   GSC_SERVICE_ACCOUNT_KEY_FILE=/chemin/vers/gsc-service-account.json
 *   GSC_SITE_URL=sc-domain:dynastynova.com        # valeur par défaut si --site absent
 *
 * Usage :
 *   node scripts/gsc-fetch.mjs                                    # site par défaut (.env), 90 derniers jours
 *   node scripts/gsc-fetch.mjs --site sc-domain:play-astronova.com # comparer l'autre domaine
 *   node scripts/gsc-fetch.mjs --days 28
 *   node scripts/gsc-fetch.mjs --out .gsc-cache
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];
const API_BASE = "https://www.googleapis.com/webmasters/v3/sites";
const ROW_LIMIT = 25000;

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

// Node ne charge pas .env automatiquement pour un script lancé via `node scripts/x.mjs`
// (contrairement à Astro/Vite en dev) -> on le lit nous-mêmes, sans jamais logger la valeur.
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
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseArgs(argv) {
  const o = { days: 90, out: ".gsc-cache", site: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--site") o.site = argv[++i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  return o;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// sc-domain:dynastynova.com -> dynastynova.com (pour nommer le dossier de cache).
function siteToSlug(siteUrl) {
  return siteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function toCsv(header, rows) {
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}

async function queryDimensions(client, siteUrl, dimensions, startDate, endDate) {
  const url = `${API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await client.request({
    url,
    method: "POST",
    data: { startDate, endDate, dimensions, rowLimit: ROW_LIMIT, dataState: "all" },
  });
  return res.data.rows || [];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const keyFile = await loadEnvVar("GSC_SERVICE_ACCOUNT_KEY_FILE");
  const siteUrl = opts.site || (await loadEnvVar("GSC_SITE_URL"));
  if (!keyFile) fail("GSC_SERVICE_ACCOUNT_KEY_FILE manquante dans .env (chemin vers la clé JSON du compte de service).");
  if (!siteUrl) fail("Aucun site : passe --site sc-domain:exemple.com ou renseigne GSC_SITE_URL dans .env.");
  try {
    await fs.access(keyFile);
  } catch {
    fail(`Clé introuvable : ${keyFile}`);
  }

  const auth = new GoogleAuth({ keyFile, scopes: SCOPES });
  let client;
  try {
    client = await auth.getClient();
  } catch (e) {
    fail(`Auth Google échouée : ${e.message}\n   Vérifie que la clé JSON est valide et que l'API Search Console est activée sur le projet.`);
  }

  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC a ~2j de latence sur les données les plus récentes
  const start = new Date(end);
  start.setDate(start.getDate() - opts.days);
  const startDate = ymd(start);
  const endDate = ymd(end);

  console.log(`\n▶ GSC live fetch — site=${siteUrl} | période ${startDate} → ${endDate}`);

  let queries, pages, pageQueries;
  try {
    [queries, pages, pageQueries] = await Promise.all([
      queryDimensions(client, siteUrl, ["query"], startDate, endDate),
      queryDimensions(client, siteUrl, ["page"], startDate, endDate),
      queryDimensions(client, siteUrl, ["page", "query"], startDate, endDate),
    ]);
  } catch (e) {
    const detail = e.response?.data?.error?.message || e.message;
    fail(
      `Appel API échoué : ${detail}\n` +
        `   403 fréquent -> le compte de service n'est pas ajouté comme utilisateur dans Search Console pour ce site.\n` +
        `   404 fréquent -> --site/GSC_SITE_URL ne correspond pas exactement à l'identifiant de la propriété (ex: sc-domain:dynastynova.com).`
    );
  }

  const dateStamp = ymd(new Date());
  const slug = siteToSlug(siteUrl);
  const dir = path.join(opts.out, `${slug}-Performance-on-Search-${dateStamp}`);
  await fs.mkdir(dir, { recursive: true });

  const queriesCsv = toCsv(
    ["Requêtes", "Clics", "Impressions", "CTR", "Position"],
    queries.map((r) => [r.keys[0], r.clicks, r.impressions, (r.ctr * 100).toFixed(2), r.position.toFixed(2)])
  );
  const pagesCsv = toCsv(
    ["Pages les plus populaires", "Clics", "Impressions", "CTR", "Position"],
    pages.map((r) => [r.keys[0], r.clicks, r.impressions, (r.ctr * 100).toFixed(2), r.position.toFixed(2)])
  );
  const pageQueriesCsv = toCsv(
    ["Page", "Requête", "Clics", "Impressions", "CTR", "Position"],
    pageQueries.map((r) => [r.keys[0], r.keys[1], r.clicks, r.impressions, (r.ctr * 100).toFixed(2), r.position.toFixed(2)])
  );

  await fs.writeFile(path.join(dir, "Requêtes.csv"), queriesCsv);
  await fs.writeFile(path.join(dir, "Pages.csv"), pagesCsv);
  await fs.writeFile(path.join(dir, "Requêtes-Pages.csv"), pageQueriesCsv);

  console.log(`✅ ${queries.length} requêtes, ${pages.length} pages, ${pageQueries.length} lignes page×requête -> ${dir}\n`);
}

main().catch((e) => fail(e.stack || e.message));
