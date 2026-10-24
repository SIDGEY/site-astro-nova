/**
 * Garde-fous et outils communs aux scripts de pilotage publicitaire (scripts/ads-google.mjs,
 * scripts/ads-reddit.mjs, scripts/ads-report.mjs). Ils sont dans le code, pas seulement dans la
 * doc du skill `ads` : un appel mal formé ou trop pressé est refusé par le script lui-même.
 *
 * - Lecture seule par défaut : une écriture n'est envoyée qu'avec --apply.
 * - Plafond ADS_DAILY_CAP_EUR (.env.local) : la somme des budgets journaliers des campagnes
 *   actives, toutes régies confondues, après le changement, ne le dépasse jamais. Sans plafond
 *   lisible, aucune écriture.
 * - Hausse de budget : au plus +30 % par rapport au plus bas budget connu de la campagne sur
 *   les 7 derniers jours.
 * - Hausse de budget et création de campagne : --apply ne suffit pas, il faut aussi
 *   --confirm <jeton>. Le jeton est l'empreinte du plan affiché par le dry-run (état avant
 *   compris) : il ne se passe qu'après l'accord explicite de l'utilisateur sur ce plan, et il
 *   ne vaut plus rien si l'état du compte a changé entre-temps.
 * - Chaque écriture appliquée est journalisée dans editorial/ads-log.md (hors Git : le dépôt est
 *   public) avec l'état avant/après et la commande de retour arrière.
 *
 * Les secrets se lisent dans .env.local puis .env (jamais commités).
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const CACHE_DIR = ".ads-cache";
export const LOG_FILE = "editorial/ads-log.md";
export const MAX_WEEKLY_INCREASE = 0.3;
export const RETENTION_D7_FLOOR = 0.15;

export function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

const envFiles = {};
async function readEnvFile(file) {
  if (!(file in envFiles)) {
    try {
      envFiles[file] = await fs.readFile(path.resolve(file), "utf8");
    } catch {
      envFiles[file] = "";
    }
  }
  return envFiles[file];
}

export async function loadEnvVar(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const file of [".env.local", ".env"]) {
    const line = (await readEnvFile(file)).split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
    if (line) {
      return line
        .slice(name.length + 1)
        .replace(/\s+#.*$/, "")
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

/** Variables obligatoires : toutes lues d'un coup, pour signaler toutes les absentes. */
export async function requireEnv(names, hint) {
  const values = {};
  const missing = [];
  for (const n of names) {
    values[n] = await loadEnvVar(n);
    if (!values[n]) missing.push(n);
  }
  if (missing.length) fail(`Variables manquantes dans .env.local : ${missing.join(", ")}${hint ? `\n   ${hint}` : ""}`);
  return values;
}

/**
 * Options `--clé valeur` et drapeaux `--apply`. `flags` liste les drapeaux sans valeur ; toute
 * autre option inconnue de `known` est refusée (une faute de frappe ne doit jamais passer pour
 * une option prise en compte).
 */
export function parseArgs(argv, { known = [], flags = [] } = {}) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      o._.push(a);
      continue;
    }
    const key = a.slice(2);
    if (flags.includes(key)) o[key] = true;
    else if (known.includes(key)) {
      if (argv[i + 1] === undefined || argv[i + 1].startsWith("--")) fail(`--${key} attend une valeur.`);
      o[key] = argv[++i];
    } else fail(`Option inconnue : ${a}`);
  }
  return o;
}

export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function toCsv(header, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}

export async function writeCsv(dir, file, header, rows) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, file), toCsv(header, rows));
}

// ── Budgets connus ───────────────────────────────────────────────────────────

/**
 * Chaque lecture d'une régie enregistre ses campagnes et leurs budgets journaliers (en euros) :
 * c'est ce que lit le contrôle du plafond pour l'autre régie, et l'historique de la règle des
 * +30 % par semaine.
 */
export async function recordBudgets(platform, campaigns) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const at = new Date().toISOString();
  await fs.writeFile(path.join(CACHE_DIR, `budgets-${platform}.json`), JSON.stringify({ at, campaigns }, null, 2));
  const lines = campaigns.map((c) => JSON.stringify({ at, platform, id: String(c.id), dailyEur: c.dailyEur, status: c.status }));
  if (lines.length) await fs.appendFile(path.join(CACHE_DIR, "budgets-history.jsonl"), lines.join("\n") + "\n");
}

