#!/usr/bin/env node
/**
 * Récupère les performances des campagnes Meta (Facebook, Instagram) via l'API Marketing
 * (Insights) : dépense, impressions, clics sur le lien, vues de page de destination, départs
 * vers le jeu remontés par le Pixel (`PlayClick`, voir src/layouts/BaseLayout.astro), par
 * publicité, par placement, par appareil et par jour. Écrit dans .meta-cache/ (gitignored).
 *
 * Le pont avec PostHog est l'ID de la publicité : les liens des annonces portent
 * `utm_content={{ad.id}}`, que PostHog garde comme `$entry_utm_content` de la session. Si les
 * clés PostHog sont dans .env, Annonces.csv croise la dépense avec les sessions et les départs
 * vers le jeu mesurés sur le site (coût par session, coût par départ).
 *
 * Prérequis (une seule fois, dans le Business Manager) :
 *   1. Paramètres de l'entreprise > Utilisateurs système : créer un utilisateur système, rôle
 *      Employé.
 *   2. Lui attribuer l'app (Gérer l'app) et le compte publicitaire (Voir les performances).
 *   3. Générer un jeton pour cette app avec la seule permission `ads_read`, sans expiration.
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   META_ACCESS_TOKEN=EAA...
 *   META_AD_ACCOUNT_ID=act_1234567890
 *   META_APP_SECRET=...            # optionnel (ou META_APP_SECRET_KEY), si l'app exige appsecret_proof
 *   META_API_VERSION=v23.0         # optionnel
 *   POSTHOG_PERSONAL_API_KEY / POSTHOG_PROJECT_ID / POSTHOG_API_HOST   # optionnels, croisement
 *
 * Usage :
 *   node scripts/meta-fetch.mjs                 # 30 derniers jours (défaut)
 *   node scripts/meta-fetch.mjs --days 14
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseArgs(argv) {
  const o = { days: 30, out: ".meta-cache" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  if (!Number.isInteger(o.days) || o.days < 1) fail("--days attend un entier positif.");
  return o;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toCsv(header, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}

const num = (v, digits = 0) => (v === null || v === undefined || Number.isNaN(Number(v)) ? "" : Number(v).toFixed(digits));
const ratio = (cost, count) => (Number(count) ? (Number(cost) / Number(count)).toFixed(2) : "");
const pct = (part, total) => (Number(total) ? ((Number(part) / Number(total)) * 100).toFixed(2) : "");

// `actions` est une liste { action_type, value } : on en tire les trois qui comptent ici. Un
// événement personnalisé du Pixel remonte en `offsite_conversion.fb_pixel_custom` (tous
// confondus) ; une conversion personnalisée créée dessus, en `offsite_conversion.custom.<id>`.
function pickActions(actions = []) {
  const get = (type) => actions.find((a) => a.action_type === type)?.value || 0;
  const custom = actions
    .filter((a) => a.action_type.startsWith("offsite_conversion.custom."))
    .reduce((n, a) => n + Number(a.value), 0);
  return {
    linkClicks: Number(get("link_click")),
    landingViews: Number(get("landing_page_view")),
    playClicks: custom || Number(get("offsite_conversion.fb_pixel_custom")),
  };
}

async function insights(ctx, params) {
  const url = new URL(`https://graph.facebook.com/${ctx.version}/${ctx.account}/insights`);
  const time_range = JSON.stringify({ since: ctx.since, until: ctx.until });
  for (const [k, v] of Object.entries({ ...params, time_range, limit: "500" })) url.searchParams.set(k, v);
  url.searchParams.set("access_token", ctx.token);
  if (ctx.proof) url.searchParams.set("appsecret_proof", ctx.proof);

  const rows = [];
  let next = url.toString();
  while (next) {
    // Jamais d'URL dans les messages : elle porte le jeton.
    const res = await fetch(next);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      const e = body.error || {};
      throw new Error(`${res.status} ${e.type || ""} ${e.code || ""} : ${e.message || "réponse illisible"}`);
    }
    rows.push(...(body.data || []));
    next = body.paging?.next || null;
  }
  return rows;
}

// Mêmes jours que Meta, sinon le coût par session divise une dépense par des sessions d'une
// autre période.
async function posthogSessions(since, until) {
  const apiKey = await loadEnvVar("POSTHOG_PERSONAL_API_KEY");
  const projectId = await loadEnvVar("POSTHOG_PROJECT_ID");
  if (!apiKey || !projectId) return null;
  const apiHost = ((await loadEnvVar("POSTHOG_API_HOST")) || "https://eu.posthog.com").replace(/\/$/, "");
  const range = (col) => `toDate(${col}) >= toDate('${since}') AND toDate(${col}) <= toDate('${until}')`;
  const query = `
    SELECT
      \`$entry_utm_content\` AS ad,
      count() AS sessions,
      countIf(session_id IN (
        SELECT DISTINCT \`$session_id\` FROM events
        WHERE event = 'play_click' AND ${range("timestamp")}
      )) AS played,
      toString(min(toDate(\`$start_timestamp\`))) AS first_day
    FROM sessions
    WHERE ${range("`$start_timestamp`")}
      AND \`$entry_utm_source\` IN ('fb', 'ig') AND \`$entry_utm_medium\` = 'paid'
    GROUP BY ad`;
  const res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query }, name: "meta-fetch" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn(`⚠️  PostHog indisponible (${res.status}) : Annonces.csv sans croisement.`);
    return null;
  }
  const results = body.results || [];
  // Le site n'a son propre projet PostHog que depuis le 2026-10-16 : avant, pas de sessions.
  const firstDay = results.map((r) => r[3]).sort()[0];
  if (firstDay && firstDay > since) {
    console.warn(
      `⚠️  Sessions PostHog à partir du ${firstDay} seulement : coût par session et par départ ` +
        `faussés sur cette période, relancer avec --days couvrant ${firstDay} → ${until}.`
    );
  }
  return new Map(results.map(([ad, sessions, played]) => [String(ad), { sessions, played }]));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const token = await loadEnvVar("META_ACCESS_TOKEN");
  let account = await loadEnvVar("META_AD_ACCOUNT_ID");
  const secret = (await loadEnvVar("META_APP_SECRET")) || (await loadEnvVar("META_APP_SECRET_KEY"));
  const version = (await loadEnvVar("META_API_VERSION")) || "v23.0";
  if (!token) fail("META_ACCESS_TOKEN manquant dans .env (jeton d'utilisateur système, permission ads_read).");
  if (!account) fail("META_AD_ACCOUNT_ID manquant dans .env (act_ suivi de l'ID du compte publicitaire).");
  if (!/^(act_)?\d+$/.test(account)) fail(`META_AD_ACCOUNT_ID invalide : ${account}`);
  if (!account.startsWith("act_")) account = `act_${account}`;

  // Hier inclus : la journée en cours est incomplète côté Meta.
  const until = new Date();
  until.setDate(until.getDate() - 1);
  const since = new Date(until);
  since.setDate(since.getDate() - (opts.days - 1));
  const ctx = {
    token,
    account,
    version,
    since: ymd(since),
    until: ymd(until),
    proof: secret ? crypto.createHmac("sha256", secret).update(token).digest("hex") : null,
  };

  console.log(`\n▶ Meta fetch — ${account} | ${ctx.since} → ${ctx.until}`);

  const base = "spend,impressions,reach,frequency,cpm,inline_link_clicks,inline_link_click_ctr,actions";
  const [ads, placements, devices, days, posthog] = await Promise.all([
    insights(ctx, { level: "ad", fields: `campaign_name,adset_id,adset_name,ad_id,ad_name,${base}` }),
    insights(ctx, { level: "account", fields: base, breakdowns: "publisher_platform,platform_position" }),
    insights(ctx, { level: "account", fields: base, breakdowns: "impression_device" }),
    insights(ctx, { level: "account", fields: base, time_increment: "1" }),
    posthogSessions(ctx.since, ctx.until),
  ]);

  const cols = [
    "Dépense (€)", "Impressions", "CPM (€)", "Clics sur le lien", "CTR lien (%)",
    "Vues de page de destination", "Clic → page chargée (%)", "Coût par vue de page (€)",
    "PlayClick (Pixel)", "Coût par PlayClick (€)",
  ];
  const vals = (r) => {
    const a = pickActions(r.actions);
    return [
      num(r.spend, 2), r.impressions, num(r.cpm, 2), a.linkClicks, num(r.inline_link_click_ctr, 2),
      a.landingViews, pct(a.landingViews, a.linkClicks), ratio(r.spend, a.landingViews),
      a.playClicks, ratio(r.spend, a.playClicks),
    ];
  };

  const adsCsv = toCsv(
    ["Campagne", "Ensemble", "ID ensemble", "Publicité", "ID publicité", ...cols,
      "Sessions site (PostHog)", "Départs vers le jeu (PostHog)", "Coût par session (€)", "Coût par départ (€)"],
    ads
      .sort((x, y) => Number(y.spend) - Number(x.spend))
      .map((r) => {
        const p = posthog?.get(String(r.ad_id));
        return [
          r.campaign_name, r.adset_name, r.adset_id, r.ad_name, r.ad_id, ...vals(r),
          p ? p.sessions : "", p ? p.played : "",
          p ? ratio(r.spend, p.sessions) : "", p ? ratio(r.spend, p.played) : "",
        ];
      })
  );
  const placementsCsv = toCsv(
    ["Plateforme", "Placement", ...cols],
    placements
      .sort((x, y) => Number(y.spend) - Number(x.spend))
      .map((r) => [r.publisher_platform, r.platform_position, ...vals(r)])
  );
  const devicesCsv = toCsv(
    ["Appareil", ...cols],
    devices.sort((x, y) => Number(y.spend) - Number(x.spend)).map((r) => [r.impression_device, ...vals(r)])
  );
  const daysCsv = toCsv(["Jour", ...cols], days.map((r) => [r.date_start, ...vals(r)]));

  const dir = path.join(opts.out, `${account}-Meta-${ymd(new Date())}`);
  await fs.mkdir(dir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(dir, "Annonces.csv"), adsCsv),
    fs.writeFile(path.join(dir, "Placements.csv"), placementsCsv),
    fs.writeFile(path.join(dir, "Appareils.csv"), devicesCsv),
    fs.writeFile(path.join(dir, "Jours.csv"), daysCsv),
  ]);

  const spend = ads.reduce((n, r) => n + Number(r.spend || 0), 0);
  console.log(
    `✅ ${ads.length} publicités, ${spend.toFixed(2)} € dépensés, ` +
      `${posthog ? "croisé avec PostHog" : "sans croisement PostHog"} -> ${dir}\n`
  );
}

main().catch((e) => fail(e.message));
