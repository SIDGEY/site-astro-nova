#!/usr/bin/env node
/**
 * Trouve des créateurs YouTube francophones à contacter pour amener des joueurs sur
 * Dynasty Nova, et les écrit au format de la feuille « cibles » (prospection envoyée depuis
 * Gmail par Apps Script, voir editorial/createurs/envoi-gmail.gs) : une ligne par chaîne,
 * avec l'e-mail public quand il existe, la vidéo de référence, le lien tracé et le message
 * personnalisé, prête à importer.
 *
 * Un profil par segment de la feuille. Chaque profil est un jeu de recherches de vidéos
 * publiées dans l'année, en français :
 *   navigateur (défaut)  jeux navigateur, gratuits sans téléchargement, .io, Poki
 *   ogame                OGame, jeux comme OGame, Travian, 4X spatial navigateur
 *   espace               No Man's Sky, Star Citizen, Elite, Stellaris, X4…
 *   strategie            Total War, Hearts of Iron, Civilization, Age of Empires…
 *   mobile               stratégie mobile, Clash of Clans, jeux mobiles gratuits
 *   mmo                  MMORPG, MMO gratuits, « à quel MMO jouer »
 *   decouverte           je découvre, pépites, jeux gratuits à tester
 *   nostalgie            jeux d'enfance, jeux flash, jeux en ligne des années 2000
 *   gestion              jeux de gestion, city builders, Anno, Cities Skylines
 * Le segment de la feuille reprend le nom du profil.
 *
 * Pour chaque chaîne : abonnés, vues médianes des vidéos sur le thème, format (long ou
 * short), dernière mise en ligne, et les contacts publics trouvés dans la description de la
 * chaîne et de ses 25 dernières vidéos (« Contact pro : … »), avec la vidéo où l'adresse a
 * été vue. Écartées : chaînes « conçues pour les enfants », chaînes d'éditeurs et de médias,
 * chaînes sans titre en français, chaînes inactives depuis plus de 180 jours, et celles déjà
 * dans la feuille (`--exclure`).
 *
 * Prérequis (une seule fois, dans Google Cloud, le projet du compte de service GSC convient) :
 *   1. APIs & Services > Library : activer « YouTube Data API v3 ».
 *   2. APIs & Services > Credentials : créer une clé API, la restreindre à cette API.
 *
 * Quota : 10 000 unités par jour. Une recherche coûte 100 unités, le reste 1 unité par
 * appel : un profil (8 à 14 requêtes, 1 page) prend 1 000 à 1 600 unités, soit 5 ou 6
 * profils par jour. `--pages 2` double le nombre de chaînes et le coût des recherches.
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   YOUTUBE_API_KEY=AIza...
 *
 * Usage :
 *   node scripts/youtube-creators.mjs --check                                  # vérifie la clé (1 unité)
 *   node scripts/youtube-creators.mjs --exclure cibles.csv                     # profil navigateur, sans les chaînes déjà dans la feuille
 *   node scripts/youtube-creators.mjs --profil espace --exclure cibles.csv
 *   node scripts/youtube-creators.mjs --profil mobile --min 5000 --max 0      # --max 0 : pas de plafond d'abonnés
 *   node scripts/youtube-creators.mjs --query "hades star" --query "eve online fr"   # remplace les requêtes du profil
 *   node scripts/youtube-creators.mjs --campagne createurs-2026-11             # utm_campaign du lien tracé
 *
 * Sorties dans .youtube-cache/ (gitignored) :
 *   cibles-<profil>-<date>.csv   au format de la feuille, séparateur « ; », à importer
 *                                (Fichier > Importer > Ajouter à la feuille actuelle)
 *   creators-<profil>-<date>.json  tout le détail : score, vidéos trouvées, e-mails, réseaux
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  checkKey, chunks, contactsFrom, fail, loadEnvVar, parseCsv, quota, rankEmails, recentUploads, slug, toCsv, yt,
} from "./youtube-lib.mjs";

// Requête -> poids dans le score : plus la vidéo est proche de Dynasty Nova (navigateur,
// gratuit, stratégie spatiale), plus la chaîne a de chances d'avoir le bon public.
const PROFILES = {
  navigateur: {
    min: 1000, max: 0, order: "viewCount",
    queries: [
      ["jeu navigateur stratégie", 5], ["jeux navigateur", 4], ["jeu navigateur", 4],
      ["je teste des jeux navigateur", 4], ["meilleurs jeux navigateur", 4], ["jeux sur navigateur gratuits", 4],
      ["jeux gratuits sans téléchargement", 3], ["jeux en ligne gratuits", 3], ["jeux navigateur bizarres", 3],
      ["jeux .io", 2], ["jeux poki", 2], ["jeux crazygames", 2], ["jeux flash", 2], ["ogame", 2],
    ],
  },
  ogame: {
    min: 500, max: 0, order: "relevance",
    queries: [
      ["ogame", 5], ["ogame fr", 5], ["jeu comme ogame", 5], ["jeu spatial navigateur", 4],
      ["jeu de stratégie spatiale", 4], ["jeu stratégie spatiale gratuit", 4], ["travian fr", 3], ["jeu 4x spatial", 3],
      ["jeu de stratégie en ligne gratuit", 3], ["jeux de stratégie navigateur", 3],
    ],
  },
  espace: {
    min: 1000, max: 0, order: "relevance",
    queries: [
      ["no man's sky fr", 3], ["star citizen fr", 3], ["elite dangerous fr", 3], ["stellaris fr", 4],
      ["x4 foundations fr", 3], ["endless space 2 fr", 4], ["jeu spatial", 4], ["jeu de conquête spatiale", 5],
      ["meilleurs jeux spatiaux", 4], ["eve online fr", 3],
    ],
  },
  strategie: {
    min: 1000, max: 0, order: "relevance",
    queries: [
      ["jeu de stratégie", 4], ["meilleurs jeux de stratégie", 4], ["total war fr", 3], ["hearts of iron 4 fr", 3],
      ["civilization 7 fr", 3], ["age of empires fr", 3], ["jeu de stratégie gratuit", 5], ["jeu 4x", 4],
      ["rts fr", 2], ["jeu de stratégie mobile", 4],
    ],
  },
  mobile: {
    min: 1000, max: 0, order: "viewCount",
    queries: [
      ["jeu mobile stratégie", 5], ["meilleurs jeux mobile gratuits", 4], ["clash of clans fr", 3],
      ["jeux mobile 2026", 3], ["jeu mobile gratuit", 4], ["jeux android gratuits", 3], ["jeux iphone gratuits", 3],
      ["jeu de stratégie mobile gratuit", 5], ["whiteout survival fr", 3], ["rise of kingdoms fr", 3],
    ],
  },
  mmo: {
    min: 1000, max: 0, order: "relevance",
    queries: [
      ["mmorpg fr", 3], ["à quel mmo jouer", 4], ["mmo gratuit", 4], ["meilleurs mmorpg gratuits", 4],
      ["mmo navigateur", 5], ["nouveau mmo 2026", 3], ["mmo stratégie", 5], ["mmo spatial", 5],
    ],
  },
  decouverte: {
    min: 1000, max: 0, order: "viewCount",
    queries: [
      ["je découvre un jeu gratuit", 4], ["pépites jeux gratuits", 4], ["jeux gratuits à tester", 4],
      ["jeux gratuits pc", 3], ["je teste des jeux gratuits", 4], ["jeux méconnus", 3], ["jeux indé fr", 2],
      ["découverte jeu fr", 3],
    ],
  },
  nostalgie: {
    min: 1000, max: 0, order: "relevance",
    queries: [
      ["jeux de mon enfance", 4], ["jeux flash nostalgie", 5], ["jeux en ligne des années 2000", 5],
      ["nostalgie jeux navigateur", 5], ["jeux pc années 2000", 3], ["ces jeux que tout le monde a oubliés", 3],
      ["miniclip nostalgie", 4], ["dofus nostalgie", 3],
    ],
  },
  gestion: {
    min: 1000, max: 0, order: "relevance",
    queries: [
      ["jeu de gestion", 4], ["meilleurs jeux de gestion", 4], ["city builder fr", 3], ["anno 117 fr", 3],
      ["cities skylines 2 fr", 3], ["jeu de gestion gratuit", 5], ["factorio fr", 3], ["jeu de colonie", 4],
    ],
  },
};

// Éditeurs, portails et médias : ils ne relaient pas un jeu concurrent, inutile de les démarcher.
const EXCLUDED = /gameforge|poki|crazygames|jeuxvideo\.com|jvcom|gamekult|millenium|gameblog|ign france|ubisoft|supercell|dynasty ?nova|astro ?nova/i;

// Mots outils et accents : un titre qui n'en a aucun n'est très probablement pas en français.
const FRENCH = /[èêàùçœ]|\b(les|des|du|une|jeux?|je|j|est|pour|avec|sur|et|qui|pas|mon|ce|cette|gratuits?|meilleurs?|navigateur)\b/i;

const FR_COUNTRIES = new Set(["FR", "BE", "CH", "CA", "LU", "MC", "MA", "TN", "SN", "CI", "DZ"]);

// Colonnes de la feuille « cibles », dans l'ordre.
const SHEET_COLS = [
  "palier", "segment", "chaîne", "handle", "url", "abonnés", "vues médianes", "format", "email",
  "où trouver le contact", "twitch", "tiktok", "instagram", "discord", "x", "vidéo de référence",
  "lien tracé", "objet", "message", "statut", "envoyé le", "relancé le", "réponse", "vidéo publiée",
];
const TEMPLATE = "editorial/createurs/message-youtube.txt";
const OBJET = "Dynasty Nova : un jeu de stratégie spatiale à tester pour ta chaîne ?";

function parseArgs(argv) {
  const profil = argv.includes("--profil") ? argv[argv.indexOf("--profil") + 1] : "navigateur";
  if (!PROFILES[profil]) fail(`--profil attend ${Object.keys(PROFILES).join(", ")}.`);
  const { queries, ...defaults } = PROFILES[profil];
  const month = new Date().toISOString().slice(0, 7);
  const o = {
    profil, ...defaults, days: 365, pages: 1, out: ".youtube-cache", queries: [], check: false,
    exclure: [], campagne: `createurs-${month}`, inactif: 180,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--profil") i++;
    else if (argv[i] === "--check") o.check = true;
    else if (argv[i] === "--min") o.min = Number(argv[++i]);
    else if (argv[i] === "--max") o.max = Number(argv[++i]);
    else if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--pages") o.pages = Number(argv[++i]);
    else if (argv[i] === "--order") o.order = argv[++i];
    else if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--exclure") o.exclure.push(argv[++i]);
    else if (argv[i] === "--campagne") o.campagne = argv[++i];
    else if (argv[i] === "--inactif") o.inactif = Number(argv[++i]);
    else if (argv[i] === "--query") o.queries.push([argv[++i], 3]);
    else fail(`Option inconnue : ${argv[i]}`);
  }
  for (const k of ["min", "max", "days", "pages", "inactif"]) {
    if (!Number.isInteger(o[k]) || o[k] < 0) fail(`--${k} attend un entier positif.`);
  }
  if (o.pages < 1 || o.pages > 5) fail("--pages attend un entier de 1 à 5.");
  if (!["relevance", "viewCount", "date"].includes(o.order)) fail("--order attend relevance, viewCount ou date.");
  if (!/^[\w-]+$/.test(o.campagne)) fail("--campagne : lettres, chiffres, tirets.");
  if (!o.queries.length) o.queries = queries;
  return o;
}

function daysSince(iso) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
}

function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

// Durée ISO 8601 (PT1M30S) en secondes.
function seconds(iso = "") {
  const [, h = 0, m = 0, s = 0] = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/** Chaînes déjà présentes dans la feuille (par handle et par URL), à ne pas reproposer. */
