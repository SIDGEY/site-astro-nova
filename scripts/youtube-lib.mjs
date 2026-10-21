/**
 * Outils communs aux scripts créateurs YouTube (youtube-creators.mjs, creators-enrich.mjs) :
 * lecture de .env, appel de l'API YouTube Data v3 avec suivi du quota, extraction des
 * contacts publics d'une description, lecture et écriture des CSV de la feuille « cibles ».
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API = "https://www.googleapis.com/youtube/v3";

export function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

let dotenvCache = null;
export async function loadEnvVar(name) {
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

export const quota = { used: 0 };

export async function yt(apiKey, endpoint, params, cost = 1) {
  const url = new URL(`${API}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey);
  quota.used += cost;
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
    if (reason === "quotaExceeded") fail(`Quota YouTube épuisé pour aujourd'hui (${quota.used} unités dans ce run).`);
    fail(`YouTube ${endpoint} : ${reason} — ${msg}`);
  }
  return body;
}

/** Vérifie la clé sur la chaîne officielle Google for Developers (1 unité). */
export async function checkKey(apiKey) {
  const res = await yt(apiKey, "channels", { part: "id", id: "UC_x5XG1OV2P6uZZ5FSM9Ttw" });
  if (!res.items?.length) fail("La clé répond mais l'API ne renvoie rien : vérifier les restrictions de la clé.");
  console.log("✅ Clé YouTube valide, API YouTube Data v3 activée.");
}

export function chunks(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export function slug(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Adresses qui ne sont jamais celles du créateur : les nôtres, les techniques, les marques
// qui sponsorisent ses vidéos, les exemples.
const NOT_A_CONTACT =
  /dynastynova|hambourger|noreply|no-reply|example\.|exemple\.|sentry|wixpress|@(nordvpn|surfshark|raidshadowlegends|plarium|hellofresh|dashlane|ledger|manscaped|nordpass|holafly|squarespace)\./i;
const CONTACT_HINT = /pro|contact|business|collab|partenariat|partnership|sponsor|booking|inquir|demande|mail/i;

/**
 * Contacts publics d'un texte (description de chaîne ou de vidéo). Chaque e-mail reçoit un
 * poids : présenté comme contact (« pro », « business »…) dans les 60 caractères qui
 * précèdent, ou proche du nom de la chaîne.
 */
export function contactsFrom(text, channelName = "") {
  const emails = [];
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g)) {
    const email = m[0].replace(/\.$/, "").toLowerCase();
    if (NOT_A_CONTACT.test(email)) continue;
    const before = text.slice(Math.max(0, m.index - 60), m.index);
    const name = slug(channelName).replace(/-/g, "");
    let weight = 1;
    if (CONTACT_HINT.test(before)) weight += 2;
    if (name.length >= 4 && email.replace(/[^a-z0-9]/g, "").includes(name.slice(0, 6))) weight += 2;
    emails.push({ email, weight });
  }
  const urls = [...new Set(text.match(/https?:\/\/[^\s)<>"]+/g) || [])];
  const social = {
    twitch: urls.find((u) => /twitch\.tv\/[^/]+/i.test(u)),
    tiktok: urls.find((u) => /tiktok\.com\/@/i.test(u)),
    instagram: urls.find((u) => /instagram\.com\/[^/]+/i.test(u)),
    discord: urls.find((u) => /discord\.(gg|com\/invite)\//i.test(u)),
    x: urls.find((u) => /(twitter|x)\.com\/[^/]+/i.test(u)),
    linktree: urls.find((u) => /linktr\.ee|beacons\.ai|carrd\.co/i.test(u)),
  };
  return { emails, social };
}

/** Fusionne des listes pondérées d'e-mails et les classe, le plus probable d'abord. */
export function rankEmails(lists) {
  const acc = new Map();
  for (const { email, weight, source } of lists.flat()) {
    const prev = acc.get(email) || { email, weight: 0, source };
    prev.weight += weight;
    acc.set(email, prev);
  }
  return [...acc.values()].sort((a, b) => b.weight - a.weight);
}

/** Dernières mises en ligne d'une chaîne, avec leur description (1 unité). */
export async function recentUploads(apiKey, uploadsPlaylist, max = 25) {
  if (!uploadsPlaylist) return [];
  const res = await yt(apiKey, "playlistItems", { part: "snippet,contentDetails", playlistId: uploadsPlaylist, maxResults: max });
  return (res.items || []).map((i) => ({
    id: i.contentDetails.videoId,
    title: i.snippet.title,
    description: i.snippet.description || "",
    publishedAt: i.contentDetails.videoPublishedAt || i.snippet.publishedAt,
  }));
}

function csvCell(v, sep) {
  const s = Array.isArray(v) ? v.join(" | ") : String(v ?? "");
  return s.includes(sep) || /["\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(cols, rows, sep = ",") {
  return [cols.map((c) => csvCell(c, sep)).join(sep), ...rows.map((r) => cols.map((c) => csvCell(r[c], sep)).join(sep))].join("\n") + "\n";
}

/** Lecteur CSV (guillemets, séparateur et retours à la ligne dans les cellules), « , » ou « ; ». */
export function parseCsv(text) {
  text = text.replace(/^﻿/, "");
  const firstLine = text.slice(0, text.indexOf("\n") === -1 ? text.length : text.indexOf("\n"));
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
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
    else if (ch === sep) row.push(cell), (cell = "");
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += ch;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const [header = [], ...body] = rows.filter((r) => r.some((c) => c !== ""));
  const cols = header.map((h) => h.trim());
  return { cols, sep, rows: body.map((r) => Object.fromEntries(cols.map((h, i) => [h, r[i] ?? ""]))) };
}
