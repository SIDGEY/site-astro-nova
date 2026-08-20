#!/usr/bin/env node
/**
 * Récupère les PR mergées FRAÎCHES sur les repos du jeu (frontend + backend) via
 * `gh pr list`, pour servir de matière première à des articles "dev-diary" ancrés
 * dans de vraies fonctionnalités livrées plutôt que du remplissage générique.
 * Écrit dans .game-activity-cache/ (gitignored), un snapshot horodaté.
 *
 * Prérequis : `gh` authentifié avec accès en lecture aux deux repos (pas besoin de
 * clone local, --repo suffit).
 *
 * Usage :
 *   node scripts/game-activity-fetch.mjs                 # 40 dernières PR par repo (défaut)
 *   node scripts/game-activity-fetch.mjs --limit 80
 *   node scripts/game-activity-fetch.mjs --out .game-activity-cache
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPOS = ["Dynasty-Nova/Frontend", "Dynasty-Nova/Backend"];

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const o = { limit: 40, out: ".game-activity-cache" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") o.limit = Number(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else fail(`Option inconnue : ${argv[i]}`);
  }
  return o;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchRepoPRs(repo, limit) {
  try {
    const { stdout } = await execFileAsync("gh", [
      "pr",
      "list",
      "--repo",
      repo,
      "--state",
      "merged",
      "--limit",
      String(limit),
      "--json",
      "number,title,url,mergedAt,labels,body",
    ]);
    const prs = JSON.parse(stdout);
    return prs.map((pr) => ({
      repo,
      number: pr.number,
      title: pr.title,
      url: pr.url,
      mergedAt: pr.mergedAt,
      labels: (pr.labels || []).map((l) => l.name),
      body: pr.body || "",
    }));
  } catch (e) {
    fail(
      `Échec de récupération des PR pour ${repo} : ${e.stderr || e.message}\n` +
        `   Vérifie que \`gh\` est authentifié et a accès à ce repo (\`gh repo view ${repo}\`).`
    );
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  console.log(`\n▶ Activité de dev — ${REPOS.join(", ")} | ${opts.limit} PR max par repo`);

  const results = await Promise.all(REPOS.map((repo) => fetchRepoPRs(repo, opts.limit)));
  const all = results.flat().sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));

  const dateStamp = ymd(new Date());
  const dir = opts.out;
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `game-activity-${dateStamp}.json`);
  await fs.writeFile(file, JSON.stringify(all, null, 2) + "\n");

  console.log(`✅ ${all.length} PR mergées (${REPOS.length} repos) -> ${file}\n`);
}

main().catch((e) => fail(e.stack || e.message));
