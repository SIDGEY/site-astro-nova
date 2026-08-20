#!/usr/bin/env node
/**
 * Marque un événement GA4 comme "événement clé" (conversion) via l'API Admin.
 * Nécessite que le compte de service ait le rôle "Éditeur" (pas "Lecteur") sur la
 * propriété GA4, et que l'API "Google Analytics Admin API" soit activée sur le
 * projet Google Cloud (console.cloud.google.com/apis/library/analyticsadmin.googleapis.com).
 *
 * Usage :
 *   node scripts/ga4-mark-key-event.mjs beta_signup
 *   node scripts/ga4-mark-key-event.mjs beta_signup --counting once_per_session
 *   node scripts/ga4-mark-key-event.mjs --list                # liste les événements clés existants
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleAuth } from "google-auth-library";

const API_BASE = "https://analyticsadmin.googleapis.com/v1beta";

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
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

function parseArgs(argv) {
  const o = { eventName: null, counting: "ONCE_PER_EVENT", list: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--list") o.list = true;
    else if (argv[i] === "--counting") o.counting = argv[++i].toUpperCase();
    else if (!argv[i].startsWith("--")) o.eventName = argv[i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  return o;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const keyFile = await loadEnvVar("GA4_SERVICE_ACCOUNT_KEY_FILE");
  const property = await loadEnvVar("GA4_PROPERTY_ID");
  if (!keyFile) fail("GA4_SERVICE_ACCOUNT_KEY_FILE manquante dans .env.");
  if (!property) fail("GA4_PROPERTY_ID manquante dans .env (ex: properties/468587506).");

  const scope = opts.list
    ? "https://www.googleapis.com/auth/analytics.readonly"
    : "https://www.googleapis.com/auth/analytics.edit";
  const auth = new GoogleAuth({ keyFile, scopes: [scope] });
  const client = await auth.getClient();

  if (opts.list) {
    const res = await client.request({ url: `${API_BASE}/${property}/keyEvents`, method: "GET" });
    for (const ev of res.data.keyEvents || []) {
      console.log(`  ${ev.eventName}${ev.custom ? " (custom)" : ""} — créé le ${ev.createTime?.slice(0, 10)}`);
    }
    console.log(`\n${(res.data.keyEvents || []).length} événement(s) clé(s).\n`);
    return;
  }

  if (!opts.eventName) fail("Nom d'événement requis (ou --list). Ex: node scripts/ga4-mark-key-event.mjs beta_signup");

  try {
    const res = await client.request({
      url: `${API_BASE}/${property}/keyEvents`,
      method: "POST",
      data: { eventName: opts.eventName, countingMethod: opts.counting },
    });
    console.log(`\n✅ "${opts.eventName}" marqué comme événement clé (${res.data.name}).\n`);
  } catch (e) {
    const status = e.response?.status;
    const detail = e.response?.data?.error?.message || e.message;
    fail(
      `Échec (${status}) : ${detail}\n` +
        `   403 fréquent -> le compte de service a le rôle "Lecteur" au lieu de "Éditeur" sur la propriété GA4,\n` +
        `                    ou l'API Admin n'est pas activée sur le projet Google Cloud.\n` +
        `   409 fréquent -> déjà marqué comme événement clé (voir --list).`
    );
  }
}

main().catch((e) => fail(e.stack || e.message));
