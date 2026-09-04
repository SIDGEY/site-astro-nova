#!/usr/bin/env node
/**
 * Statut de soumission des sitemaps côté Search Console (soumis/indexé, dernière
 * lecture par Google, erreurs/avertissements) — même compte de service que gsc-fetch.mjs.
 *
 * Usage : node scripts/gsc-sitemap-check.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

let dotenvCache = null;
async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (dotenvCache === null) dotenvCache = await fs.readFile(path.resolve(".env"), "utf8").catch(() => "");
  const line = dotenvCache.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  if (!line) return null;
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const keyFile = await loadEnvVar("GSC_SERVICE_ACCOUNT_KEY_FILE");
  const siteUrl = "https://dynastynova.com/";
  const auth = new GoogleAuth({ keyFile, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const client = await auth.getClient();
  const res = await client.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
  });
  console.log(JSON.stringify(res.data, null, 2));
}
main().catch((e) => console.error(e.response?.data || e.message));
