#!/usr/bin/env node
/**
 * Pilote le compte Reddit Ads de Dynasty Nova par l'API Reddit Ads v3 (https://ads-api.reddit.com/api/v3) :
 * lecture des campagnes, groupes d'annonces, annonces, dépense et clics par jour et par communauté,
 * et écritures encadrées par les garde-fous de scripts/ads-lib.mjs. Écrit ses relevés dans
 * .ads-cache/ (gitignored).
 *
 * Lecture seule par défaut, écriture seulement avec --apply ; création, activation et hausse de
 * budget exigent en plus --confirm <jeton> (accord de l'utilisateur). Reddit n'a pas de
 * validate_only : le dry-run est un plan affiché, rien n'est envoyé.
 *
 * Modèle de budget : campagnes sans optimisation de budget (CBO) ; le budget journalier est porté
 * par chaque groupe d'annonces (`goal_type: DAILY_SPEND`, `goal_value` en micro-devise). Les
 * garde-fous (plafond, +30 % par semaine) s'appliquent donc par groupe d'annonces. Le compte doit
 * être en euros : sinon toute écriture de budget est refusée.
 *
 * Prérequis (une seule fois, à faire par l'utilisateur) :
 *   1. Business Manager Reddit > Developer Portal : créer une app (admin d'une entreprise vérifiée),
 *      noter client ID et secret, et une URL de redirection.
 *   2. Ouvrir https://www.reddit.com/api/v1/authorize?client_id=<ID>&response_type=code&state=x
 *      &redirect_uri=<URI>&duration=permanent&scope=adsread,adsedit,adsconversions
 *      puis échanger le code (valable 10 minutes) : node scripts/ads-reddit.mjs token --code <code> --redirect-uri <URI>
 *   3. Créer le pixel Reddit dans l'Events Manager (obligatoire sur tout groupe d'annonces depuis le
 *      2026-07-13) et noter son ID.
 *
 * Variables d'env (.env.local, jamais commité ; voir .env.example) :
 *   REDDIT_ADS_CLIENT_ID, REDDIT_ADS_CLIENT_SECRET, REDDIT_ADS_REFRESH_TOKEN
 *   REDDIT_ADS_ACCOUNT_ID=a2_...      # compte publicitaire
 *   REDDIT_ADS_PIXEL_ID=...           # pixel Reddit (groupes d'annonces, API de conversion)
 *   REDDIT_ADS_USER_AGENT=...         # facultatif
 *   ADS_DAILY_CAP_EUR=...             # plafond journalier total, toutes régies
 *
 * Usage :
 *   node scripts/ads-reddit.mjs lint --spec editorial/ads/reddit/reddit-en-ogame.json   # hors ligne
 *   node scripts/ads-reddit.mjs read [--days 30]
 *   node scripts/ads-reddit.mjs create --spec <fichier> --budget-eur 5 --bid-eur 0.5
 *   node scripts/ads-reddit.mjs enable|pause --campaign <id> | --ad-group <id>
 *   node scripts/ads-reddit.mjs set-budget --ad-group <id> --eur 6
 *   node scripts/ads-reddit.mjs exclude-keywords --ad-group <id> --add "a,b" | --remove "a"
 *   node scripts/ads-reddit.mjs ad-status --ad <id> --status PAUSED|ACTIVE
 *   node scripts/ads-reddit.mjs upload-conversions [--days 3]
 *   (toute écriture : ajouter --apply, et --confirm <jeton> quand le dry-run le demande)
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  CACHE_DIR,
  digest,
  fail,
  gate,
  guardBudgetIncrease,
  guardDailyCap,
  loadEnvVar,
  logWrite,
  paidSignups,
  parseArgs,
  quoteArg,
  recordBudgets,
  requireEnv,
  writeCsv,
  ymd,
} from "./ads-lib.mjs";

const SCRIPT = "node scripts/ads-reddit.mjs";
const API = "https://ads-api.reddit.com/api/v3";
const REQUIRED = ["REDDIT_ADS_CLIENT_ID", "REDDIT_ADS_CLIENT_SECRET", "REDDIT_ADS_REFRESH_TOKEN", "REDDIT_ADS_ACCOUNT_ID"];
const micros = (eur) => Math.round(eur * 1e6);
const fromMicros = (v) => (v === null || v === undefined ? null : Number(v) / 1e6);

async function userAgent() {
  return (await loadEnvVar("REDDIT_ADS_USER_AGENT")) || "node:dynastynova-ads:1.0";
}

async function connect() {
  const env = await requireEnv(REQUIRED, "Voir l'en-tête de scripts/ads-reddit.mjs et .env.example.");
  const ua = await userAgent();
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.REDDIT_ADS_CLIENT_ID}:${env.REDDIT_ADS_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": ua,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: env.REDDIT_ADS_REFRESH_TOKEN }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) fail(`OAuth Reddit ${res.status} : ${body.error || body.message || "réponse illisible"}`);
  const call = async (method, url, data) => {
    const r = await fetch(url.startsWith("http") ? url : `${API}${url}`, {
      method,
      headers: { Authorization: `Bearer ${body.access_token}`, "User-Agent": ua, "Content-Type": "application/json" },
      body: data ? JSON.stringify({ data }) : undefined,
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${method} ${url.replace(API, "")} → ${r.status} ${JSON.stringify(out.error || out).slice(0, 400)}`);
    return out;
  };
  const list = async (url) => {
    const items = [];
    let next = url;
    while (next) {
      const out = await call("GET", next);
      items.push(...(out.data || []));
      next = out.pagination?.next_url || null;
    }
    return items;
  };
  return { account: env.REDDIT_ADS_ACCOUNT_ID, call, list };
}

async function run(label, fn) {
  try {
    return await fn();
  } catch (e) {
    fail(`${label} : ${e.message}`);
  }
}

// ── Lecture ──────────────────────────────────────────────────────────────────

async function snapshot(api) {
  const [acct, campaigns, adGroups, ads] = await Promise.all([
    api.call("GET", `/ad_accounts/${api.account}`),
    api.list(`/ad_accounts/${api.account}/campaigns`),
    api.list(`/ad_accounts/${api.account}/ad_groups`),
    api.list(`/ad_accounts/${api.account}/ads`),
  ]);
  const currency = acct.data?.currency || null;
  const byCampaign = new Map(campaigns.map((c) => [c.id, c]));
  // Un groupe ne dépense que si sa campagne et lui sont actifs.
  const budgets = adGroups.map((g) => {
    const c = byCampaign.get(g.campaign_id);
    const active = g.configured_status === "ACTIVE" && c?.configured_status === "ACTIVE";
    return {
      id: g.id,
      name: `${c?.name || g.campaign_id}/${g.name}`,
      campaignId: g.campaign_id,
      status: active ? "ACTIVE" : "PAUSED",
      dailyEur: g.goal_type === "DAILY_SPEND" ? fromMicros(g.goal_value) : null,
      raw: g,
    };
  });
  return { currency, campaigns, adGroups, ads, budgets };
}

async function report(api, from, to, breakdowns) {
  const out = await api.call("POST", `/ad_accounts/${api.account}/reports`, {
    breakdowns,
    fields: ["SPEND", "IMPRESSIONS", "CLICKS"],
    starts_at: `${from}T00:00:00Z`,
    ends_at: `${to}T00:00:00Z`,
    time_zone_id: "Europe/Paris",
  });
  return out.data?.metrics || [];
}

async function cmdRead(opts) {
  const api = await connect();
  const days = Number(opts.days || 30);
  if (!Number.isInteger(days) || days < 1) fail("--days attend un entier positif.");
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  console.log(`\n▶ Reddit Ads — ${ymd(from)} → ${ymd(to)} (exclu)`);
  const snap = await run("Lecture du compte", () => snapshot(api));
  const [byDay, byGroup, byCommunity] = await run("Rapport", () =>
    Promise.all([
      report(api, ymd(from), ymd(to), ["CAMPAIGN_ID", "DATE"]),
      report(api, ymd(from), ymd(to), ["AD_GROUP_ID"]),
      report(api, ymd(from), ymd(to), ["CAMPAIGN_ID", "COMMUNITY"]),
    ])
  );
  const name = new Map(snap.campaigns.map((c) => [c.id, c.name]));
  const money = (m) => (fromMicros(m) ?? 0).toFixed(2);
  const dir = path.join(CACHE_DIR, `reddit-${ymd(new Date())}`);
  await writeCsv(dir, "Campagnes.csv", ["ID", "Campagne", "Statut", "Objectif"], snap.campaigns.map((c) => [c.id, c.name, c.configured_status, c.objective]));
  await writeCsv(dir, "Groupes.csv", ["ID", "Campagne / groupe", "Statut effectif", `Budget jour (${snap.currency})`, "Communautés", "Mots-clés exclus"],
    snap.budgets.map((b) => [b.id, b.name, b.raw.effective_status, b.dailyEur?.toFixed(2), (b.raw.targeting?.communities || []).join(" "), (b.raw.targeting?.excluded_keywords || []).join(" ")]));
  await writeCsv(dir, "Annonces.csv", ["ID", "Groupe", "Nom", "Statut", "Statut effectif", "Post"], snap.ads.map((a) => [a.id, a.ad_group_id, a.name, a.configured_status, a.effective_status, a.post_id]));
  await writeCsv(dir, "Jours.csv", ["Date", "ID", "Campagne", `Dépense (${snap.currency})`, "Clics", "Impressions"],
    byDay.map((r) => [r.date, r.campaign_id, name.get(r.campaign_id) || "", money(r.spend), r.clicks, r.impressions]));
  await writeCsv(dir, "ParGroupe.csv", ["ID groupe", `Dépense (${snap.currency})`, "Clics", "Impressions"], byGroup.map((r) => [r.ad_group_id, money(r.spend), r.clicks, r.impressions]));
  await writeCsv(dir, "ParCommunaute.csv", ["Campagne", "Communauté", `Dépense (${snap.currency})`, "Clics", "Impressions"],
    byCommunity.map((r) => [name.get(r.campaign_id) || r.campaign_id, r.community, money(r.spend), r.clicks, r.impressions]));
  if (snap.currency === "EUR") await recordBudgets("reddit", snap.budgets.map(({ id, name: n, status, dailyEur }) => ({ id, name: n, status, dailyEur })));
  else console.log(`⚠️  Compte en ${snap.currency} : budgets non enregistrés en euros, aucune écriture de budget possible.`);
  console.log(`✅ ${snap.campaigns.length} campagnes, ${snap.adGroups.length} groupes, ${snap.ads.length} annonces -> ${dir}\n`);
}

// ── Écritures ────────────────────────────────────────────────────────────────

async function eurAccount(api) {
  const snap = await run("Lecture du compte", () => snapshot(api));
  if (snap.currency !== "EUR") fail(`Compte Reddit en ${snap.currency} : les garde-fous sont en euros, écriture refusée.`);
  return snap;
}

async function cmdStatus(opts, to) {
  const api = await connect();
  const snap = await eurAccount(api);
  const isCampaign = Boolean(opts.campaign);
  const id = opts.campaign || opts["ad-group"];
  if (!id) fail("--campaign <id> ou --ad-group <id> attendu.");
  const entity = isCampaign ? snap.campaigns.find((c) => c.id === id) : snap.adGroups.find((g) => g.id === id);
  if (!entity) fail(`${isCampaign ? "Campagne" : "Groupe"} ${id} introuvable.`);
  if (entity.configured_status === to) {
    console.log(`${entity.name} déjà ${to} : rien à faire.`);
    return;
  }
  const after = snap.budgets.map((b) => {
    const touched = isCampaign ? b.campaignId === id : b.id === id;
    if (!touched) return b;
    const campaignActive = isCampaign ? to === "ACTIVE" : snap.campaigns.find((c) => c.id === b.campaignId)?.configured_status === "ACTIVE";
    const groupActive = isCampaign ? b.raw.configured_status === "ACTIVE" : to === "ACTIVE";
    return { ...b, status: campaignActive && groupActive ? "ACTIVE" : "PAUSED" };
  });
  const needsConfirm = to === "ACTIVE";
  if (needsConfirm) await guardDailyCap("reddit", after);
  const flag = isCampaign ? `--campaign ${id}` : `--ad-group ${id}`;
  const action = to === "PAUSED" ? "pause" : "enable";
  const plan = { platform: "reddit", action, [isCampaign ? "campaign" : "adGroup"]: id, name: entity.name, before: entity.configured_status, after: to };
  if (!gate(plan, opts, { needsConfirm, command: `${SCRIPT} ${action} ${flag}` })) return;
  await run("Envoi", () => api.call("PATCH", `/${isCampaign ? "campaigns" : "ad_groups"}/${id}`, { configured_status: to }));
  await recordBudgets("reddit", after.map(({ id: i, name, status, dailyEur }) => ({ id: i, name, status, dailyEur })));
  await logWrite({
    platform: "reddit",
    action,
    target: `${entity.name} (${id})`,
    before: entity.configured_status,
    after: to,
    reason: opts.reason,
    rollback: `${SCRIPT} ${to === "PAUSED" ? "enable" : "pause"} ${flag} --apply${to === "PAUSED" ? " --confirm <jeton du dry-run>" : ""}`,
  });
  console.log(`✅ ${entity.name} : ${entity.configured_status} → ${to}`);
}

async function cmdSetBudget(opts) {
  const api = await connect();
  const snap = await eurAccount(api);
  const b = snap.budgets.find((x) => x.id === opts["ad-group"]);
  if (!b) fail("--ad-group <id> attendu (Groupes.csv).");
  if (b.dailyEur === null) fail(`${b.name} n'a pas de budget journalier (goal_type ${b.raw.goal_type}) : à régler dans le gestionnaire.`);
  const eur = Number(opts.eur);
  if (!(eur > 0)) fail("--eur <montant journalier en euros> attendu.");
  const { increase } = await guardBudgetIncrease("reddit", b.id, b.dailyEur, eur);
  const after = snap.budgets.map((x) => (x.id === b.id ? { ...x, dailyEur: eur } : x));
  await guardDailyCap("reddit", after);
  const plan = { platform: "reddit", action: "set-budget", adGroup: b.id, name: b.name, beforeEur: b.dailyEur, afterEur: eur };
  if (!gate(plan, opts, { needsConfirm: increase, command: `${SCRIPT} set-budget --ad-group ${b.id} --eur ${eur}` })) return;
  await run("Envoi", () => api.call("PATCH", `/ad_groups/${b.id}`, { goal_value: micros(eur) }));
  await recordBudgets("reddit", after.map(({ id, name, status, dailyEur }) => ({ id, name, status, dailyEur })));
  await logWrite({ platform: "reddit", action: "budget", target: `${b.name} (${b.id})`, before: `${b.dailyEur.toFixed(2)} € / jour`, after: `${eur.toFixed(2)} € / jour`, reason: opts.reason, rollback: `${SCRIPT} set-budget --ad-group ${b.id} --eur ${b.dailyEur} --apply` });
  console.log(`✅ ${b.name} : ${b.dailyEur.toFixed(2)} → ${eur.toFixed(2)} € / jour`);
}

const splitList = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);

async function cmdExcludeKeywords(opts) {
  const api = await connect();
  const snap = await run("Lecture du compte", () => snapshot(api));
  const g = snap.adGroups.find((x) => x.id === opts["ad-group"]);
  if (!g) fail("--ad-group <id> attendu (Groupes.csv).");
  const before = g.targeting?.excluded_keywords || [];
  const add = splitList(opts.add);
  const remove = new Set(splitList(opts.remove));
  if (!add.length && !remove.size) fail("--add \"a,b\" et/ou --remove \"c\" attendus.");
  const after = [...new Set([...before.filter((k) => !remove.has(k)), ...add])];
  const plan = { platform: "reddit", action: "exclude-keywords", adGroup: g.id, name: g.name, before, after };
  const command = `${SCRIPT} exclude-keywords --ad-group ${g.id}${opts.add ? ` --add ${quoteArg(opts.add)}` : ""}${opts.remove ? ` --remove ${quoteArg(opts.remove)}` : ""}`;
  if (!gate(plan, opts, { needsConfirm: false, command })) return;
  await run("Envoi", () => api.call("PATCH", `/ad_groups/${g.id}`, { targeting: { ...g.targeting, excluded_keywords: after } }));
  const added = after.filter((k) => !before.includes(k));
  const removed = before.filter((k) => !after.includes(k));
  const back = [added.length ? `--remove ${quoteArg(added.join(","))}` : "", removed.length ? `--add ${quoteArg(removed.join(","))}` : ""].filter(Boolean).join(" ");
  await logWrite({ platform: "reddit", action: "mots-clés exclus", target: `${g.name} (${g.id})`, before, after, reason: opts.reason, rollback: back ? `${SCRIPT} exclude-keywords --ad-group ${g.id} ${back} --apply` : null });
  console.log(`✅ ${g.name} : ${after.length} mot(s)-clé(s) exclu(s)`);
}

async function cmdAdStatus(opts) {
  const to = String(opts.status || "").toUpperCase();
  if (!["PAUSED", "ACTIVE"].includes(to)) fail("--status PAUSED|ACTIVE attendu.");
  if (!opts.ad) fail("--ad <id> attendu (Annonces.csv).");
  const api = await connect();
  const plan = { platform: "reddit", action: "ad-status", ad: opts.ad, after: to };
  if (!gate(plan, opts, { needsConfirm: false, command: `${SCRIPT} ad-status --ad ${opts.ad} --status ${to}` })) return;
  await run("Envoi", () => api.call("PATCH", `/ads/${opts.ad}`, { configured_status: to }));
  const back = to === "PAUSED" ? "ACTIVE" : "PAUSED";
  await logWrite({ platform: "reddit", action: "annonce", target: `annonce ${opts.ad}`, before: back, after: to, reason: opts.reason, rollback: `${SCRIPT} ad-status --ad ${opts.ad} --status ${back} --apply` });
  console.log(`✅ annonce ${opts.ad} : ${to}`);
}

// ── Création ─────────────────────────────────────────────────────────────────

async function loadSpec(file) {
  if (!file) fail("--spec <fichier JSON de editorial/ads/reddit/> attendu.");
  let spec;
  try {
    spec = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (e) {
    fail(`Spec illisible (${file}) : ${e.message}`);
  }
  const problems = [];
  if (!/^reddit-[a-z]{2}-[a-z0-9-]+$/.test(spec.name || "")) problems.push(`nom « ${spec.name} » hors convention <canal>-<langue>-<audience>`);
  for (const g of spec.adGroups || []) {
    if (!g.communities?.length) problems.push(`${g.name} : aucune communauté ciblée`);
    if (!/^https:\/\/dynastynova\.com\//.test(g.clickUrl || "")) problems.push(`${g.name} : clickUrl hors dynastynova.com`);
    if (/[?&]utm_/.test(g.clickUrl || "")) problems.push(`${g.name} : les UTM sont ajoutés par le script, pas dans clickUrl`);
    for (const a of g.ads || []) if ([...a.headline].length > 300) problems.push(`${g.name}/${a.variant} : titre de plus de 300 caractères`);
  }
  if (problems.length) fail(`Spec ${file} refusée :\n   - ${problems.join("\n   - ")}`);
  return spec;
}

const utmParams = (spec, group) => [
  { name: "utm_source", value: "reddit" },
  { name: "utm_medium", value: "cpc" },
  { name: "utm_campaign", value: spec.name },
  { name: "utm_content", value: "{{AD_ID}}" },
  { name: "utm_term", value: group.name },
];

async function cmdCreate(opts) {
  const spec = await loadSpec(opts.spec);
  if (spec.status === "bloque") fail(`Campagne ${spec.name} bloquée : ${spec.blockedReason}`);
  const budget = Number(opts["budget-eur"]);
  const bid = Number(opts["bid-eur"]);
  if (!(budget > 0) || !(bid > 0)) fail("--budget-eur <jour, par groupe> et --bid-eur <CPC> attendus (montants du plan, editorial/ads-plan.json).");
  const offline = !(await Promise.all(REQUIRED.map(loadEnvVar))).every(Boolean);
  if (offline && opts.apply) fail("Identifiants Reddit Ads absents de .env.local : rien ne peut être créé.");
  const pixel = await loadEnvVar("REDDIT_ADS_PIXEL_ID");
  if (!offline && !pixel) fail("REDDIT_ADS_PIXEL_ID manquant : Reddit exige un pixel sur tout groupe d'annonces depuis le 2026-07-13.");
  let api = null;
  if (!offline) {
    api = await connect();
    const snap = await eurAccount(api);
    if (snap.campaigns.some((c) => c.name === spec.name)) fail(`Une campagne « ${spec.name} » existe déjà (le nom est la clé utm_campaign).`);
    await guardDailyCap("reddit", [...snap.budgets, ...spec.adGroups.map((g) => ({ id: `new-${g.name}`, status: "ACTIVE", dailyEur: budget }))]);
  }
  const withoutPost = spec.adGroups.flatMap((g) => g.ads.filter((a) => !a.postId).map((a) => `${g.name}/${a.variant}`));
  const plan = {
    platform: "reddit",
    action: "create",
    name: spec.name,
    objective: spec.objective,
    status: "PAUSED (à activer ensuite par enable)",
    adGroups: spec.adGroups.map((g) => ({ name: g.name, communities: g.communities, geolocations: g.geolocations, budgetEurPerDay: budget, bidEur: bid, ads: g.ads.filter((a) => a.postId).map((a) => a.variant) })),
    adsWithoutPost: withoutPost,
    content: digest({ spec, budget, bid }),
  };
  if (!gate(plan, opts, { needsConfirm: true, command: `${SCRIPT} create --spec ${quoteArg(opts.spec)} --budget-eur ${budget} --bid-eur ${bid}` })) {
    if (withoutPost.length) console.log(`ℹ️  Annonces sans post (créer le post dans le gestionnaire, puis renseigner postId) : ${withoutPost.join(", ")}`);
    if (offline) console.log("Hors ligne : spec contrôlée localement, sans plafond ni lecture du compte (identifiants Reddit absents).");
    return;
  }
  // Un groupe sans annonce dépenserait sans rien montrer de prévu : chaque groupe en a au moins une.
  const empty = spec.adGroups.filter((g) => !g.ads.some((a) => a.postId)).map((g) => g.name);
  if (empty.length) fail(`Groupe(s) sans aucune annonce prête (postId manquant) : ${empty.join(", ")}. Créer les posts dans le gestionnaire, renseigner postId, refaire le dry-run.`);
  const campaign = await run("Campagne", () =>
    api.call("POST", `/ad_accounts/${api.account}/campaigns`, { name: spec.name, configured_status: "PAUSED", objective: spec.objective, is_campaign_budget_optimization: false })
  );
  const created = { campaign: campaign.data.id, adGroups: [], ads: [] };
  for (const g of spec.adGroups) {
    const group = await run(`Groupe ${g.name}`, () =>
      api.call("POST", `/ad_accounts/${api.account}/ad_groups`, {
        campaign_id: created.campaign,
        name: g.name,
        configured_status: "ACTIVE",
        bid_strategy: "MANUAL_BIDDING",
        bid_type: "CPC",
        bid_value: micros(bid),
        goal_type: "DAILY_SPEND",
        goal_value: micros(budget),
        start_time: new Date().toISOString(),
        conversion_pixel_id: pixel,
        targeting: { communities: g.communities, geolocations: g.geolocations, excluded_keywords: g.excludedKeywords || [], expand_targeting: false },
      })
    );
    created.adGroups.push(group.data.id);
    for (const a of g.ads.filter((x) => x.postId)) {
      const ad = await run(`Annonce ${g.name}/${a.variant}`, () =>
        api.call("POST", `/ad_accounts/${api.account}/ads`, {
          ad_group_id: group.data.id,
          name: `${g.name}-${a.variant}`,
          configured_status: "ACTIVE",
          post_id: a.postId,
          click_url: g.clickUrl,
          click_url_query_parameters: utmParams(spec, g),
        })
      );
      created.ads.push(ad.data.id);
    }
  }
  await logWrite({
    platform: "reddit",
    action: "création",
    target: `${spec.name} (${created.campaign})`,
    before: "inexistante",
    after: `créée en pause : ${created.adGroups.length} groupe(s) à ${budget.toFixed(2)} € / jour, CPC ${bid.toFixed(2)} €, ${created.ads.length} annonce(s)`,
    reason: opts.reason || "plan validé par l'utilisateur",
    rollback: `${SCRIPT} pause --campaign ${created.campaign} --apply (déjà en pause ; l'archiver dans le gestionnaire si besoin)`,
  });
  console.log(`✅ ${spec.name} créée en pause (ID ${created.campaign}). Activation : ${SCRIPT} enable --campaign ${created.campaign}`);
}

// ── Conversions (API de conversion Reddit) ───────────────────────────────────

const LEDGER = path.join(CACHE_DIR, "conversions-reddit.jsonl");

async function cmdUploadConversions(opts) {
  const pixel = await loadEnvVar("REDDIT_ADS_PIXEL_ID");
  if (!pixel) fail("REDDIT_ADS_PIXEL_ID manquant dans .env.local.");
  const api = await connect();
  const days = Number(opts.days || 3);
  const to = new Date();
  to.setDate(to.getDate() + 1);
  const from = new Date();
  from.setDate(from.getDate() - days);
  const rows = await paidSignups(ymd(from), ymd(to));
  if (rows === null) fail("POSTHOG_PERSONAL_API_KEY ou POSTHOG_GAME_PROJECT_ID manquant : aucune inscription lisible.");
  let sent = new Set();
  try {
    sent = new Set((await fs.readFile(LEDGER, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l).conversionId));
  } catch {
    // Premier import.
  }
  const events = rows
    .filter((r) => r.source === "reddit" && r.rdt_cid)
    .map((r) => ({ event_at: Date.parse(r.signed_at), action_source: "WEBSITE", type: { tracking_type: "SIGN_UP" }, click_id: r.rdt_cid, metadata: { conversion_id: `signup-${r.person}` } }))
    .filter((e) => !sent.has(e.metadata.conversion_id));
  console.log(`\n▶ ${rows.filter((r) => r.source === "reddit").length} inscrit(s) venus de Reddit sur ${days} jours, ${events.length} à envoyer.`);
  if (!events.length) return;
  const plan = { platform: "reddit", action: "upload-conversions", pixel, events: events.length };
  if (!gate(plan, opts, { needsConfirm: false, command: `${SCRIPT} upload-conversions --days ${days}` })) return;
  await run("Envoi", () => api.call("POST", `/pixels/${pixel}/conversion_events`, { events }));
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.appendFile(LEDGER, events.map((e) => JSON.stringify({ at: new Date().toISOString(), conversionId: e.metadata.conversion_id })).join("\n") + "\n");
  await logWrite({ platform: "reddit", action: "import de conversions", target: `pixel ${pixel}`, before: `${sent.size} déjà envoyées`, after: `+${events.length} inscriptions`, reason: "inscriptions PostHog avec rdt_cid", rollback: null });
  console.log(`✅ ${events.length} conversion(s) envoyée(s).`);
}

// ── Jeton OAuth ──────────────────────────────────────────────────────────────

async function cmdToken(opts) {
  const env = await requireEnv(["REDDIT_ADS_CLIENT_ID", "REDDIT_ADS_CLIENT_SECRET"]);
  if (!opts.code || !opts["redirect-uri"]) fail("--code <code> --redirect-uri <URI> attendus (voir l'en-tête).");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.REDDIT_ADS_CLIENT_ID}:${env.REDDIT_ADS_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": await userAgent(),
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: opts.code, redirect_uri: opts["redirect-uri"] }),
  });
  const body = await res.json().catch(() => ({}));
  if (!body.refresh_token) fail(`Échange refusé (${res.status}) : ${body.error || "pas de refresh_token"}`);
  // Le jeton n'est jamais affiché : il part directement dans .env.local.
  await fs.appendFile(".env.local", `\nREDDIT_ADS_REFRESH_TOKEN="${body.refresh_token}"\n`);
  console.log("✅ REDDIT_ADS_REFRESH_TOKEN ajouté à .env.local (scopes : " + (body.scope || "?") + ").");
}

async function cmdLint(opts) {
  const spec = await loadSpec(opts.spec);
  const without = spec.adGroups.flatMap((g) => g.ads.filter((a) => !a.postId).map((a) => `${g.name}/${a.variant}`));
  console.log(`✅ ${spec.name} [${spec.status}] : ${spec.adGroups.map((g) => `${g.name} (${g.communities.join(", ")})`).join(", ")}.`);
  if (without.length) console.log(`   Annonces sans post Reddit : ${without.join(", ")}`);
}

const COMMANDS = {
  lint: cmdLint,
  read: cmdRead,
  create: cmdCreate,
  enable: (o) => cmdStatus(o, "ACTIVE"),
  pause: (o) => cmdStatus(o, "PAUSED"),
  "set-budget": cmdSetBudget,
  "exclude-keywords": cmdExcludeKeywords,
  "ad-status": cmdAdStatus,
  "upload-conversions": cmdUploadConversions,
  token: cmdToken,
};

const opts = parseArgs(process.argv.slice(2), {
  known: ["days", "spec", "budget-eur", "bid-eur", "campaign", "ad-group", "ad", "eur", "add", "remove", "status", "confirm", "reason", "code", "redirect-uri"],
  flags: ["apply"],
});
const command = COMMANDS[opts._[0]];
if (!command) fail(`Commande attendue : ${Object.keys(COMMANDS).join(", ")}.`);
command(opts).catch((e) => fail(e.stack || e.message));
