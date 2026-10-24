#!/usr/bin/env node
/**
 * Pilote le compte Google Ads de Dynasty Nova par l'API (bibliothèque `google-ads-api`, Google Ads
 * API v25) : lecture des campagnes, groupes, annonces, mots-clés, termes de recherche, dépense et
 * conversions par jour (GAQL), et écritures encadrées par les garde-fous de scripts/ads-lib.mjs.
 * Écrit ses relevés dans .ads-cache/ (gitignored).
 *
 * Lecture seule par défaut. Toute écriture est d'abord affichée (dry-run, validée par l'API avec
 * `validate_only` quand les identifiants sont là) et n'est envoyée qu'avec --apply. Création,
 * activation et hausse de budget exigent en plus --confirm <jeton> (accord de l'utilisateur).
 *
 * Prérequis (une seule fois, à faire par l'utilisateur) :
 *   1. Projet Google Cloud de GA4/GSC : activer « Google Ads API » et « Data Manager API ». Depuis
 *      le 2026-09-09, le niveau d'accès vient du projet Cloud (le jeton développeur est ignoré) :
 *      demander l'accès Explorer (comptes réels) dans la page Google Ads API du projet ; au niveau
 *      Test, seuls les comptes de test répondent (CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION).
 *   2. Créer un client OAuth « Application de bureau » dans ce projet, puis un jeton de
 *      rafraîchissement avec les deux scopes :
 *        https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/datamanager
 *      (gcloud auth application-default login --client-id-file=client.json --scopes=<les deux>,
 *      le refresh_token est dans application_default_credentials.json). Écran de consentement
 *      publié, sinon le jeton expire au bout de 7 jours.
 *   3. Pour l'import de conversions : `node scripts/ads-google.mjs create-conversion-actions --apply`
 *      puis reporter les deux ID affichés dans .env.local.
 *
 * Variables d'env (.env.local, jamais commité ; voir .env.example) :
 *   GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN
 *   GOOGLE_ADS_CUSTOMER_ID=1234567890          # compte annonceur, sans tirets
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890    # MCC, si l'accès passe par un compte administrateur
 *   GOOGLE_ADS_DEVELOPER_TOKEN=...             # facultatif depuis le 2026-09-09 (ignoré par l'API)
 *   GOOGLE_ADS_CONVERSION_SIGNUP_ID / GOOGLE_ADS_CONVERSION_PURCHASE_ID   # actions UPLOAD_CLICKS
 *   ADS_DAILY_CAP_EUR=...                      # plafond journalier total, toutes régies
 *
 * Usage :
 *   node scripts/ads-google.mjs lint --spec editorial/ads/google/search-fr-ogame.json   # hors ligne
 *   node scripts/ads-google.mjs read [--days 30]
 *   node scripts/ads-google.mjs create --spec editorial/ads/google/search-fr-ogame.json --budget-eur 10 --max-cpc-eur 0.8
 *   node scripts/ads-google.mjs enable --campaign <id>
 *   node scripts/ads-google.mjs pause --campaign <id> [--reason "…"]
 *   node scripts/ads-google.mjs set-budget --campaign <id> --eur 13
 *   node scripts/ads-google.mjs add-negatives --campaign <id> [--phrase "a,b"] [--exact "c"]
 *   node scripts/ads-google.mjs remove-negatives --campaign <id> --criteria <id,id>
 *   node scripts/ads-google.mjs replace-ad --ad-group <id> --ad <id> --spec <fichier> --group <nom> --variant <nom>
 *   node scripts/ads-google.mjs ad-status --ad-group <id> --ad <id> --status PAUSED|ENABLED
 *   node scripts/ads-google.mjs create-conversion-actions
 *   node scripts/ads-google.mjs upload-conversions --kind signup|purchase [--days 3]
 *   (toute écriture : ajouter --apply, et --confirm <jeton> quand le dry-run le demande)
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { OAuth2Client } from "google-auth-library";
import { GoogleAdsApi, enums, ResourceNames, toMicros } from "google-ads-api";
import {
  CACHE_DIR,
  appendLog,
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

const SCRIPT = "node scripts/ads-google.mjs";
const LIMITS = { headline: 30, description: 90, path: 15, headlines: [3, 15], descriptions: [2, 4] };
const fromMicros = (v) => (v === null || v === undefined ? null : Number(v) / 1e6);
const statusName = (v) => (typeof v === "number" ? enums.CampaignStatus[v] : v);

const REQUIRED = ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_REFRESH_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"];

async function hasCredentials() {
  return (await Promise.all(REQUIRED.map(loadEnvVar))).every(Boolean);
}

async function connect() {
  const env = await requireEnv(
    REQUIRED,
    "Voir l'en-tête de scripts/ads-google.mjs et .env.example."
  );
  const cid = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");
  const login = (await loadEnvVar("GOOGLE_ADS_LOGIN_CUSTOMER_ID"))?.replace(/-/g, "") || undefined;
  const client = new GoogleAdsApi({
    client_id: env.GOOGLE_ADS_CLIENT_ID,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
    // Ignoré par l'API depuis le 2026-09-09, mais la bibliothèque exige une chaîne.
    developer_token: (await loadEnvVar("GOOGLE_ADS_DEVELOPER_TOKEN")) || "unused",
  });
  const customer = client.Customer({ customer_id: cid, login_customer_id: login, refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN });
  return { customer, cid, login, env };
}

function apiError(e) {
  const errors = e?.errors?.map((x) => `${Object.values(x.error_code || {}).join("/")} ${x.message}`).join(" ; ");
  return errors || e?.message || String(e);
}

async function run(label, fn) {
  try {
    return await fn();
  } catch (e) {
    fail(`${label} : ${apiError(e)}`);
  }
}

// ── Lecture ──────────────────────────────────────────────────────────────────

async function campaigns(customer) {
  const rows = await customer.query(`
    SELECT campaign.id, campaign.name, campaign.status, campaign.final_url_suffix,
           campaign.contains_eu_political_advertising, campaign_budget.resource_name,
           campaign_budget.amount_micros
    FROM campaign WHERE campaign.status != 'REMOVED'`);
  return rows.map((r) => ({
    id: String(r.campaign.id),
    name: r.campaign.name,
    status: statusName(r.campaign.status),
    budget: r.campaign_budget.resource_name,
    dailyEur: fromMicros(r.campaign_budget.amount_micros),
    euDeclared: r.campaign.contains_eu_political_advertising > 1,
    suffix: r.campaign.final_url_suffix || "",
  }));
}

async function findCampaign(customer, id) {
  if (!/^\d+$/.test(String(id || ""))) fail("--campaign <id numérique> attendu (voir Campagnes.csv de la lecture).");
  const all = await run("Lecture des campagnes", () => campaigns(customer));
  const c = all.find((x) => x.id === String(id));
  if (!c) fail(`Campagne ${id} introuvable sur ce compte.`);
  return { all, c };
}

async function cmdRead(opts) {
  const { customer } = await connect();
  const days = Number(opts.days || 30);
  if (!Number.isInteger(days) || days < 1) fail("--days attend un entier positif.");
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const range = `segments.date BETWEEN '${ymd(start)}' AND '${ymd(end)}'`;
  console.log(`\n▶ Google Ads — ${ymd(start)} → ${ymd(end)}`);

  const [camps, daily, ads, keywords, terms, negatives] = await run("Lecture GAQL", () =>
    Promise.all([
      campaigns(customer),
      customer.query(`SELECT campaign.id, campaign.name, segments.date, metrics.cost_micros, metrics.clicks,
        metrics.impressions, metrics.conversions FROM campaign WHERE ${range}`),
      customer.query(`SELECT campaign.name, ad_group.id, ad_group.name, ad_group.status, ad_group_ad.ad.id,
        ad_group_ad.status, ad_group_ad.policy_summary.approval_status, metrics.impressions, metrics.clicks,
        metrics.cost_micros, metrics.conversions FROM ad_group_ad WHERE ${range}`),
      customer.query(`SELECT campaign.name, ad_group.name, ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status,
        metrics.impressions, metrics.clicks, metrics.cost_micros,
        metrics.conversions FROM keyword_view WHERE ${range}`),
      customer.query(`SELECT search_term_view.search_term, search_term_view.status, campaign.id, campaign.name,
        ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
        FROM search_term_view WHERE ${range}`),
      customer.query(`SELECT campaign.id, campaign.name, campaign_criterion.criterion_id,
        campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
        FROM campaign_criterion WHERE campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'`),
    ])
  );

  const dir = path.join(CACHE_DIR, `google-${ymd(new Date())}`);
  const money = (m) => (fromMicros(m) ?? 0).toFixed(2);
  const match = (v) => enums.KeywordMatchType[v] ?? v;
  await writeCsv(dir, "Campagnes.csv", ["ID", "Campagne", "Statut", "Budget jour (€)", "Déclaration UE", "Suffixe d'URL"],
    camps.map((c) => [c.id, c.name, c.status, c.dailyEur?.toFixed(2), c.euDeclared ? "oui" : "MANQUANTE", c.suffix]));
  await writeCsv(dir, "Jours.csv", ["Date", "ID", "Campagne", "Dépense (€)", "Clics", "Impressions", "Conversions"],
    daily.map((r) => [r.segments.date, r.campaign.id, r.campaign.name, money(r.metrics.cost_micros), r.metrics.clicks, r.metrics.impressions, r.metrics.conversions]));
  await writeCsv(dir, "Annonces.csv", ["Campagne", "ID groupe", "Groupe", "ID annonce", "Statut", "Validation", "Impressions", "Clics", "Dépense (€)", "Conversions"],
    ads.map((r) => [r.campaign.name, r.ad_group.id, r.ad_group.name, r.ad_group_ad.ad.id, enums.AdGroupAdStatus[r.ad_group_ad.status], enums.PolicyApprovalStatus[r.ad_group_ad.policy_summary?.approval_status], r.metrics.impressions, r.metrics.clicks, money(r.metrics.cost_micros), r.metrics.conversions]));
  await writeCsv(dir, "MotsCles.csv", ["Campagne", "Groupe", "ID critère", "Mot-clé", "Correspondance", "Impressions", "Clics", "Dépense (€)", "Conversions"],
    keywords.map((r) => [r.campaign.name, r.ad_group.name, r.ad_group_criterion.criterion_id, r.ad_group_criterion.keyword.text, match(r.ad_group_criterion.keyword.match_type), r.metrics.impressions, r.metrics.clicks, money(r.metrics.cost_micros), r.metrics.conversions]));
  await writeCsv(dir, "TermesDeRecherche.csv", ["Terme", "Statut", "ID campagne", "Campagne", "Groupe", "Impressions", "Clics", "Dépense (€)", "Conversions"],
    terms.sort((a, b) => b.metrics.cost_micros - a.metrics.cost_micros).map((r) => [r.search_term_view.search_term, enums.SearchTermTargetingStatus[r.search_term_view.status], r.campaign.id, r.campaign.name, r.ad_group.name, r.metrics.impressions, r.metrics.clicks, money(r.metrics.cost_micros), r.metrics.conversions]));
  await writeCsv(dir, "Negatifs.csv", ["ID campagne", "Campagne", "ID critère", "Mot-clé", "Correspondance"],
    negatives.map((r) => [r.campaign.id, r.campaign.name, r.campaign_criterion.criterion_id, r.campaign_criterion.keyword.text, match(r.campaign_criterion.keyword.match_type)]));
  await recordBudgets("google", camps.map(({ id, name, status, dailyEur }) => ({ id, name, status, dailyEur })));

  const undeclared = camps.filter((c) => !c.euDeclared);
  if (undeclared.length) {
    console.log(`⚠️  ${undeclared.length} campagne(s) sans déclaration de publicité politique UE : depuis le 2026-04-01, toute modification de campagne du compte est refusée tant qu'elles ne sont pas déclarées.`);
  }
  console.log(`✅ ${camps.length} campagnes, ${daily.length} lignes jour, ${terms.length} termes de recherche -> ${dir}\n`);
}

// ── Écritures simples ────────────────────────────────────────────────────────

async function cmdStatus(opts, target) {
  const { customer, cid } = await connect();
  const { all, c } = await findCampaign(customer, opts.campaign);
  const to = target;
  if (c.status === to) {
    console.log(`Campagne ${c.name} déjà ${to} : rien à faire.`);
    return;
  }
  const plan = { platform: "google", action: to === "PAUSED" ? "pause" : "enable", campaign: c.id, name: c.name, before: c.status, after: to, dailyEur: c.dailyEur };
  const command = `${SCRIPT} ${plan.action} --campaign ${c.id}`;
  // Activer, c'est commencer à dépenser : même exigence que la création.
  const needsConfirm = to === "ENABLED";
  if (needsConfirm) await guardDailyCap("google", all.map((x) => (x.id === c.id ? { ...x, status: to } : x)));
  const resource = { resource_name: ResourceNames.campaign(cid, c.id), status: enums.CampaignStatus[to] };
  if (!gate(plan, opts, { needsConfirm, command })) {
    await run("Validation", () => customer.campaigns.update([resource], { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  await run("Envoi", () => customer.campaigns.update([resource]));
  await recordBudgets("google", all.map((x) => (x.id === c.id ? { ...x, status: to } : x)));
  await logWrite({
    platform: "google",
    action: plan.action,
    target: `${c.name} (${c.id})`,
    before: c.status,
    after: to,
    reason: opts.reason,
    rollback: `${SCRIPT} ${to === "PAUSED" ? "enable" : "pause"} --campaign ${c.id} --apply${to === "PAUSED" ? " --confirm <jeton du dry-run>" : ""}`,
  });
  console.log(`✅ ${c.name} : ${c.status} → ${to}`);
}

async function cmdSetBudget(opts) {
  const { customer } = await connect();
  const { all, c } = await findCampaign(customer, opts.campaign);
  const eur = Number(opts.eur);
  if (!Number.isFinite(eur) || eur <= 0) fail("--eur <montant journalier en euros> attendu.");
  const { increase } = await guardBudgetIncrease("google", c.id, c.dailyEur, eur);
  await guardDailyCap("google", all.map((x) => (x.id === c.id ? { ...x, dailyEur: eur } : x)));
  const plan = { platform: "google", action: "set-budget", campaign: c.id, name: c.name, beforeEur: c.dailyEur, afterEur: eur };
  const resource = { resource_name: c.budget, amount_micros: toMicros(eur) };
  if (!gate(plan, opts, { needsConfirm: increase, command: `${SCRIPT} set-budget --campaign ${c.id} --eur ${eur}` })) {
    await run("Validation", () => customer.campaignBudgets.update([resource], { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  await run("Envoi", () => customer.campaignBudgets.update([resource]));
  await recordBudgets("google", all.map((x) => (x.id === c.id ? { ...x, dailyEur: eur } : x)));
  await logWrite({
    platform: "google",
    action: "budget",
    target: `${c.name} (${c.id})`,
    before: `${c.dailyEur.toFixed(2)} € / jour`,
    after: `${eur.toFixed(2)} € / jour`,
    reason: opts.reason,
    rollback: `${SCRIPT} set-budget --campaign ${c.id} --eur ${c.dailyEur} --apply`,
  });
  console.log(`✅ ${c.name} : ${c.dailyEur.toFixed(2)} → ${eur.toFixed(2)} € / jour`);
}

const splitList = (v) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);

async function cmdAddNegatives(opts) {
  const { customer, cid } = await connect();
  const { c } = await findCampaign(customer, opts.campaign);
  const wanted = [
    ...splitList(opts.phrase).map((text) => ({ text, match: "PHRASE" })),
    ...splitList(opts.exact).map((text) => ({ text, match: "EXACT" })),
  ];
  if (!wanted.length) fail("--phrase \"a,b\" et/ou --exact \"c\" attendus.");
  const existing = await run("Lecture des négatifs", () =>
    customer.query(`SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion
      WHERE campaign.id = ${c.id} AND campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'`)
  );
  const have = new Set(existing.map((r) => `${r.campaign_criterion.keyword.text}|${enums.KeywordMatchType[r.campaign_criterion.keyword.match_type]}`));
  const add = wanted.filter((k) => !have.has(`${k.text}|${k.match}`));
  if (!add.length) {
    console.log("Tous ces négatifs existent déjà : rien à faire.");
    return;
  }
  const plan = { platform: "google", action: "add-negatives", campaign: c.id, name: c.name, add };
  const resources = add.map((k) => ({
    campaign: ResourceNames.campaign(cid, c.id),
    negative: true,
    keyword: { text: k.text, match_type: enums.KeywordMatchType[k.match] },
  }));
  const command = `${SCRIPT} add-negatives --campaign ${c.id}${opts.phrase ? ` --phrase ${quoteArg(opts.phrase)}` : ""}${opts.exact ? ` --exact ${quoteArg(opts.exact)}` : ""}`;
  if (!gate(plan, opts, { needsConfirm: false, command })) {
    await run("Validation", () => customer.campaignCriteria.create(resources, { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  const res = await run("Envoi", () => customer.campaignCriteria.create(resources));
  const ids = (res.results || []).map((r) => r.resource_name.split("~").pop());
  await logWrite({
    platform: "google",
    action: "négatifs",
    target: `${c.name} (${c.id})`,
    before: `${have.size} négatifs`,
    after: add.map((k) => `${k.match === "EXACT" ? `[${k.text}]` : `"${k.text}"`}`).join(", "),
    reason: opts.reason,
    rollback: `${SCRIPT} remove-negatives --campaign ${c.id} --criteria ${ids.join(",")} --apply`,
  });
  console.log(`✅ ${add.length} négatif(s) ajouté(s) à ${c.name}`);
}

async function cmdRemoveNegatives(opts) {
  const { customer, cid } = await connect();
  const { c } = await findCampaign(customer, opts.campaign);
  const ids = splitList(opts.criteria);
  if (!ids.length || !ids.every((i) => /^\d+$/.test(i))) fail("--criteria <id,id> attendu (Negatifs.csv).");
  const names = ids.map((i) => ResourceNames.campaignCriterion(cid, c.id, i));
  const plan = { platform: "google", action: "remove-negatives", campaign: c.id, name: c.name, criteria: ids };
  if (!gate(plan, opts, { needsConfirm: false, command: `${SCRIPT} remove-negatives --campaign ${c.id} --criteria ${ids.join(",")}` })) {
    await run("Validation", () => customer.campaignCriteria.remove(names, { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  await run("Envoi", () => customer.campaignCriteria.remove(names));
  await logWrite({ platform: "google", action: "négatifs retirés", target: `${c.name} (${c.id})`, before: ids.join(","), after: "retirés", reason: opts.reason, rollback: null });
  console.log(`✅ ${ids.length} négatif(s) retiré(s)`);
}

async function cmdAdStatus(opts) {
  const { customer, cid } = await connect();
  const to = String(opts.status || "").toUpperCase();
  if (!["PAUSED", "ENABLED"].includes(to)) fail("--status PAUSED|ENABLED attendu.");
  if (!/^\d+$/.test(opts["ad-group"] || "") || !/^\d+$/.test(opts.ad || "")) fail("--ad-group <id> --ad <id> attendus (Annonces.csv).");
  const resource = { resource_name: ResourceNames.adGroupAd(cid, opts["ad-group"], opts.ad), status: enums.AdGroupAdStatus[to] };
  const plan = { platform: "google", action: "ad-status", adGroup: opts["ad-group"], ad: opts.ad, after: to };
  if (!gate(plan, opts, { needsConfirm: false, command: `${SCRIPT} ad-status --ad-group ${opts["ad-group"]} --ad ${opts.ad} --status ${to}` })) {
    await run("Validation", () => customer.adGroupAds.update([resource], { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  await run("Envoi", () => customer.adGroupAds.update([resource]));
  const back = to === "PAUSED" ? "ENABLED" : "PAUSED";
  await logWrite({ platform: "google", action: "annonce", target: `annonce ${opts.ad} (groupe ${opts["ad-group"]})`, before: back, after: to, reason: opts.reason, rollback: `${SCRIPT} ad-status --ad-group ${opts["ad-group"]} --ad ${opts.ad} --status ${back} --apply` });
  console.log(`✅ annonce ${opts.ad} : ${to}`);
}

// ── Specs de campagne ────────────────────────────────────────────────────────

async function loadSpec(file) {
  if (!file) fail("--spec <fichier JSON de editorial/ads/google/> attendu.");
  let spec;
  try {
    spec = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (e) {
    fail(`Spec illisible (${file}) : ${e.message}`);
  }
  const problems = [];
  if (!/^search-[a-z]{2}-[a-z0-9-]+$/.test(spec.name || "")) problems.push(`nom « ${spec.name} » hors convention <canal>-<langue>-<audience>`);
  if (!String(spec.finalUrlSuffix || "").includes(`utm_campaign=${spec.name}`)) problems.push("finalUrlSuffix sans utm_campaign égal au nom de la campagne");
  for (const g of spec.adGroups || []) {
    for (const a of g.ads || []) {
      const where = `${g.name}/${a.variant}`;
      const len = (s) => [...s].length;
      const [hMin, hMax] = LIMITS.headlines;
      const [dMin, dMax] = LIMITS.descriptions;
      if (a.headlines.length < hMin || a.headlines.length > hMax) problems.push(`${where} : ${a.headlines.length} titres (${hMin} à ${hMax})`);
      if (a.descriptions.length < dMin || a.descriptions.length > dMax) problems.push(`${where} : ${a.descriptions.length} descriptions (${dMin} à ${dMax})`);
      if (new Set(a.headlines).size !== a.headlines.length) problems.push(`${where} : titres en double`);
      a.headlines.filter((h) => len(h) > LIMITS.headline).forEach((h) => problems.push(`${where} : titre de ${len(h)} caractères « ${h} »`));
      a.descriptions.filter((d) => len(d) > LIMITS.description).forEach((d) => problems.push(`${where} : description de ${len(d)} caractères « ${d} »`));
      [a.path1, a.path2].filter((p) => p && len(p) > LIMITS.path).forEach((p) => problems.push(`${where} : chemin « ${p} » trop long`));
      if (/ogame/i.test(`${a.path1}${a.path2}`)) problems.push(`${where} : la marque OGame dans le chemin d'URL affiché`);
    }
  }
  if (problems.length) fail(`Spec ${file} refusée :\n   - ${problems.join("\n   - ")}`);
  return spec;
}

function rsa(cid, adGroupResource, a) {
  return {
    entity: "ad_group_ad",
    operation: "create",
    resource: {
      ad_group: adGroupResource,
      status: enums.AdGroupAdStatus.ENABLED,
      ad: {
        final_urls: [a.finalUrl],
        responsive_search_ad: {
          headlines: a.headlines.map((text) => ({ text })),
          descriptions: a.descriptions.map((text) => ({ text })),
          path1: a.path1 || undefined,
          path2: a.path2 || undefined,
        },
      },
    },
  };
}

async function cmdCreate(opts) {
  const spec = await loadSpec(opts.spec);
  if (spec.status === "bloque") fail(`Campagne ${spec.name} bloquée : ${spec.blockedReason}`);
  const budget = Number(opts["budget-eur"]);
  const maxCpc = Number(opts["max-cpc-eur"]);
  if (!(budget > 0) || !(maxCpc > 0)) fail("--budget-eur <jour> et --max-cpc-eur <plafond> attendus (montants du plan, editorial/ads-plan.json).");
  // Sans compte branché, le dry-run reste possible : spec contrôlée, plan affiché, ni plafond ni
  // validation API (dits comme tels). L'envoi, lui, exige le compte.
  const offline = !(await hasCredentials());
  if (offline && opts.apply) fail("Identifiants Google Ads absents de .env.local : rien ne peut être créé.");
  const { customer, cid } = offline ? { customer: null, cid: "0000000000" } : await connect();
  if (!offline) {
    const all = await run("Lecture des campagnes", () => campaigns(customer));
    if (all.some((c) => c.name === spec.name)) fail(`Une campagne « ${spec.name} » existe déjà : la modifier plutôt que d'en créer une seconde (le nom est la clé utm_campaign).`);
    // Créée en pause, mais comptée comme active : son activation ne doit pas pouvoir crever le plafond.
    await guardDailyCap("google", [...all, { id: "new", status: "ENABLED", dailyEur: budget }]);
  }

  let tmp = 0;
  const next = () => String(--tmp);
  const budgetRn = ResourceNames.campaignBudget(cid, next());
  const campaignRn = ResourceNames.campaign(cid, next());
  const ops = [
    { entity: "campaign_budget", operation: "create", resource: { resource_name: budgetRn, name: `${spec.name} ${ymd(new Date())}`, amount_micros: toMicros(budget), delivery_method: enums.BudgetDeliveryMethod.STANDARD, explicitly_shared: false } },
    {
      entity: "campaign",
      operation: "create",
      resource: {
        resource_name: campaignRn,
        name: spec.name,
        status: enums.CampaignStatus.PAUSED,
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        campaign_budget: budgetRn,
        target_spend: { cpc_bid_ceiling_micros: toMicros(maxCpc) },
        network_settings: { target_google_search: true, target_search_network: false, target_content_network: false, target_partner_search_network: false },
        geo_target_type_setting: { positive_geo_target_type: enums.PositiveGeoTargetType.PRESENCE },
        final_url_suffix: spec.finalUrlSuffix,
        contains_eu_political_advertising: enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
      },
    },
    ...spec.languages.map((id) => ({ entity: "campaign_criterion", operation: "create", resource: { campaign: campaignRn, language: { language_constant: `languageConstants/${id}` } } })),
    ...spec.geoTargets.map((id) => ({ entity: "campaign_criterion", operation: "create", resource: { campaign: campaignRn, location: { geo_target_constant: `geoTargetConstants/${id}` } } })),
    ...Object.entries(spec.negatives || {}).flatMap(([match, list]) =>
      list.map((text) => ({ entity: "campaign_criterion", operation: "create", resource: { campaign: campaignRn, negative: true, keyword: { text, match_type: enums.KeywordMatchType[match] } } }))
    ),
  ];
  for (const g of spec.adGroups) {
    const groupRn = ResourceNames.adGroup(cid, next());
    ops.push({ entity: "ad_group", operation: "create", resource: { resource_name: groupRn, campaign: campaignRn, name: g.name, type: enums.AdGroupType.SEARCH_STANDARD, status: enums.AdGroupStatus.ENABLED } });
    for (const [match, list] of Object.entries(g.keywords)) {
      for (const text of list) {
        ops.push({ entity: "ad_group_criterion", operation: "create", resource: { ad_group: groupRn, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text, match_type: enums.KeywordMatchType[match] } } });
      }
    }
    for (const a of g.ads) ops.push(rsa(cid, groupRn, a));
  }

  const plan = {
    platform: "google",
    action: "create",
    name: spec.name,
    status: "PAUSED (à activer ensuite par enable)",
    budgetEurPerDay: budget,
    maxCpcEur: maxCpc,
    languages: spec.languages,
    geoTargets: spec.geoTargets,
    negatives: Object.values(spec.negatives || {}).flat().length,
    adGroups: spec.adGroups.map((g) => ({ name: g.name, keywords: Object.values(g.keywords).flat().length, ads: g.ads.map((a) => a.variant) })),
    operations: ops.length,
    // Le jeton couvre le détail exact (mots-clés, textes, URL) : une spec modifiée après l'accord
    // donne un autre jeton.
    content: digest(ops),
  };
  const command = `${SCRIPT} create --spec ${quoteArg(opts.spec)} --budget-eur ${budget} --max-cpc-eur ${maxCpc}`;
  if (!gate(plan, opts, { needsConfirm: true, command })) {
    if (offline) {
      console.log("Hors ligne : spec contrôlée localement, ni plafond ni validation API (identifiants Google Ads absents).");
      return;
    }
    await run("Validation", () => customer.mutateResources(ops, { validate_only: true }));
    console.log("Validation API : OK (rien n'a été créé).");
    return;
  }
  const res = await run("Création", () => customer.mutateResources(ops));
  const created = (res.mutate_operation_responses || [])
    .map((r) => r.campaign_result?.resource_name)
    .find(Boolean);
  const id = created?.split("/").pop();
  await logWrite({
    platform: "google",
    action: "création",
    target: `${spec.name} (${id || "ID à relire"})`,
    before: "inexistante",
    after: `créée en pause, ${budget.toFixed(2)} € / jour, CPC max ${maxCpc.toFixed(2)} €, ${ops.length} opérations`,
    reason: opts.reason || "plan validé par l'utilisateur",
    rollback: id ? `${SCRIPT} pause --campaign ${id} --apply (elle est déjà en pause ; la supprimer depuis l'interface Google Ads si besoin)` : null,
  });
  console.log(`✅ ${spec.name} créée en pause (ID ${id}). Activation : ${SCRIPT} enable --campaign ${id}`);
}

async function cmdReplaceAd(opts) {
  const spec = await loadSpec(opts.spec);
  const group = spec.adGroups.find((g) => g.name === opts.group);
  const ad = group?.ads.find((a) => a.variant === opts.variant);
  if (!ad) fail(`Annonce ${opts.group}/${opts.variant} introuvable dans ${opts.spec}.`);
  if (!/^\d+$/.test(opts["ad-group"] || "") || !/^\d+$/.test(opts.ad || "")) fail("--ad-group <id> --ad <id> attendus (Annonces.csv).");
  const { customer, cid } = await connect();
  const groupRn = ResourceNames.adGroup(cid, opts["ad-group"]);
  const ops = [
    rsa(cid, groupRn, ad),
    { entity: "ad_group_ad", operation: "update", resource: { resource_name: ResourceNames.adGroupAd(cid, opts["ad-group"], opts.ad), status: enums.AdGroupAdStatus.PAUSED } },
  ];
  const plan = { platform: "google", action: "replace-ad", adGroup: opts["ad-group"], pause: opts.ad, create: `${opts.group}/${opts.variant}`, headlines: ad.headlines, descriptions: ad.descriptions };
  const command = `${SCRIPT} replace-ad --ad-group ${opts["ad-group"]} --ad ${opts.ad} --spec ${quoteArg(opts.spec)} --group ${opts.group} --variant ${opts.variant}`;
  if (!gate(plan, opts, { needsConfirm: false, command })) {
    await run("Validation", () => customer.mutateResources(ops, { validate_only: true }));
    console.log("Validation API : OK.");
    return;
  }
  const res = await run("Envoi", () => customer.mutateResources(ops));
  const newId = (res.mutate_operation_responses || []).map((r) => r.ad_group_ad_result?.resource_name).find(Boolean)?.split("~").pop();
  await logWrite({
    platform: "google",
    action: "annonce remplacée",
    target: `groupe ${opts["ad-group"]}`,
    before: `annonce ${opts.ad} active`,
    after: `annonce ${newId} (${opts.group}/${opts.variant}) active, ${opts.ad} en pause`,
    reason: opts.reason,
    rollback: `${SCRIPT} ad-status --ad-group ${opts["ad-group"]} --ad ${opts.ad} --status ENABLED --apply && ${SCRIPT} ad-status --ad-group ${opts["ad-group"]} --ad ${newId} --status PAUSED --apply`,
  });
  console.log(`✅ annonce ${opts.ad} remplacée par ${newId}`);
}

// ── Conversions hors ligne ───────────────────────────────────────────────────

const CONVERSION_ACTIONS = {
  signup: { env: "GOOGLE_ADS_CONVERSION_SIGNUP_ID", name: "Inscription (import PostHog)", category: "SIGNUP" },
  purchase: { env: "GOOGLE_ADS_CONVERSION_PURCHASE_ID", name: "Premier achat (import PostHog)", category: "PURCHASE" },
};

async function cmdCreateConversionActions(opts) {
  const { customer } = await connect();
  const existing = await run("Lecture des conversions", () =>
    customer.query(`SELECT conversion_action.id, conversion_action.name FROM conversion_action WHERE conversion_action.type = 'UPLOAD_CLICKS'`)
  );
  const missing = Object.values(CONVERSION_ACTIONS).filter((a) => !existing.some((r) => r.conversion_action.name === a.name));
  for (const r of existing) console.log(`   existe : ${r.conversion_action.name} → ID ${r.conversion_action.id}`);
  if (!missing.length) return;
  const resources = missing.map((a) => ({
    name: a.name,
    type: enums.ConversionActionType.UPLOAD_CLICKS,
    category: enums.ConversionActionCategory[a.category],
    status: enums.ConversionActionStatus.ENABLED,
    value_settings: { default_value: 0, default_currency_code: "EUR", always_use_default_value: false },
  }));
  if (!gate({ platform: "google", action: "create-conversion-actions", create: missing.map((a) => a.name) }, opts, { needsConfirm: false, command: `${SCRIPT} create-conversion-actions` })) return;
  const res = await run("Création", () => customer.conversionActions.create(resources));
  for (const [i, r] of (res.results || []).entries()) console.log(`✅ ${missing[i].name} → ${missing[i].env}=${r.resource_name.split("/").pop()} (à mettre dans .env.local)`);
  await appendLog(`### ${ymd(new Date())} · google · actions de conversion · ${missing.map((a) => a.name).join(", ")} créées`);
}

const LEDGER = path.join(CACHE_DIR, "conversions-google.jsonl");

async function cmdUploadConversions(opts) {
  const kind = opts.kind;
  const action = CONVERSION_ACTIONS[kind];
  if (!action) fail("--kind signup|purchase attendu.");
  if (kind === "purchase") {
    // Le jeu n'envoie aucun événement pour un achat en argent réel (Stripe) : rien de fiable à importer.
    fail("Aucun événement d'achat en argent réel n'existe dans le PostHog du jeu (voir .claude/skills/ads/references/mesure.md). Import des achats impossible tant que le jeu ne l'envoie pas.");
  }
  const actionId = await loadEnvVar(action.env);
  if (!actionId) fail(`${action.env} manquant dans .env.local : lancer d'abord create-conversion-actions.`);
  const { cid, login, env } = await connect();
  const days = Number(opts.days || 3);
  const to = new Date();
  to.setDate(to.getDate() + 1);
  const from = new Date();
  from.setDate(from.getDate() - days);

  const rows = await paidSignups(ymd(from), ymd(to));
  if (rows === null) fail("POSTHOG_PERSONAL_API_KEY ou POSTHOG_GAME_PROJECT_ID manquant : aucune inscription lisible.");
  let sent = new Set();
  try {
    sent = new Set((await fs.readFile(LEDGER, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l).transactionId));
  } catch {
    // Premier import.
  }
  const value = Number(await loadEnvVar("ADS_SIGNUP_VALUE_EUR")) || undefined;
  const events = rows
    .filter((r) => r.source === "google" && (r.gclid || r.gbraid || r.wbraid))
    .map((r) => ({
      transactionId: `signup-${r.person}`,
      eventTimestamp: new Date(r.signed_at).toISOString(),
      eventSource: "WEB",
      adIdentifiers: Object.fromEntries(["gclid", "gbraid", "wbraid"].filter((k) => r[k]).map((k) => [k, r[k]])),
      ...(value ? { conversionValue: value, currency: "EUR" } : {}),
    }))
    .filter((e) => !sent.has(e.transactionId));
  console.log(`\n▶ ${rows.filter((r) => r.source === "google").length} inscrit(s) venus de Google sur ${days} jours, ${events.length} à envoyer (déjà envoyés ignorés).`);
  if (!events.length) return;

  // Consentement : seulement ce que la CMP du site/jeu a réellement recueilli. Sans réglage, on
  // n'affirme rien et Google peut ne pas attribuer les conversions venues de l'EEE.
  const consent = await loadEnvVar("ADS_CONSENT_AD_USER_DATA");
  if (!consent) console.log("⚠️  ADS_CONSENT_AD_USER_DATA non défini : envoi sans signal de consentement (voir mesure.md).");
  const body = {
    destinations: [{ operatingAccount: { accountType: "GOOGLE_ADS", accountId: cid }, loginAccount: { accountType: "GOOGLE_ADS", accountId: login || cid }, productDestinationId: actionId }],
    ...(consent ? { consent: { adUserData: consent === "GRANTED" ? "CONSENT_GRANTED" : "CONSENT_DENIED" } } : {}),
    events,
  };
  const plan = { platform: "google", action: "upload-conversions", kind, conversionAction: actionId, events: events.length, first: events[0].eventTimestamp, last: events.at(-1).eventTimestamp };
  const apply = gate(plan, opts, { needsConfirm: false, command: `${SCRIPT} upload-conversions --kind ${kind} --days ${days}` });

  const oauth = new OAuth2Client(env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_ADS_CLIENT_SECRET);
  oauth.setCredentials({ refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN });
  const { token } = await oauth.getAccessToken().catch((e) => fail(`OAuth : ${e.message}`));
  const res = await fetch("https://datamanager.googleapis.com/v1/events:ingest", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, validateOnly: !apply }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Data Manager ${res.status} : ${out.error?.message || JSON.stringify(out).slice(0, 400)}`);
  if (!apply) {
    console.log("Validation API : OK (rien n'a été importé).");
    return;
  }
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.appendFile(LEDGER, events.map((e) => JSON.stringify({ at: new Date().toISOString(), transactionId: e.transactionId })).join("\n") + "\n");
  await logWrite({ platform: "google", action: "import de conversions", target: action.name, before: `${sent.size} déjà importées`, after: `+${events.length} (${plan.first} → ${plan.last})`, reason: "inscriptions PostHog avec identifiant de clic Google", rollback: null });
  console.log(`✅ ${events.length} conversion(s) importée(s) (requête ${out.requestId || "sans ID"}).`);
}

// ── Entrée ───────────────────────────────────────────────────────────────────

async function cmdLint(opts) {
  const spec = await loadSpec(opts.spec);
  const groups = spec.adGroups.map((g) => `${g.name} (${Object.values(g.keywords).flat().length} mots-clés, ${g.ads.length} annonce(s))`);
  console.log(`✅ ${spec.name} [${spec.status}] : ${groups.join(", ")} ; ${Object.values(spec.negatives || {}).flat().length} négatifs.`);
  if (spec.status === "bloque") console.log(`   Bloquée : ${spec.blockedReason}`);
}

const COMMANDS = {
  lint: cmdLint,
  read: cmdRead,
  create: cmdCreate,
  enable: (o) => cmdStatus(o, "ENABLED"),
  pause: (o) => cmdStatus(o, "PAUSED"),
  "set-budget": cmdSetBudget,
  "add-negatives": cmdAddNegatives,
  "remove-negatives": cmdRemoveNegatives,
  "replace-ad": cmdReplaceAd,
  "ad-status": cmdAdStatus,
  "create-conversion-actions": cmdCreateConversionActions,
  "upload-conversions": cmdUploadConversions,
};

const opts = parseArgs(process.argv.slice(2), {
  known: ["days", "spec", "budget-eur", "max-cpc-eur", "campaign", "eur", "phrase", "exact", "criteria", "ad-group", "ad", "group", "variant", "status", "kind", "confirm", "reason"],
  flags: ["apply"],
});
const command = COMMANDS[opts._[0]];
if (!command) fail(`Commande attendue : ${Object.keys(COMMANDS).join(", ")}.`);
command(opts).catch((e) => fail(e.stack || e.message));
