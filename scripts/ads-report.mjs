#!/usr/bin/env node
/**
 * Compte rendu publicitaire hebdomadaire (mode `report` du skill `ads`), sans interaction : lit les
 * régies (scripts/ads-google.mjs read, scripts/ads-reddit.mjs read), GA4 (scripts/ga4-fetch.mjs,
 * sessions par campagne), PostHog (départs vers le jeu côté site, inscriptions et rétention J1/J7
 * côté jeu), calcule par campagne dépense, clics, CPC, sessions, départs, inscriptions, coût par
 * inscription, rétention, applique les règles d'arrêt et écrit une entrée datée dans
 * editorial/ads-log.md (hors Git). Les définitions sont dans .claude/skills/ads/references/mesure.md.
 *
 * Ne modifie aucune campagne, sauf avec --apply-guards : alors, et seulement pour le garde-fou de
 * rétention J7 (< 15 % sur une cohorte d'au moins ADS_MIN_COHORT inscrits), la campagne est mise en
 * pause par le script de sa régie, journalisée avec sa commande de retour arrière.
 *
 * Une donnée absente reste une case vide : jamais d'estimation dans les colonnes mesurées. La seule
 * valeur estimée est celle d'une inscription, posée au plan avant le lancement
 * (editorial/ads-plan.json, hors Git ; modèle dans editorial/ads/plan.example.json), et dite telle.
 *
 * Usage :
 *   node scripts/ads-report.mjs                        # dernière semaine complète, lundi → dimanche
 *   node scripts/ads-report.mjs --from 2026-11-02 --to 2026-11-09   # [from, to[
 *   node scripts/ads-report.mjs --apply-guards         # met en pause ce que le garde-fou J7 désigne
 *
 * Code de sortie : 0, ou 2 si une alerte a été levée (pour la tâche planifiée qui doit prévenir).
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  CACHE_DIR,
  LOG_FILE,
  RETENTION_D7_FLOOR,
  appendLog,
  fail,
  loadEnvVar,
  paidSignups,
  parseArgs,
  parseCsv,
  posthogHealth,
  posthogQuery,
  writeCsv,
  ymd,
} from "./ads-lib.mjs";

const PLAN_FILE = "editorial/ads-plan.json";
const DAY_MS = 24 * 3600 * 1000;
const addDays = (d, n) => ymd(new Date(Date.parse(`${d}T12:00:00`) + n * DAY_MS));

const opts = parseArgs(process.argv.slice(2), { known: ["from", "to"], flags: ["apply-guards"] });
const today = ymd(new Date());

function lastWeek() {
  const d = new Date(`${today}T12:00:00`);
  const sinceMonday = (d.getDay() + 6) % 7;
  const to = addDays(today, -sinceMonday);
  return { from: addDays(to, -7), to };
}
const { from, to } = opts.from && opts.to ? { from: opts.from, to: opts.to } : lastWeek();
if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from >= to) fail("--from et --to (exclu) attendus au format AAAA-MM-JJ.");
const lastDay = addDays(to, -1);

const notes = [];
const sources = {};

// ── Plan ─────────────────────────────────────────────────────────────────────

let plan = {};
try {
  plan = JSON.parse(await fs.readFile(PLAN_FILE, "utf8")).campaigns || {};
} catch {
  notes.push(`Aucun plan lisible (${PLAN_FILE}) : règles d'arrêt chiffrées indisponibles.`);
}
const starts = Object.values(plan).map((p) => p.start).filter(Boolean);
const earliest = [addDays(today, -15), from, ...starts].sort()[0];
const daysBack = Math.min(90, Math.ceil((Date.parse(today) - Date.parse(earliest)) / DAY_MS) + 1);

// ── Régies ───────────────────────────────────────────────────────────────────

function runScript(args) {
  const res = spawnSync(process.execPath, args, { encoding: "utf8" });
  return { ok: res.status === 0, out: `${res.stdout}\n${res.stderr}`.trim() };
}

async function readCsvFile(file) {
  try {
    return parseCsv(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

const spendDays = []; // { platform, id, campaign, date, spend, clicks, impressions }
const campaignIds = new Map(); // nom → { platform, id }

const PLATFORMS = {
  google: ["GOOGLE_ADS_REFRESH_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"],
  reddit: ["REDDIT_ADS_REFRESH_TOKEN", "REDDIT_ADS_ACCOUNT_ID"],
};
for (const [platform, vars] of Object.entries(PLATFORMS)) {
  if (!(await Promise.all(vars.map(loadEnvVar))).every(Boolean)) {
    sources[platform] = "non configuré";
    continue;
  }
  const r = runScript([`scripts/ads-${platform}.mjs`, "read", "--days", String(daysBack)]);
  if (!r.ok) {
    sources[platform] = "en erreur";
    notes.push(`${platform} : lecture impossible (${r.out.split("\n").filter(Boolean).at(-1)}).`);
    continue;
  }
  const dir = path.join(CACHE_DIR, `${platform}-${today}`);
  const days = (await readCsvFile(path.join(dir, "Jours.csv"))) || [];
  const camps = (await readCsvFile(path.join(dir, "Campagnes.csv"))) || [];
  for (const c of camps) campaignIds.set(c.Campagne, { platform, id: c.ID, status: c.Statut });
  for (const d of days) {
    const spendKey = Object.keys(d).find((k) => k.startsWith("Dépense"));
    spendDays.push({ platform, id: d.ID, campaign: d.Campagne, date: String(d.Date).slice(0, 10), spend: Number(d[spendKey]) || 0, clicks: Number(d.Clics) || 0, impressions: Number(d.Impressions) || 0 });
  }
  sources[platform] = "lu";
}

// ── GA4 ──────────────────────────────────────────────────────────────────────

const sessions = new Map();
{
  const r = runScript(["scripts/ga4-fetch.mjs", "--days", String(daysBack), "--host", "dynastynova.com"]);
  const rows = r.ok ? await readCsvFile(path.join(".ga4-cache", `dynastynova.com-GA4-${today}`, "Campagnes.csv")) : null;
  if (!rows) {
    sources.ga4 = "indisponible";
    notes.push(`GA4 : ${r.ok ? "Campagnes.csv absent" : r.out.split("\n").filter(Boolean).at(-1)}.`);
  } else {
    sources.ga4 = "lu";
    for (const row of rows) {
      if (row.Support !== "cpc" || row.Date < from || row.Date >= to) continue;
      sessions.set(row.Campagne, (sessions.get(row.Campagne) || 0) + Number(row.Sessions));
    }
  }
}

// ── PostHog ──────────────────────────────────────────────────────────────────

const departures = new Map();
try {
  const range = `\`$start_timestamp\` >= toDateTime('${from} 00:00:00', 'Europe/Paris') AND \`$start_timestamp\` < toDateTime('${to} 00:00:00', 'Europe/Paris')`;
  const rows = await posthogQuery(
    await loadEnvVar("POSTHOG_PROJECT_ID"),
    `SELECT \`$entry_utm_campaign\` AS campaign,
       countIf(session_id IN (
         SELECT DISTINCT \`$session_id\` FROM events
         WHERE event = 'play_click' AND timestamp >= toDateTime('${from} 00:00:00', 'Europe/Paris')
       )) AS played
     FROM sessions WHERE ${range} AND \`$entry_utm_medium\` = 'cpc'
     GROUP BY campaign`
  );
  if (rows === null) sources.posthogSite = "non configuré";
  else {
    sources.posthogSite = "lu";
    for (const r of rows) departures.set(r.campaign, Number(r.played));
  }
} catch (e) {
  sources.posthogSite = "en erreur";
  notes.push(`PostHog site : ${e.message}`);
}

let signups = null;
let blind = [];
const gameProject = await loadEnvVar("POSTHOG_GAME_PROJECT_ID");
try {
  const health = gameProject ? await posthogHealth(gameProject, earliest, addDays(today, 1)) : null;
  if (!health) sources.posthogGame = "non configuré";
  else {
    blind = health.blind;
    signups = await paidSignups(earliest, addDays(today, 1));
    const blindInWindow = blind.filter((d) => d >= from && d < to);
    sources.posthogGame = blindInWindow.length
      ? `aveugle ${blindInWindow.length}/${Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)} jours (quota ?)`
      : "lu";
  }
} catch (e) {
  sources.posthogGame = "en erreur";
  notes.push(`PostHog jeu : ${e.message}`);
}
// Une période dont un seul jour est aveugle ne donne pas de compte d'inscriptions fiable.
const isBlind = (a, b) => signups === null || blind.some((d) => d >= a && d < b);

// ── Calcul par campagne ──────────────────────────────────────────────────────

const MIN_COHORT = Number(await loadEnvVar("ADS_MIN_COHORT")) || 10;
const signupDay = (r) => ymd(new Date(r.signed_at));
const sum = (list, key) => list.reduce((s, x) => s + x[key], 0);
const fmt = (v, digits = 2) => (v === null || v === undefined || Number.isNaN(v) ? "" : Number(v).toFixed(digits));
const pct = (num, den) => (den ? `${Math.round((num / den) * 100)} % (${num}/${den})` : "");

const names = new Set([...campaignIds.keys(), ...Object.keys(plan), ...spendDays.map((d) => d.campaign)]);
for (const r of signups || []) if (r.campaign) names.add(r.campaign);

const rows = [];
const alerts = [];
for (const name of [...names].sort()) {
  const p = plan[name] || null;
  const days = spendDays.filter((d) => d.campaign === name);
  const inWindow = days.filter((d) => d.date >= from && d.date < to);
  const spend = sum(inWindow, "spend");
  const clicks = sum(inWindow, "clicks");
  const mine = (signups || []).filter((r) => r.campaign === name);
  const windowSignups = mine.filter((r) => signupDay(r) >= from && signupDay(r) < to);
  const blindWindow = isBlind(from, to);
  const d1Known = windowSignups.filter((r) => r.d1_known);

  // Garde-fou J7 : inscrits de J-14 à J-8, dont la fenêtre J+7 est terminée.
  const cohortFrom = addDays(today, -14);
  const cohortTo = addDays(today, -7);
  const cohort = mine.filter((r) => signupDay(r) >= cohortFrom && signupDay(r) < cohortTo && r.d7_known);
  const cohortBlind = isBlind(cohortFrom, addDays(today, 1));
  const d7 = cohort.filter((r) => r.d7).length;

  // Règle 2 sur 14 jours, règle 3 depuis le lancement.
  const from14 = addDays(today, -14);
  const spend14 = sum(days.filter((d) => d.date >= from14 && d.date < today), "spend");
  const signups14 = mine.filter((r) => signupDay(r) >= from14 && signupDay(r) < today).length;
  const blind14 = isBlind(from14, today);
  const spendCum = p?.start ? sum(days.filter((d) => d.date >= p.start), "spend") : null;
  const signupsCum = p?.start ? mine.filter((r) => signupDay(r) >= p.start).length : null;
  const value = p?.signupValueEur ?? null;

  let verdict = "maintenir";
  const why = [];
  if (!p && (spend > 0 || ["ENABLED", "ACTIVE"].includes(campaignIds.get(name)?.status))) {
    verdict = "écrire le plan";
    why.push("campagne sans plan : ni budget de test ni valeur d'inscription posés");
  }
  if (!cohortBlind && cohort.length >= MIN_COHORT && d7 / cohort.length < RETENTION_D7_FLOOR) {
    verdict = "PAUSE (garde-fou J7)";
    why.push(`rétention J7 ${pct(d7, cohort.length)} < ${RETENTION_D7_FLOOR * 100} %`);
    alerts.push({ name, kind: "j7", text: `${name} : rétention J7 des inscrits payés ${pct(d7, cohort.length)}, sous ${RETENTION_D7_FLOOR * 100} %.` });
  } else if (!cohortBlind && cohort.length > 0 && cohort.length < MIN_COHORT) {
    why.push(`cohorte J7 de ${cohort.length} inscrit(s), sous ${MIN_COHORT} : tendance seulement`);
  }
  if (verdict === "maintenir" || verdict === "écrire le plan") {
    if (p?.testBudgetEur && spendCum >= p.testBudgetEur && signupsCum === 0 && !isBlind(p.start, today)) {
      verdict = "COUPER";
      why.push(`budget de test épuisé (${fmt(spendCum)} € pour ${p.testBudgetEur} €) sans inscription : vérifier d'abord la chaîne de mesure`);
      alerts.push({ name, kind: "test", text: `${name} : budget de test épuisé sans aucune inscription.` });
    } else if (value && !blind14 && spend14 > 2 * value && (signups14 === 0 || spend14 / signups14 > 2 * value)) {
      verdict = "COUPER";
      why.push(`coût par inscription sur 14 jours ${signups14 ? `${fmt(spend14 / signups14)} €` : "infini (0 inscription)"} > 2 × ${fmt(value)} € (valeur ${p.signupValueMeasured ? "mesurée" : "estimée au plan"})`);
    } else if (value && !blind14 && !cohortBlind && signups14 > 0 && spend14 / signups14 < value && cohort.length >= MIN_COHORT && d7 / cohort.length >= RETENTION_D7_FLOOR) {
      verdict = "monter d'un palier (+30 % max)";
      why.push(`coût par inscription ${fmt(spend14 / signups14)} € < valeur ${fmt(value)} €, J7 ${pct(d7, cohort.length)}`);
    }
  }
  if (blindWindow || blind14) {
    why.push("PostHog du jeu aveugle sur la période : aucune décision sur les inscriptions, ne pas monter");
    if (verdict.startsWith("monter")) verdict = "maintenir";
  }

  rows.push({
    name,
    platform: campaignIds.get(name)?.platform || p?.platform || "",
    spend: days.length ? spend : null,
    clicks: days.length ? clicks : null,
    cpc: clicks ? spend / clicks : null,
    sessions: sources.ga4 === "lu" ? sessions.get(name) || 0 : null,
    departures: sources.posthogSite === "lu" ? departures.get(name) || 0 : null,
    signups: blindWindow ? null : windowSignups.length,
    cpa: !blindWindow && windowSignups.length && days.length ? spend / windowSignups.length : null,
    d1: blindWindow ? "" : pct(d1Known.filter((r) => r.d1).length, d1Known.length),
    d7: cohortBlind ? "" : pct(d7, cohort.length),
    verdict,
    why,
  });
}

// ── Garde-fou appliqué (option) ──────────────────────────────────────────────

const applied = [];
if (opts["apply-guards"]) {
  for (const a of alerts.filter((x) => x.kind === "j7")) {
    const target = campaignIds.get(a.name);
    if (!target) {
      applied.push(`${a.name} : campagne introuvable dans les régies, pause à faire à la main`);
      continue;
    }
    const r = runScript([`scripts/ads-${target.platform}.mjs`, "pause", "--campaign", target.id, "--apply", "--reason", "garde-fou rétention J7 < 15 % (ads-report)"]);
    applied.push(`${a.name} : ${r.ok ? "mise en pause" : `pause échouée (${r.out.split("\n").filter(Boolean).at(-1)})`}`);
  }
}

// ── Sorties ──────────────────────────────────────────────────────────────────

const reportDir = path.join(CACHE_DIR, `report-${today}`);
await writeCsv(reportDir, "Campagnes.csv",
  ["Campagne", "Régie", "Dépense (€)", "Clics", "CPC (€)", "Sessions GA4", "Départs vers le jeu", "Inscriptions", "Coût par inscription (€)", "Rétention J1", "Rétention J7 (cohorte J-14 à J-8)", "Revenu attribué (€)", "Valeur par inscription (€)", "Recommandation", "Motif"],
  rows.map((r) => [r.name, r.platform, fmt(r.spend), r.clicks ?? "", fmt(r.cpc), r.sessions ?? "", r.departures ?? "", r.signups ?? "", fmt(r.cpa), r.d1, r.d7, "", "", r.verdict, r.why.join(" ; ")]));

const cell = (v) => (v === null || v === undefined ? "" : String(v));
const header = `## ${today} · semaine du ${from} au ${lastDay} · compte rendu publicitaire`;
let existing = "";
try {
  existing = await fs.readFile(LOG_FILE, "utf8");
} catch {
  // Premier compte rendu.
}
const sourceLine = `Google Ads ${sources.google} ; Reddit Ads ${sources.reddit} ; GA4 ${sources.ga4} ; PostHog site ${sources.posthogSite} ; PostHog jeu ${sources.posthogGame}`;
const table = [
  "| Campagne | Dépense | Clics | CPC | Sessions | Départs | Inscr. | Coût/inscr. | J1 | J7 (cohorte) | Revenu | Valeur/inscr. | Recommandation |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.name} | ${fmt(r.spend)} | ${cell(r.clicks)} | ${fmt(r.cpc)} | ${cell(r.sessions)} | ${cell(r.departures)} | ${cell(r.signups)} | ${fmt(r.cpa)} | ${r.d1} | ${r.d7} |  |  | ${r.verdict} |`),
];
const entry = [
  header,
  `- Sources : ${sourceLine}.`,
  "- Revenu et valeur par inscription : vides, le jeu n'envoie aucun événement d'achat en argent réel (voir mesure.md).",
  ...notes.map((n) => `- Note : ${n}`),
  "",
  ...(rows.length ? table : ["Aucune campagne lue ni planifiée."]),
  "",
  ...rows.filter((r) => r.why.length).map((r) => `- ${r.name} : ${r.verdict}, ${r.why.join(" ; ")}.`),
  ...alerts.map((a) => `- **ALERTE** ${a.text}`),
  `- Décision : à valider${alerts.length && !opts["apply-guards"] ? " (garde-fou non appliqué : rapport en lecture seule)" : ""}.`,
  `- Changements appliqués : ${applied.length ? applied.join(" ; ") : "aucun"}.`,
].join("\n");

if (existing.includes(header)) {
  console.log(`ℹ️  ${LOG_FILE} contient déjà ce compte rendu : journal inchangé (chiffres dans ${reportDir}).`);
} else {
  await appendLog(entry);
  console.log(`📝 Compte rendu ajouté à ${LOG_FILE}`);
}

const spendTotal = rows.reduce((s, r) => s + (r.spend || 0), 0);
const signupTotal = rows.every((r) => r.signups === null) ? null : rows.reduce((s, r) => s + (r.signups || 0), 0);
console.log(
  [
    `\nSemaine du ${from} au ${lastDay} : ${fmt(spendTotal)} € dépensés, ${signupTotal ?? "?"} inscription(s) payée(s), ${rows.length} campagne(s).`,
    `Sources : ${sourceLine}.`,
    ...rows.map((r) => `${r.name} : ${r.verdict}${r.why.length ? ` (${r.why[0]})` : ""}`),
    alerts.length ? `ALERTES : ${alerts.map((a) => a.text).join(" ")}` : "Aucune alerte.",
    `Détail : ${reportDir}/Campagnes.csv`,
  ].join("\n")
);
process.exit(alerts.length ? 2 : 0);