async function readJsonl(file) {
  try {
    return (await fs.readFile(file, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

const PLATFORMS = {
  google: ["GOOGLE_ADS_REFRESH_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"],
  reddit: ["REDDIT_ADS_CLIENT_ID", "REDDIT_ADS_ACCOUNT_ID"],
};

/**
 * Plafond journalier total. `current` : les campagnes de la régie qui écrit, lues en direct
 * juste avant, avec le changement appliqué. Les autres régies configurées sont prises dans leur
 * dernier relevé, qui doit dater de moins de 24 h : sinon on ne sait pas ce qu'elles dépensent
 * et l'écriture est refusée.
 */
export async function guardDailyCap(platform, current) {
  const capRaw = await loadEnvVar("ADS_DAILY_CAP_EUR");
  const cap = Number(capRaw);
  if (!capRaw || !Number.isFinite(cap) || cap <= 0) {
    fail("ADS_DAILY_CAP_EUR absent ou invalide dans .env.local : aucune écriture sans plafond de dépense.");
  }
  const active = (c) => c.status === "ENABLED" || c.status === "ACTIVE";
  let total = current.filter(active).reduce((s, c) => s + (c.dailyEur || 0), 0);
  const detail = [`${platform} : ${total.toFixed(2)} €`];

  for (const [other, vars] of Object.entries(PLATFORMS)) {
    if (other === platform) continue;
    const configured = (await Promise.all(vars.map(loadEnvVar))).every(Boolean);
    if (!configured) continue;
    let snap;
    try {
      snap = JSON.parse(await fs.readFile(path.join(CACHE_DIR, `budgets-${other}.json`), "utf8"));
    } catch {
      snap = null;
    }
    if (!snap || Date.now() - Date.parse(snap.at) > 24 * 3600 * 1000) {
      fail(`Budgets ${other} inconnus depuis plus de 24 h : lancer d'abord la lecture (node scripts/ads-${other}.mjs read).`);
    }
    const sub = snap.campaigns.filter(active).reduce((s, c) => s + (c.dailyEur || 0), 0);
    total += sub;
    detail.push(`${other} : ${sub.toFixed(2)} € (relevé ${snap.at})`);
  }

  console.log(`   Plafond : ${total.toFixed(2)} € / jour après changement (${detail.join(", ")}) pour ${cap.toFixed(2)} € autorisés.`);
  if (total > cap + 1e-9) fail(`Refusé : ${total.toFixed(2)} € / jour dépasserait ADS_DAILY_CAP_EUR (${cap.toFixed(2)} €).`);
}

/** Au plus +30 % par rapport au plus bas budget connu de la campagne sur 7 jours glissants. */
export async function guardBudgetIncrease(platform, campaignId, fromEur, toEur) {
  if (!(toEur > fromEur)) return { increase: false };
  const since = Date.now() - 7 * 24 * 3600 * 1000;
  const known = (await readJsonl(path.join(CACHE_DIR, "budgets-history.jsonl")))
    .filter((r) => r.platform === platform && r.id === String(campaignId) && Date.parse(r.at) >= since)
    .map((r) => r.dailyEur)
    .filter((v) => typeof v === "number");
  const base = Math.min(fromEur, ...known);
  const max = base * (1 + MAX_WEEKLY_INCREASE);
  console.log(`   Hausse : ${fromEur.toFixed(2)} → ${toEur.toFixed(2)} € / jour ; base 7 jours ${base.toFixed(2)} €, maximum ${max.toFixed(2)} €.`);
  if (toEur > max + 1e-9) {
    fail(`Refusé : +${(((toEur - base) / base) * 100).toFixed(0)} % en 7 jours, la règle est +${MAX_WEEKLY_INCREASE * 100} % au plus (maximum ${max.toFixed(2)} €).`);
  }
  return { increase: true };
}

// ── Confirmation et journal ──────────────────────────────────────────────────

/** Empreinte courte d'un contenu (opérations d'une création) : glissée dans le plan, elle lie le jeton au détail exact. */
export function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

export function planToken(plan) {
  return crypto.createHash("sha256").update(JSON.stringify(plan)).digest("hex").slice(0, 10);
}

/**
 * Décide si le plan part. Sans --apply : dry-run, rien n'est envoyé. Pour une hausse de budget
 * ou une création (`needsConfirm`), --apply exige le jeton du plan affiché.
 * Renvoie true si l'écriture doit être envoyée.
 */
export function gate(plan, opts, { needsConfirm, command }) {
  const token = planToken(plan);
  console.log("\n── Plan ──────────────────────────────────────────");
  console.log(JSON.stringify(plan, null, 2));
  console.log("──────────────────────────────────────────────────");
  if (!opts.apply) {
    console.log("\nDry-run : rien n'a été envoyé.");
    console.log(`Pour appliquer : ${command} --apply${needsConfirm ? ` --confirm ${token}` : ""}`);
    if (needsConfirm) console.log("(hausse de budget ou création : seulement après l'accord explicite de l'utilisateur sur ce plan)");
    return false;
  }
  if (needsConfirm && opts.confirm !== token) {
    fail(
      `Hausse de budget ou création : --confirm ${opts.confirm ? `${opts.confirm} ne correspond pas au plan (jeton attendu ${token} ; l'état a peut-être changé depuis le dry-run)` : `<jeton> manquant`}.\n` +
        `   Relancer sans --apply, faire valider ce plan par l'utilisateur, puis passer le jeton affiché.`
    );
  }
  return true;
}

async function ensureLog() {
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.writeFile(
      LOG_FILE,
      "# Journal publicitaire\n\n" +
        "Comptes rendus hebdomadaires et écritures sur les régies (voir le skill `ads`). Hors Git : le dépôt\n" +
        "est public. On ne réécrit jamais une entrée passée, on complète son résultat.\n"
    );
  }
}

export async function appendLog(markdown) {
  await ensureLog();
  await fs.appendFile(LOG_FILE, `\n${markdown.trim()}\n`);
}

function stamp() {
  const d = new Date();
  return `${ymd(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Une écriture appliquée : état avant/après et commande pour revenir en arrière. */
export async function logWrite({ platform, action, target, before, after, rollback, reason }) {
  const fmt = (v) => (typeof v === "string" ? v : `\`${JSON.stringify(v)}\``);
  await appendLog(
    [
      `### ${stamp()} · ${platform} · ${action} · ${target}`,
      `- Avant : ${fmt(before)}`,
      `- Après : ${fmt(after)}`,
      `- Motif : ${reason || "non précisé"}`,
      `- Retour arrière : ${rollback ? `\`${rollback}\`` : "aucun (à défaire à la main dans la régie)"}`,
    ].join("\n")
  );
  console.log(`📝 Écriture journalisée dans ${LOG_FILE}`);
}

export function quoteArg(v) {
  return /^[\w./:@%+-]+$/.test(String(v)) ? String(v) : `'${String(v).replace(/'/g, "'\\''")}'`;
}

// ── PostHog ──────────────────────────────────────────────────────────────────

export async function posthogQuery(projectId, query) {
  const apiKey = await loadEnvVar("POSTHOG_PERSONAL_API_KEY");
  if (!apiKey || !projectId) return null;
  const apiHost = ((await loadEnvVar("POSTHOG_API_HOST")) || "https://eu.posthog.com").replace(/\/$/, "");
  const res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PostHog ${res.status} : ${body.detail || JSON.stringify(body).slice(0, 300)}`);
  return body.results.map((row) => Object.fromEntries(body.columns.map((c, i) => [c, row[i]])));
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Inscrits du jeu (projet POSTHOG_GAME_PROJECT_ID) dont l'inscription tombe dans [from, to[ et
 * qui sont arrivés par un clic payé (`utm_medium` = medium) dans les 30 jours avant : une ligne
 * par personne, avec la campagne du dernier clic payé, ses identifiants de clic et son activité
 * à J1 et J7 (une page vue du jeu dans [J+1, J+2[ et [J+7, J+8[ après l'inscription).
 *
 * L'inscription est `auth_signup_submitted`, envoyé au clic sur « Créer un compte » avant la
 * réponse du serveur (voir .claude/skills/ads/references/mesure.md) : il compte aussi les
 * tentatives refusées. `d1_known` / `d7_known` disent si la fenêtre est déjà terminée.
 */
export async function paidSignups(from, to, { medium = "cpc" } = {}) {
  if (!DAY.test(from) || !DAY.test(to)) throw new Error("paidSignups : dates AAAA-MM-JJ attendues.");
  if (!/^[a-z0-9_-]+$/i.test(medium)) throw new Error(`paidSignups : medium invalide : ${medium}`);
  const projectId = await loadEnvVar("POSTHOG_GAME_PROJECT_ID");
  const start = `toDateTime('${from} 00:00:00', 'Europe/Paris')`;
  const end = `toDateTime('${to} 00:00:00', 'Europe/Paris')`;
  return posthogQuery(
    projectId,
    `
    WITH signups AS (
      SELECT person_id AS pid, min(timestamp) AS t0
      FROM events
      WHERE event = 'auth_signup_submitted' AND timestamp >= ${start} AND timestamp < ${end}
      GROUP BY pid
    ),
    touch AS (
      SELECT person_id AS pid,
        argMax(properties.utm_source, timestamp) AS source,
        argMax(properties.utm_campaign, timestamp) AS campaign,
        argMaxIf(properties.gclid, timestamp, properties.gclid IS NOT NULL) AS gclid,
        argMaxIf(properties.gbraid, timestamp, properties.gbraid IS NOT NULL) AS gbraid,
        argMaxIf(properties.wbraid, timestamp, properties.wbraid IS NOT NULL) AS wbraid,
        argMaxIf(properties.rdt_cid, timestamp, properties.rdt_cid IS NOT NULL) AS rdt_cid
      FROM events
      WHERE event = '$pageview' AND properties.utm_medium = '${medium}'
        AND timestamp >= ${start} - INTERVAL 30 DAY AND timestamp < ${end}
      GROUP BY pid
    ),
    activity AS (
      SELECT s.pid AS pid,
        countIf(e.timestamp >= s.t0 + INTERVAL 1 DAY AND e.timestamp < s.t0 + INTERVAL 2 DAY) > 0 AS d1,
        countIf(e.timestamp >= s.t0 + INTERVAL 7 DAY AND e.timestamp < s.t0 + INTERVAL 8 DAY) > 0 AS d7
      FROM events AS e INNER JOIN signups AS s ON e.person_id = s.pid
      WHERE e.event = '$pageview' AND e.timestamp >= ${start}
      GROUP BY s.pid
    )
    SELECT toString(s.pid) AS person, s.t0 AS signed_at, t.source AS source, t.campaign AS campaign,
      t.gclid AS gclid, t.gbraid AS gbraid, t.wbraid AS wbraid, t.rdt_cid AS rdt_cid,
      coalesce(a.d1, 0) AS d1, coalesce(a.d7, 0) AS d7,
      s.t0 + INTERVAL 2 DAY <= now() AS d1_known, s.t0 + INTERVAL 8 DAY <= now() AS d7_known
    FROM signups AS s
    INNER JOIN touch AS t ON t.pid = s.pid
    LEFT JOIN activity AS a ON a.pid = s.pid
    ORDER BY signed_at
    `
  );
}

/**
 * Événements hors `$exception` par jour. Sous `floor` (1 000 par défaut, le jeu en envoie des
 * dizaines de milliers un jour normal), PostHog n'a presque rien gardé : quota épuisé, le jour est
 * aveugle et sort des calculs.
 */
export async function posthogHealth(projectId, from, to, floor = 1000) {
  const rows = await posthogQuery(
    projectId,
    `SELECT toString(toDate(toTimeZone(timestamp, 'Europe/Paris'))) AS jour, countIf(event != '$exception') AS events
     FROM events
     WHERE timestamp >= toDateTime('${from} 00:00:00', 'Europe/Paris') AND timestamp < toDateTime('${to} 00:00:00', 'Europe/Paris')
     GROUP BY jour ORDER BY jour`
  );
  if (!rows) return null;
  const seen = new Map(rows.map((r) => [r.jour, Number(r.events)]));
  const blind = [];
  for (let d = new Date(`${from}T12:00:00`); ymd(d) < to; d.setDate(d.getDate() + 1)) {
    if ((seen.get(ymd(d)) || 0) < floor) blind.push(ymd(d));
  }
  return { blind };
}

/** Lit un CSV écrit par toCsv (guillemets doublés, virgules et retours à la ligne protégés). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}
