#!/usr/bin/env node
/**
 * Récupère l'engagement GA4 FRAIS via l'API officielle (Google Analytics Data API) :
 * performance par page, et sessions par source/support (pour vérifier que le trafic
 * referral depuis play-astronova.com arrive bien sur dynastynova.com après la
 * redirection). Écrit dans .ga4-cache/ (gitignored).
 *
 * Prérequis (à faire une seule fois, dans Google Cloud Console + GA4 — je ne peux pas
 * le faire à ta place) :
 *   1. Réutiliser le projet Google Cloud de scripts/gsc-fetch.mjs, activer l'API
 *      "Google Analytics Data API" (analyticsdata.googleapis.com) si pas déjà fait.
 *   2. Réutiliser le même compte de service que GSC (même clé JSON).
 *   3. Dans GA4 (Admin > Gestion des accès à la propriété) : ajouter l'email du compte
 *      de service avec le rôle "Lecteur".
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   GA4_SERVICE_ACCOUNT_KEY_FILE=/chemin/vers/gsc-service-account.json   # même clé que GSC
 *   GA4_PROPERTY_ID=properties/468587506
 *
 * Usage :
 *   node scripts/ga4-fetch.mjs                 # 30 derniers jours (défaut)
 *   node scripts/ga4-fetch.mjs --days 90
 *   node scripts/ga4-fetch.mjs --out .ga4-cache
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];
const API_BASE = "https://analyticsdata.googleapis.com/v1beta";

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
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseArgs(argv) {
  const o = { days: 30, out: ".ga4-cache", host: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--host") o.host = argv[++i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  return o;
}

// La propriété GA4 est partagée entre le jeu (play-astronova.com) et ce site
// (dynastynova.com) — --host isole les métriques d'un seul des deux hostnames via un
// dimensionFilter hostName, combiné (AND) au filtre déjà en place le cas échéant.
function withHostFilter(host, existingFilter) {
  if (!host) return existingFilter;
  const hostFilter = { filter: { fieldName: "hostName", stringFilter: { value: host } } };
  if (!existingFilter) return hostFilter;
  return { andGroup: { expressions: [existingFilter, hostFilter] } };
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toCsv(header, rows) {
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}

async function runReport(client, property, body) {
  const url = `${API_BASE}/${property}:runReport`;
  const res = await client.request({ url, method: "POST", data: body });
  return res.data.rows || [];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const keyFile = await loadEnvVar("GA4_SERVICE_ACCOUNT_KEY_FILE");
  const property = await loadEnvVar("GA4_PROPERTY_ID");
  if (!keyFile) fail("GA4_SERVICE_ACCOUNT_KEY_FILE manquante dans .env (chemin vers la clé JSON du compte de service).");
  if (!property) fail("GA4_PROPERTY_ID manquante dans .env (ex: properties/468587506).");
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
    fail(`Auth Google échouée : ${e.message}\n   Vérifie que la clé JSON est valide et que l'API Analytics Data est activée sur le projet.`);
  }

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - opts.days);
  const startDate = ymd(start);
  const endDate = ymd(end);

  console.log(`\n▶ GA4 live fetch — ${property} | période ${startDate} → ${endDate}`);

  let pageRows, sourceRows, eventRows;
  try {
    [pageRows, sourceRows, eventRows] = await Promise.all([
      runReport(client, property, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
          { name: "bounceRate" },
        ],
        dimensionFilter: withHostFilter(opts.host, null),
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 100,
      }),
      // Vérifie concrètement que la redirection play-astronova.com -> dynastynova.com
      // amène du trafic humain (source = play-astronova.com), pas seulement des robots.
      runReport(client, property, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        dimensionFilter: withHostFilter(opts.host, null),
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 50,
      }),
      // beta_modal_open / beta_signup (voir src/lib/tracking.ts) : conversion du funnel bêta.
      runReport(client, property, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: withHostFilter(opts.host, {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: ["beta_modal_open", "beta_signup"] },
          },
        }),
      }),
    ]);
  } catch (e) {
    const detail = e.response?.data?.error?.message || e.message;
    fail(
      `Appel API échoué : ${detail}\n` +
        `   403 fréquent -> le compte de service n'est pas ajouté comme lecteur dans GA4 pour cette propriété.\n` +
        `   404/400 fréquent -> GA4_PROPERTY_ID ne correspond pas au Property ID numérique (pas le Measurement ID G-XXXXXXX).`
    );
  }

  const dateStamp = ymd(new Date());
  const dir = path.join(opts.out, `dynastynova.com-GA4-${dateStamp}`);
  await fs.mkdir(dir, { recursive: true });

  const pagesCsv = toCsv(
    ["Page", "Vues", "Durée moyenne de session (s)", "Taux d'engagement (%)", "Taux de rebond (%)"],
    pageRows.map((r) => [
      r.dimensionValues[0].value,
      r.metricValues[0].value,
      Number(r.metricValues[1].value).toFixed(1),
      (Number(r.metricValues[2].value) * 100).toFixed(2),
      (Number(r.metricValues[3].value) * 100).toFixed(2),
    ])
  );
  const sourcesCsv = toCsv(
    ["Source", "Support", "Sessions"],
    sourceRows.map((r) => [r.dimensionValues[0].value, r.dimensionValues[1].value, r.metricValues[0].value])
  );
  const eventsCsv = toCsv(
    ["Événement", "Occurrences"],
    eventRows.map((r) => [r.dimensionValues[0].value, r.metricValues[0].value])
  );

  await fs.writeFile(path.join(dir, "Pages.csv"), pagesCsv);
  await fs.writeFile(path.join(dir, "Sources.csv"), sourcesCsv);
  await fs.writeFile(path.join(dir, "Evenements-beta.csv"), eventsCsv);

  console.log(
    `✅ ${pageRows.length} pages, ${sourceRows.length} sources, ${eventRows.length} types d'événement bêta -> ${dir}\n`
  );
}

main().catch((e) => fail(e.stack || e.message));
