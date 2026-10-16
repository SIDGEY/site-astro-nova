#!/usr/bin/env node
/**
 * Récupère le comportement des visiteurs de dynastynova.com dans PostHog (requêtes HogQL
 * via l'API) : ce que GA4 et GSC ne donnent pas, la conversion vers le jeu PAR PAGE et PAR
 * SOURCE (`play_click`, voir src/layouts/BaseLayout.astro) jusqu'à l'inscription dans le jeu
 * (`auth_signup_submitted`), la profondeur de lecture, les frictions (rage/dead clicks) et les
 * Web Vitals. Écrit dans .posthog-cache/ (gitignored).
 *
 * Site et jeu envoient dans le même projet (218176) avec un cookie posé sur .dynastynova.com :
 * le visiteur du blog garde son distinct_id jusqu'à l'inscription, qui part avant
 * l'identification. C'est ce distinct_id qui relie une page lue à une inscription.
 *
 * Les chemins de page sont les mêmes que `pagePath` de GA4 et que l'URL de GSC, sans le
 * domaine : la jointure se fait sur le chemin (GSC requête -> page, GA4 vues -> page,
 * PostHog page -> départ vers le jeu).
 *
 * Prérequis (une seule fois, dans PostHog) :
 *   1. Settings > User > Personal API keys : créer une clé avec le scope « Query: read »
 *      limitée au projet Dynasty Nova.
 *   2. Noter l'ID numérique du projet (Settings > Project, ou l'URL /project/<id>).
 *
 * Variables d'env requises (dans .env, jamais commité) :
 *   POSTHOG_PERSONAL_API_KEY=phx_...
 *   POSTHOG_PROJECT_ID=218176     # projet commun site + jeu
 *   POSTHOG_API_HOST=https://eu.posthog.com     # optionnel, https://us.posthog.com pour un projet US
 *
 * Usage :
 *   node scripts/posthog-fetch.mjs                 # 30 derniers jours (défaut)
 *   node scripts/posthog-fetch.mjs --days 90
 *   node scripts/posthog-fetch.mjs --host dynastynova.com --out .posthog-cache
 */

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
  const o = { days: 30, out: ".posthog-cache", host: "dynastynova.com" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") o.days = Number(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else if (argv[i] === "--host") o.host = argv[++i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  if (!Number.isInteger(o.days) || o.days < 1) fail("--days attend un entier positif.");
  // Interpolé dans le HogQL : on n'accepte qu'un nom d'hôte.
  if (!/^[a-z0-9.-]+$/i.test(o.host)) fail(`--host invalide : ${o.host}`);
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

const pct = (part, total) => (total ? ((Number(part) / Number(total)) * 100).toFixed(2) : "0.00");
const num = (v, digits = 0) => (v === null || v === undefined || Number.isNaN(Number(v)) ? "" : Number(v).toFixed(digits));

async function hogql(apiHost, projectId, apiKey, query) {
  const res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query }, name: "posthog-fetch" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${body.detail || body.error || JSON.stringify(body).slice(0, 300)}`);
  }
  return body.results || [];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const apiKey = await loadEnvVar("POSTHOG_PERSONAL_API_KEY");
  const projectId = await loadEnvVar("POSTHOG_PROJECT_ID");
  const apiHost = ((await loadEnvVar("POSTHOG_API_HOST")) || "https://eu.posthog.com").replace(/\/$/, "");
  if (!apiKey) fail("POSTHOG_PERSONAL_API_KEY manquante dans .env (clé personnelle phx_…, scope Query: read).");
  if (!projectId) fail("POSTHOG_PROJECT_ID manquante dans .env (ID numérique du projet PostHog).");

  // Filtre commun : la période et le site seul, au cas où le jeu envoie dans le même projet.
  const period = `timestamp > now() - INTERVAL ${opts.days} DAY`;
  const scope = `${period} AND properties.$host = '${opts.host}'`;
  // Visiteurs qui ont soumis une inscription dans le jeu sur la période, quel que soit l'hôte.
  const signedUp = `SELECT DISTINCT distinct_id FROM events WHERE ${period} AND event = 'auth_signup_submitted'`;

  console.log(`\n▶ PostHog fetch — projet ${projectId} | ${opts.host} | ${opts.days} derniers jours`);

  const queries = {
    // Vues et visiteurs par page, départs vers le jeu depuis cette page, et lecteurs de la page
    // qui se sont inscrits sur la période (pas forcément juste après : c'est une contribution).
    pages: `
      SELECT
        properties.$pathname AS page,
        countIf(event = '$pageview') AS views,
        uniqIf(distinct_id, event = '$pageview') AS visitors,
        countIf(event = 'play_click') AS play_clicks,
        uniqIf(distinct_id, event = 'play_click') AS play_visitors,
        uniqIf(distinct_id, event = '$pageview' AND distinct_id IN (${signedUp})) AS signup_visitors
      FROM events
      WHERE ${scope} AND event IN ('$pageview', 'play_click')
      GROUP BY page
      HAVING views > 0
      ORDER BY views DESC
      LIMIT 300`,
    // Lecture réelle : $pageleave porte la durée et le scroll max de la page quittée.
    reading: `
      SELECT
        properties.$prev_pageview_pathname AS page,
        count() AS leaves,
        median(toFloat(properties.$prev_pageview_duration)) AS median_duration,
        avg(toFloat(properties.$prev_pageview_max_content_percentage)) AS avg_scroll,
        countIf(toFloat(properties.$prev_pageview_max_content_percentage) >= 0.9) AS read_to_end
      FROM events
      WHERE ${scope} AND event = '$pageleave'
      GROUP BY page
      ORDER BY leaves DESC
      LIMIT 300`,
    // Une ligne par session entrée sur le site : page d'entrée, origine, appareil, départ vers le
    // jeu, et inscription dans la même session (le cookie partagé garde la session d'un
    // sous-domaine à l'autre). Les agrégations suivantes (entrées, sources, appareils) en partent.
    sessions: `
      SELECT
        argMinIf(properties.$pathname, timestamp, event = '$pageview') AS entry,
        argMinIf(properties.$referring_domain, timestamp, event = '$pageview') AS referrer,
        argMinIf(properties.utm_source, timestamp, event = '$pageview') AS utm_source,
        argMinIf(properties.utm_medium, timestamp, event = '$pageview') AS utm_medium,
        argMinIf(properties.utm_campaign, timestamp, event = '$pageview') AS utm_campaign,
        argMinIf(properties.$device_type, timestamp, event = '$pageview') AS device,
        countIf(event = '$pageview' AND properties.$host = '${opts.host}') AS pageviews,
        countIf(event = 'play_click') > 0 AS played,
        countIf(event = 'auth_signup_submitted') > 0 AS signed_up,
        argMinIf(properties.$host, timestamp, event = '$pageview') AS entry_host
      FROM events
      WHERE ${period} AND event IN ('$pageview', 'play_click', 'auth_signup_submitted')
        AND properties.$session_id IS NOT NULL
      GROUP BY properties.$session_id
      HAVING entry_host = '${opts.host}' AND pageviews > 0
      LIMIT 100000`,
    // Frictions : clics répétés de rage et clics sans effet, par page et élément visé.
    frictions: `
      SELECT
        event,
        properties.$pathname AS page,
        substring(coalesce(elements_chain_texts[1], ''), 1, 80) AS element_text,
        count() AS occurrences,
        uniq(distinct_id) AS visitors
      FROM events
      WHERE ${scope} AND event IN ('$rageclick', '$dead_click')
      GROUP BY event, page, element_text
      ORDER BY occurrences DESC
      LIMIT 100`,
    // Web Vitals au 75e centile, la mesure retenue par Google pour le classement.
    vitals: `
      SELECT
        properties.$pathname AS page,
        count() AS samples,
        quantile(0.75)(toFloat(properties.$web_vitals_LCP_value)) AS lcp,
        quantile(0.75)(toFloat(properties.$web_vitals_INP_value)) AS inp,
        quantile(0.75)(toFloat(properties.$web_vitals_CLS_value)) AS cls
      FROM events
      WHERE ${scope} AND event = '$web_vitals'
      GROUP BY page
      ORDER BY samples DESC
      LIMIT 100`,
    events: `
      SELECT event, count() AS occurrences, uniq(distinct_id) AS visitors
      FROM events
      WHERE ${scope}
      GROUP BY event
      ORDER BY occurrences DESC
      LIMIT 50`,
  };

  // Chaque requête échoue seule : une propriété absente (Web Vitals désactivés côté projet…)
  // laisse un CSV vide plutôt que de priver des autres. Tout en échec = problème d'accès.
  const errors = [];
  const entries = await Promise.all(
    Object.entries(queries).map(async ([name, q]) => {
      try {
        return [name, await hogql(apiHost, projectId, apiKey, q)];
      } catch (e) {
        errors.push(`${name} : ${e.message}`);
        return [name, []];
      }
    })
  );
  const results = Object.fromEntries(entries);
  if (errors.length === entries.length) {
    fail(
      `Requêtes PostHog échouées : ${errors[0]}\n` +
        `   401/403 fréquent -> clé personnelle invalide ou sans le scope « Query: read » sur ce projet.\n` +
        `   404 fréquent -> POSTHOG_PROJECT_ID erroné, ou POSTHOG_API_HOST ne correspond pas à la région (eu/us).`
    );
  }
  for (const err of errors) console.warn(`⚠️  ${err}`);

  const reading = new Map(results.reading.map((r) => [r[0], r]));
  const pagesCsv = toCsv(
    [
      "Page",
      "Vues",
      "Visiteurs",
      "Départs vers le jeu",
      "Visiteurs partis vers le jeu",
      "Conversion visiteurs (%)",
      "Lecteurs inscrits ensuite",
      "Inscription lecteurs (%)",
      "Durée médiane (s)",
      "Scroll moyen (%)",
      "Lus jusqu'au bout (%)",
    ],
    results.pages.map(([page, views, visitors, clicks, playVisitors, signupVisitors]) => {
      const r = reading.get(page);
      return [
        page,
        views,
        visitors,
        clicks,
        playVisitors,
        pct(playVisitors, visitors),
        signupVisitors,
        pct(signupVisitors, visitors),
        r ? num(r[2], 1) : "",
        r ? num(Number(r[3]) * 100, 1) : "",
        r ? pct(r[4], r[1]) : "",
      ];
    })
  );

  // Agrège la table des sessions selon une clé, avec le taux de départ vers le jeu.
  const rollup = (keyOf) => {
    const acc = new Map();
    for (const s of results.sessions) {
      const key = keyOf(s);
      const row = acc.get(key) || { sessions: 0, played: 0, signedUp: 0, pageviews: 0 };
      row.sessions += 1;
      row.played += s[7] ? 1 : 0;
      row.signedUp += s[8] ? 1 : 0;
      row.pageviews += Number(s[6]);
      acc.set(key, row);
    }
    return [...acc.entries()].sort((a, b) => b[1].sessions - a[1].sessions);
  };
  const sessionCols = [
    "Sessions",
    "Sessions parties vers le jeu",
    "Conversion (%)",
    "Sessions avec inscription",
    "Inscription (%)",
    "Pages par session",
  ];
  const sessionVals = (r) => [
    r.sessions,
    r.played,
    pct(r.played, r.sessions),
    r.signedUp,
    pct(r.signedUp, r.sessions),
    (r.pageviews / r.sessions).toFixed(2),
  ];

  const entriesCsv = toCsv(
    ["Page d'entrée", ...sessionCols],
    rollup((s) => s[0] || "(inconnue)").map(([k, r]) => [k, ...sessionVals(r)])
  );
  const sourcesCsv = toCsv(
    ["Source", "Support", "Campagne", ...sessionCols],
    rollup((s) => {
      const source = s[2] || (s[1] && s[1] !== "$direct" ? s[1] : "(direct)");
      return JSON.stringify([source, s[3] || (s[2] ? "" : s[1] && s[1] !== "$direct" ? "referral" : "(none)"), s[4] || ""]);
    }).map(([k, r]) => [...JSON.parse(k), ...sessionVals(r)])
  );
  const devicesCsv = toCsv(
    ["Appareil", ...sessionCols],
    rollup((s) => s[5] || "(inconnu)").map(([k, r]) => [k, ...sessionVals(r)])
  );
  const frictionsCsv = toCsv(
    ["Type", "Page", "Élément (texte)", "Occurrences", "Visiteurs"],
    results.frictions.map(([event, page, text, n, v]) => [event === "$rageclick" ? "rage click" : "dead click", page, text, n, v])
  );
  const vitalsCsv = toCsv(
    ["Page", "Mesures", "LCP p75 (ms)", "INP p75 (ms)", "CLS p75"],
    results.vitals.map(([page, n, lcp, inp, cls]) => [page, n, num(lcp), num(inp), num(cls, 3)])
  );
  const eventsCsv = toCsv(["Événement", "Occurrences", "Visiteurs"], results.events);

  const dir = path.join(opts.out, `${opts.host}-PostHog-${ymd(new Date())}`);
  await fs.mkdir(dir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(dir, "Pages.csv"), pagesCsv),
    fs.writeFile(path.join(dir, "Entrees.csv"), entriesCsv),
    fs.writeFile(path.join(dir, "Sources.csv"), sourcesCsv),
    fs.writeFile(path.join(dir, "Appareils.csv"), devicesCsv),
    fs.writeFile(path.join(dir, "Frictions.csv"), frictionsCsv),
    fs.writeFile(path.join(dir, "Vitals.csv"), vitalsCsv),
    fs.writeFile(path.join(dir, "Evenements.csv"), eventsCsv),
  ]);

  const played = results.sessions.filter((s) => s[7]).length;
  const signedUpSessions = results.sessions.filter((s) => s[8]).length;
  console.log(
    `✅ ${results.pages.length} pages, ${results.sessions.length} sessions (${played} parties vers le jeu, ` +
      `${signedUpSessions} avec inscription), ` +
      `${results.frictions.length} frictions -> ${dir}\n`
  );
}

main().catch((e) => fail(e.stack || e.message));
