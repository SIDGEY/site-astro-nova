#!/usr/bin/env node
/**
 * Vérifie le statut d'indexation réel d'une ou plusieurs URLs via l'API URL Inspection
 * de Search Console (même compte de service et même clé que scripts/gsc-fetch.mjs).
 *
 * Usage :
 *   node scripts/gsc-inspect.mjs https://dynastynova.com/blog/mon-article/ https://dynastynova.com/roadmap/
 */
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

let dotenvCache = null;
async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (dotenvCache === null) {
    dotenvCache = await fs.readFile(path.resolve(".env"), "utf8").catch(() => "");
  }
  const line = dotenvCache.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  if (!line) return null;
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const keyFile = await loadEnvVar("GSC_SERVICE_ACCOUNT_KEY_FILE");
  const siteUrl = "https://dynastynova.com/";
  const auth = new GoogleAuth({ keyFile, scopes: SCOPES });
  const client = await auth.getClient();

  const urls = process.argv.slice(2);
  for (const url of urls) {
    try {
      const res = await client.request({
        url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        method: "POST",
        data: { inspectionUrl: url, siteUrl },
      });
      const r = res.data.inspectionResult.indexStatusResult;
      console.log(`${url}\n  verdict=${r.verdict}  coverage="${r.coverageState}"  lastCrawl=${r.lastCrawlTime || "jamais"}  robotsTxt=${r.robotsTxtState}  indexing=${r.indexingState}\n`);
    } catch (e) {
      console.log(`${url}\n  ERREUR: ${e.response?.data?.error?.message || e.message}\n`);
    }
  }
}
main();
