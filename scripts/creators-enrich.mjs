#!/usr/bin/env node
/**
 * Complète les e-mails de la feuille « cibles » (prospection créateurs, envoi par Apps
 * Script depuis Gmail) à partir de ce que les créateurs publient eux-mêmes sur YouTube : la
 * description de la chaîne et celles de leurs dernières vidéos, où beaucoup écrivent
 * « Contact pro : … ». L'adresse cachée derrière le bouton « Afficher l'adresse e-mail » de
 * l'onglet À propos n'est pas accessible par l'API (captcha) : elle reste à chercher à la main.
 *
 * Ne remplit que les cellules vides : `email`, `où trouver le contact` (la vidéo où l'adresse
 * a été vue), et `twitch`, `tiktok`, `instagram`, `discord`, `x` trouvés dans les mêmes
 * descriptions. Ne change aucun statut : une ligne « à contacter » qui reçoit un e-mail part
 * au prochain lot de l'Apps Script.
 *
 * Coût : 2 unités de quota par ligne (chaîne + dernières vidéos), 10 000 par jour.
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   YOUTUBE_API_KEY=AIza...
 *
 * Usage :
 *   node scripts/creators-enrich.mjs cibles.csv                 # lignes sans e-mail, quel que soit le statut
 *   node scripts/creators-enrich.mjs cibles.csv --statut "à contacter"
 *   node scripts/creators-enrich.mjs cibles.csv --videos 50 --out cibles-enrichi.csv
 *
 * Sortie : CSV au séparateur « ; », mêmes colonnes et même ordre que l'entrée, à réimporter
 * dans Google Sheets (Fichier > Importer > Remplacer la feuille, séparateur « Point-virgule »).
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { checkKey, contactsFrom, fail, loadEnvVar, parseCsv, quota, rankEmails, recentUploads, toCsv, yt } from "./youtube-lib.mjs";

const SOCIAL_COLS = ["twitch", "tiktok", "instagram", "discord", "x"];

function parseArgs(argv) {
  const o = { input: null, out: null, statut: null, videos: 25 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--statut") o.statut = argv[++i];
    else if (argv[i] === "--videos") o.videos = Number(argv[++i]);
    else if (argv[i].startsWith("--")) fail(`Option inconnue : ${argv[i]}`);
    else o.input = argv[i];
  }
  if (!o.input) fail("Indiquer le CSV de la feuille « cibles » : node scripts/creators-enrich.mjs cibles.csv");
  if (!Number.isInteger(o.videos) || o.videos < 1 || o.videos > 50) fail("--videos attend un entier de 1 à 50.");
  o.out ||= path.join(path.dirname(o.input), `${path.basename(o.input, path.extname(o.input))}-enrichi.csv`);
  return o;
}

/** `@handle` ou identifiant UC… depuis les colonnes handle / url. */
function channelRef(row) {
  const id = (row.url || "").match(/youtube\.com\/channel\/(UC[\w-]{22})/)?.[1];
  if (id) return { id };
  const handle = (row.handle || "").trim() || (row.url || "").match(/youtube\.com\/(@[\w.-]+)/)?.[1];
  return handle ? { forHandle: handle.startsWith("@") ? handle : `@${handle}` } : null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = await loadEnvVar("YOUTUBE_API_KEY");
  if (!apiKey) fail("YOUTUBE_API_KEY manquante (voir l'en-tête de scripts/youtube-creators.mjs et .env.example).");
  await checkKey(apiKey);

  const { cols, rows } = parseCsv(await fs.readFile(opts.input, "utf8"));
  for (const c of ["email", "statut"]) if (!cols.includes(c)) fail(`Colonne « ${c} » absente de ${opts.input}.`);
  const sourceCol = cols.find((c) => c.startsWith("où trouver"));

  const todo = rows.filter((r) => !r.email.trim() && (!opts.statut || r.statut === opts.statut) && channelRef(r));
  console.log(`🔎 ${todo.length} lignes sans e-mail à chercher sur ${rows.length} (≈ ${todo.length * 2} unités de quota)`);

  let found = 0;
  let socials = 0;
  const missing = [];
  for (const row of todo) {
    const name = row["chaîne"] || row.handle || "";
    const res = await yt(apiKey, "channels", { part: "snippet,contentDetails", ...channelRef(row) });
    const ch = res.items?.[0];
    if (!ch) {
      missing.push(`${name} (chaîne introuvable)`);
      continue;
    }
    const lists = [];
    const about = contactsFrom(ch.snippet.description || "", name);
    lists.push(about.emails.map((e) => ({ ...e, source: "description de la chaîne" })));
    const allSocial = [about.social];
    for (const v of await recentUploads(apiKey, ch.contentDetails?.relatedPlaylists?.uploads, opts.videos)) {
      const c = contactsFrom(v.description, name);
      lists.push(c.emails.map((e) => ({ ...e, source: `description de « ${v.title.slice(0, 60)} » https://youtu.be/${v.id}` })));
      allSocial.push(c.social);
    }

    // Deux adresses au plus : l'Apps Script n'écrit qu'à la première, la seconde sert de repli.
    const ranked = rankEmails(lists).slice(0, 2);
    if (ranked.length) {
      row.email = ranked.map((e) => e.email).join(" ");
      if (sourceCol) row[sourceCol] = ranked[0].source;
      found++;
    } else {
      missing.push(name);
    }
    for (const col of SOCIAL_COLS) {
      if (!cols.includes(col) || row[col]?.trim()) continue;
      const url = allSocial.map((s) => s[col]).find(Boolean);
      if (url) (row[col] = url.replace(/^https?:\/\/(www\.)?/, "")), socials++;
    }
    console.log(`${ranked.length ? "✉️ " : "·  "} ${name}${ranked.length ? ` : ${row.email}` : ""}`);
  }

  await fs.writeFile(opts.out, "﻿" + toCsv(cols, rows, ";"));
  console.log(
    `\n🏁 ${found} e-mails trouvés sur ${todo.length} lignes, ${socials} liens de réseaux ajoutés, ${quota.used} unités de quota.` +
      `\n   ${opts.out}\n`,
  );
  if (missing.length) {
    console.log(`Sans e-mail public (onglet À propos à ouvrir à la main, ou réseaux) : ${missing.join(", ")}\n`);
  }
}

main().catch((e) => fail(e.stack || e.message));