async function loadExcluded(files) {
  const known = new Set();
  for (const file of files) {
    const { rows } = parseCsv(await fs.readFile(file, "utf8"));
    for (const r of rows) {
      if (r.handle) known.add(r.handle.trim().toLowerCase().replace(/^@?/, "@"));
      if (r.url) known.add(r.url.trim().toLowerCase().replace(/\/$/, ""));
    }
  }
  return known;
}

function cleanTitle(title) {
  return title.replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = await loadEnvVar("YOUTUBE_API_KEY");
  if (!apiKey) fail("YOUTUBE_API_KEY manquante (voir l'en-tête du script et .env.example).");
  if (opts.check) return checkKey(apiKey);

  const known = await loadExcluded(opts.exclure);
  const template = await fs.readFile(TEMPLATE, "utf8");
  const publishedAfter = new Date(Date.now() - opts.days * 86400000).toISOString();

  // 1. Recherche : vidéos récentes en français sur chaque thème, regroupées par chaîne.
  const byChannel = new Map();
  for (const [q, weight] of opts.queries) {
    let pageToken;
    for (let p = 0; p < opts.pages; p++) {
      const res = await yt(
        apiKey,
        "search",
        { part: "snippet", type: "video", q, maxResults: 50, relevanceLanguage: "fr", regionCode: "FR", publishedAfter, order: opts.order, pageToken },
        100,
      );
      for (const item of res.items || []) {
        const id = item.snippet.channelId;
        if (!byChannel.has(id)) byChannel.set(id, { videos: new Map(), relevance: 0, queries: new Set() });
        const c = byChannel.get(id);
        if (!c.videos.has(item.id.videoId)) {
          c.videos.set(item.id.videoId, { id: item.id.videoId, title: item.snippet.title, publishedAt: item.snippet.publishedAt });
          c.relevance += weight;
        }
        c.queries.add(q);
      }
      pageToken = res.nextPageToken;
      if (!pageToken) break;
    }
    console.log(`🔎 « ${q} » : ${byChannel.size} chaînes cumulées`);
  }

  // 2. Chaînes : taille, pays, langue, public enfant, playlist des mises en ligne.
  const channels = [];
  for (const ids of chunks([...byChannel.keys()], 50)) {
    const res = await yt(apiKey, "channels", { part: "snippet,statistics,contentDetails,brandingSettings,status", id: ids.join(","), maxResults: 50 });
    channels.push(...(res.items || []));
  }

  let already = 0;
  const kept = channels.filter((ch) => {
    const subs = Number(ch.statistics.subscriberCount || 0);
    if (ch.statistics.hiddenSubscriberCount) return false;
    if (subs < opts.min || (opts.max && subs > opts.max)) return false;
    // Public enfant : commentaires fermés, pas la cible d'un 4X, et règles publicitaires à part.
    if (ch.status?.madeForKids) return false;
    if (EXCLUDED.test(ch.snippet.title) || EXCLUDED.test(ch.snippet.customUrl || "")) return false;
    if (![...byChannel.get(ch.id).videos.values()].some((v) => FRENCH.test(v.title))) return false;
    const country = ch.snippet.country || ch.brandingSettings?.channel?.country;
    const lang = ch.snippet.defaultLanguage || ch.brandingSettings?.channel?.defaultLanguage || "";
    // Pays absent : fréquent, on garde (les vidéos viennent déjà d'une recherche en français).
    if (country && !FR_COUNTRIES.has(country) && !lang.startsWith("fr")) return false;
    const handle = (ch.snippet.customUrl || "").toLowerCase();
    if (known.has(handle) || known.has(`https://www.youtube.com/${handle}`) || known.has(`https://www.youtube.com/channel/${ch.id}`.toLowerCase())) {
      already++;
      return false;
    }
    return true;
  });
  const range = opts.max ? `${opts.min} à ${opts.max} abonnés` : `${opts.min} abonnés et plus`;
  console.log(
    `📺 ${channels.length} chaînes trouvées, ${kept.length} nouvelles dans la cible (profil ${opts.profil}, ${range}, francophones)` +
      (already ? `, ${already} déjà dans la feuille` : ""),
  );

  // 3. Vues et durée des vidéos sur le thème (médiane, long ou short).
  const videoStats = new Map();
  for (const ids of chunks(kept.flatMap((ch) => [...byChannel.get(ch.id).videos.keys()]), 50)) {
    const res = await yt(apiKey, "videos", { part: "statistics,contentDetails", id: ids.join(","), maxResults: 50 });
    for (const v of res.items || []) {
      videoStats.set(v.id, { views: Number(v.statistics.viewCount || 0), seconds: seconds(v.contentDetails.duration) });
    }
  }

  // 4. Activité et contacts : descriptions de la chaîne et de ses dernières vidéos.
  const rows = [];
  for (const ch of kept) {
    const found = byChannel.get(ch.id);
    const name = ch.snippet.title;
    const uploads = await recentUploads(apiKey, ch.contentDetails?.relatedPlaylists?.uploads);
    const sinceLast = uploads.length ? Math.min(...uploads.map((u) => daysSince(u.publishedAt))) : null;
    if (sinceLast === null || sinceLast > opts.inactif) continue;
    const uploads90 = uploads.filter((u) => daysSince(u.publishedAt) <= 90).length;

    const about = contactsFrom(ch.snippet.description || "", name);
    const fromVideos = uploads.map((u) => ({ u, c: contactsFrom(u.description, name) }));
    const emails = rankEmails([
      about.emails.map((e) => ({ ...e, source: "description de la chaîne" })),
      ...fromVideos.map(({ u, c }) => c.emails.map((e) => ({ ...e, source: `description de « ${u.title.slice(0, 60)} » https://youtu.be/${u.id}` }))),
    ]).slice(0, 2);
    const social = {};
    for (const s of [about.social, ...fromVideos.map(({ c }) => c.social)]) {
      for (const [k, v] of Object.entries(s)) if (v && !social[k]) social[k] = v.replace(/^https?:\/\/(www\.)?/, "");
    }

    const subs = Number(ch.statistics.subscriberCount);
    const theme = [...found.videos.values()].map((v) => ({ ...v, ...(videoStats.get(v.id) || { views: 0, seconds: 0 }) }));
    const medianViews = median(theme.map((v) => v.views));
    const isShort = theme.filter((v) => (v.seconds && v.seconds <= 180) || /#shorts?\b/i.test(v.title)).length > theme.length / 2;
    const viewRatio = subs ? medianViews / subs : 0;
    const ref = [...theme].sort((a, b) => b.views - a.views)[0];

    // Score : thème (poids des requêtes), portée (vues médianes, en ordre de grandeur : 1 k
    // vaut 0, 1 M vaut 24), audience réelle (vues / abonnés, plafonné), chaîne active, et un
    // e-mail public, sans lequel l'envoi automatique ne part pas.
    const score =
      Math.min(found.relevance, 25) * 2 +
      Math.max(0, Math.log10(medianViews + 1) - 3) * 8 +
      Math.min(viewRatio, 1.5) * 20 +
      (sinceLast <= 30 ? 15 : sinceLast <= 90 ? 8 : 0) +
      Math.min(uploads90, 12) +
      (emails.length ? 15 : 0);

    const handle = ch.snippet.customUrl || "";
    const link =
      `https://play.dynastynova.com/?utm_source=youtube&utm_medium=createur&utm_campaign=${opts.campagne}` +
      `&utm_content=yt-${slug(handle || ch.id)}`;
    const support = isShort ? "un short" : "une vidéo";
    const accroche = `Je t'écris après ${isShort ? "ton short" : "ta vidéo"} « ${cleanTitle(ref.title)} ».`;
    const message = template
      .replaceAll("{nom}", () => name)
      .replaceAll("{accroche}", () => accroche)
      .replaceAll("{support}", () => support)
      .replaceAll("{lien}", () => link)
      .trim();

    rows.push({
      score: Math.round(score),
      detail: {
        relevance: found.relevance,
        ratio_vues_abonnes: Number(viewRatio.toFixed(2)),
        derniere_video_jours: sinceLast,
        videos_90j: uploads90,
        videos_theme: theme.sort((a, b) => b.views - a.views).slice(0, 5).map((v) => `${v.publishedAt.slice(0, 10)} ${v.title} (${v.views} vues)`),
        requetes: [...found.queries],
        emails,
        social,
      },
      sheet: {
        palier: subs >= 100000 ? 2 : 1,
        segment: opts.profil,
        "chaîne": name,
        handle,
        url: handle ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/channel/${ch.id}`,
        "abonnés": subs,
        "vues médianes": medianViews,
        format: isShort ? "short" : "long",
        email: emails.map((e) => e.email).join(" "),
        "où trouver le contact": emails[0]?.source || `https://www.youtube.com/${handle || `channel/${ch.id}`}/about (bouton « Afficher l'adresse e-mail »)`,
        twitch: social.twitch || "",
        tiktok: social.tiktok || "",
        instagram: social.instagram || "",
        discord: social.discord || "",
        x: social.x || "",
        "vidéo de référence": `${ref.title} (${ref.views} vues) https://youtu.be/${ref.id}`,
        "lien tracé": link,
        objet: OBJET,
        message,
        statut: "à contacter",
      },
    });
  }
  // Avec e-mail d'abord (ils partent tels quels), puis par score.
  rows.sort((a, b) => Boolean(b.sheet.email) - Boolean(a.sheet.email) || b.score - a.score);

  // 5. Sorties.
  await fs.mkdir(opts.out, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const csvPath = path.join(opts.out, `cibles-${opts.profil}-${stamp}.csv`);
  const jsonPath = path.join(opts.out, `creators-${opts.profil}-${stamp}.json`);
  await fs.writeFile(csvPath, "﻿" + toCsv(SHEET_COLS, rows.map((r) => r.sheet), ";"));
  await fs.writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), options: opts, rows }, null, 2));

  const withEmail = rows.filter((r) => r.sheet.email).length;
  console.log(`\n🏁 ${rows.length} créateurs, dont ${withEmail} avec un e-mail public, ${quota.used} unités de quota utilisées`);
  console.log(`   ${csvPath}\n   ${jsonPath}\n`);
  for (const r of rows.slice(0, 25)) {
    console.log(
      `${String(r.score).padStart(3)}  ${r.sheet["chaîne"]} — ${r.sheet["abonnés"].toLocaleString("fr-FR")} abonnés, ` +
        `${r.sheet["vues médianes"].toLocaleString("fr-FR")} vues médianes, ${r.sheet.format}` +
        `${r.sheet.email ? `, ${r.sheet.email.split(" ")[0]}` : ""}`,
    );
  }
}

main().catch((e) => fail(e.stack || e.message));
