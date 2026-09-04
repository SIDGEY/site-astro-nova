#!/usr/bin/env node
/**
 * Suivi hebdomadaire post-fix canonical (voir commit "fix: harmonise les canonical
 * avec le slash final servi par le site"). Lancé par launchd (~/Library/LaunchAgents/
 * com.dynastynova.gsc-weekly-check.plist), pas besoin d'ouvrir Claude Code.
 *
 * - Réinspecte les URLs de scripts/gsc-tracked-urls.txt via l'API URL Inspection.
 * - Compare au dernier relevé dans .gsc-cache/indexation-baseline/.
 * - Écrit un nouveau relevé daté + une ligne dans weekly-log.md.
 * - Notification macOS uniquement si le statut d'indexation d'au moins une URL a changé.
 *
 * Usage : node scripts/gsc-weekly-check.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { GoogleAuth } from "google-auth-library";

const REPO_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const BASELINE_DIR = path.join(REPO_ROOT, ".gsc-cache", "indexation-baseline");
const LOG_FILE = path.join(BASELINE_DIR, "weekly-log.md");
const TRACKED_URLS_FILE = path.join(REPO_ROOT, "scripts", "gsc-tracked-urls.txt");

let dotenvCache = null;
async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (dotenvCache === null) {
    dotenvCache = await fs.readFile(path.join(REPO_ROOT, ".env"), "utf8").catch(() => "");
  }
  const line = dotenvCache.split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  if (!line) return null;
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function notify(title, message) {
  try {
    execFileSync("osascript", ["-e", `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`]);
  } catch {
    // Pas de session graphique (ex: Mac verrouillé sans utilisateur ouvert) -> on ignore, le log suffit.
  }
}

// Parse le format texte produit par inspectAll() ci-dessous / scripts/gsc-inspect.mjs.
function parseSnapshot(text) {
  const map = new Map();
  const blocks = text.split("\n\n").map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    const [urlLine, statusLine] = block.split("\n");
    if (!urlLine || !statusLine) continue;
    const coverageMatch = statusLine.match(/coverage="([^"]*)"/);
    if (coverageMatch) map.set(urlLine.trim(), coverageMatch[1]);
  }
  return map;
}

async function inspectAll(urls, siteUrl, client) {
  const lines = [];
  for (const url of urls) {
    try {
      const res = await client.request({
        url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        method: "POST",
        data: { inspectionUrl: url, siteUrl },
      });
      const r = res.data.inspectionResult.indexStatusResult;
      lines.push(`${url}\n  verdict=${r.verdict}  coverage="${r.coverageState}"  lastCrawl=${r.lastCrawlTime || "jamais"}  robotsTxt=${r.robotsTxtState}  indexing=${r.indexingState}`);
    } catch (e) {
      lines.push(`${url}\n  ERREUR: ${e.response?.data?.error?.message || e.message}`);
    }
  }
  return lines.join("\n\n") + "\n";
}

async function main() {
  const keyFile = await loadEnvVar("GSC_SERVICE_ACCOUNT_KEY_FILE");
  if (!keyFile) throw new Error("GSC_SERVICE_ACCOUNT_KEY_FILE manquante dans .env");
  const siteUrl = "https://dynastynova.com/";

  const auth = new GoogleAuth({ keyFile, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const client = await auth.getClient();

  const urls = (await fs.readFile(TRACKED_URLS_FILE, "utf8")).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  await fs.mkdir(BASELINE_DIR, { recursive: true });
  const existing = (await fs.readdir(BASELINE_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}.*\.txt$/.test(f)).sort();
  const previousFile = existing.at(-1);
  const previousMap = previousFile
    ? parseSnapshot(await fs.readFile(path.join(BASELINE_DIR, previousFile), "utf8"))
    : new Map();

  const snapshotText = await inspectAll(urls, siteUrl, client);
  const newMap = parseSnapshot(snapshotText);

  const dateStamp = ymd(new Date());
  await fs.writeFile(path.join(BASELINE_DIR, `${dateStamp}.txt`), snapshotText);

  const changes = [];
  for (const [url, newState] of newMap) {
    const oldState = previousMap.get(url);
    if (oldState && oldState !== newState) changes.push(`  - ${url}\n    ${oldState} -> ${newState}`);
  }
  const newlyIndexed = changes.filter((c) => c.includes("-> \"Submitted and indexed\"")).length;

  const summaryHeader = `## ${dateStamp}${previousFile ? ` (vs ${previousFile.replace(".txt", "")})` : " (premier relevé)"}\n`;
  const summaryBody = changes.length
    ? `${changes.length} changement(s) de statut d'indexation, dont ${newlyIndexed} nouvellement indexée(s) :\n${changes.join("\n")}\n`
    : previousFile
      ? "Aucun changement de statut d'indexation depuis le dernier relevé.\n"
      : "Premier relevé, rien à comparer.\n";

  await fs.appendFile(LOG_FILE, `\n${summaryHeader}\n${summaryBody}`);

  console.log(summaryHeader + summaryBody);

  if (changes.length > 0) {
    notify(
      "GSC — dynastynova.com",
      newlyIndexed > 0
        ? `${newlyIndexed} page(s) nouvellement indexée(s), ${changes.length} changement(s) au total.`
        : `${changes.length} changement(s) de statut d'indexation détecté(s).`
    );
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
