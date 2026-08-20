#!/usr/bin/env node
/**
 * Vidiome — étape PUBLICATION, adaptée au schéma de ce repo (adapté du script du
 * même nom dans le repo beryldesign : corps HTML + taxonomie riche là-bas, ici
 * Markdown simple + le schéma plat de `articlesCollection`, src/content.config.ts).
 *
 * Assemble un fichier .md conforme au schéma Astro à partir d'une DÉFINITION
 * d'article déjà rédigé (title/description/tags/bodyMarkdown…) : frontmatter +
 * corps + bloc "Sources" (vidéos YouTube d'origine + mention Vidiome).
 *
 * NE génère PAS le contenu : il met en forme un contenu déjà rédigé. Écrit un
 * brouillon (draft:true) par défaut -> relecture humaine avant publication.
 *
 * Usage :
 *   node scripts/vidiome-publish.mjs --article article.json
 *   node scripts/vidiome-publish.mjs --article article.json --cache .vidiome-cache/jeu-navigateur-2026
 *   node scripts/vidiome-publish.mjs --article article.json --dry
 *   node scripts/vidiome-publish.mjs --article article.json --force   # écrase un slug existant
 *
 * Forme du JSON --article (schéma = articlesCollection, src/content.config.ts) :
 *   {
 *     "title":        "Titre H1 (obligatoire)",
 *     "description":  "Meta description (obligatoire)",
 *     "slug":          "slug-kebab-case (obligatoire, = nom de fichier)",
 *     "author":        "Guillaume Hambourger (défaut)",
 *     "coAuthors":     [],
 *     "tags":          ["Gameplay", "..."],
 *     "icon":          "ph-rocket-launch",              // optionnel — voir src/utils/articleIcon.ts
 *     "image":         "/uploads/blog/....avif",         // optionnel — sinon fallback cover-{1..27}.webp existant
 *     "date":          "2026-08-20",                      // optionnel (défaut = aujourd'hui)
 *     "draft":         true,                              // optionnel (défaut = true)
 *     "bodyMarkdown":  "## Titre\n\nTexte...",            // obligatoire, Markdown simple (pas de HTML)
 *     "faq":           [{ "question": "...", "answer": "..." }],  // 3-4 items recommandés (voir SKILL.md, GEO)
 *     "sources":       [{ "url": "https://youtube.com/watch?v=..", "title": ".." }]  // sinon lues depuis --cache
 *   }
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ARTICLES_DIR = 'src/content/articles';

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const o = { article: null, body: null, cache: null, dry: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') o.dry = true;
    else if (a === '--force') o.force = true;
    else if (a === '--article') o.article = argv[++i];
    else if (a === '--body') o.body = argv[++i]; // fichier .md -> remplace art.bodyMarkdown
    else if (a === '--cache') o.cache = argv[++i];
    else fail(`Option inconnue : ${a}`);
  }
  if (!o.article) fail('--article <path.json> requis.');
  return o;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Frontmatter simple, à la main : le schéma de ce repo n'a qu'un seul champ imbriqué
// (faq), pas besoin d'une dépendance YAML complète pour ça.
function yamlString(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function yamlFaqBlock(faq) {
  if (!faq?.length) return null;
  return [
    'faq:',
    ...faq.map(
      (item) => `  - question: ${yamlString(item.question)}\n    answer: ${yamlString(item.answer)}`
    ),
  ].join('\n');
}
function yamlStringArray(arr) {
  return `[${(arr || []).map(yamlString).join(', ')}]`;
}

function buildSourcesMarkdown(sources) {
  if (!sources?.length) return '';
  const intro = sources.length > 1
    ? "Cet article s'appuie sur les vidéos suivantes :"
    : "Cet article s'appuie sur la vidéo suivante :";
  const list = sources.map((s) => `- [${s.title || s.url}](${s.url})`).join('\n');
  return `\n\n## Sources\n\n${intro}\n\n${list}\n\n*Articles générés via [Vidiome](https://vidiome.com/), puis fusionnés et enrichis.*`;
}

async function deriveSourcesFromCache(cacheDir) {
  try {
    const idx = JSON.parse(await fs.readFile(path.join(cacheDir, '_index.json'), 'utf8'));
    return (idx.items || [])
      .filter((it) => it.ok)
      .map((it) => ({ url: it.url, title: it.title }));
  } catch {
    return [];
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const art = JSON.parse(await fs.readFile(opts.article, 'utf8'));
  if (opts.body) art.bodyMarkdown = await fs.readFile(opts.body, 'utf8');

  for (const f of ['title', 'description', 'slug', 'bodyMarkdown']) {
    if (!art[f] || !String(art[f]).trim()) fail(`Champ obligatoire manquant/vide : "${f}".`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(art.slug)) fail(`slug invalide (kebab-case attendu) : "${art.slug}".`);

  const outFile = path.join(ARTICLES_DIR, `${art.slug}.md`);
  try {
    await fs.access(outFile);
    if (!opts.force) fail(`${outFile} existe déjà. Ajoute --force pour écraser (ou change le slug).`);
  } catch {
    /* n'existe pas -> OK */
  }

  let sources = art.sources;
  if ((!sources || !sources.length) && opts.cache) sources = await deriveSourcesFromCache(opts.cache);

  const now = new Date();
  const date = art.date || ymd(now);
  const draft = art.draft === undefined ? true : !!art.draft;

  const fmLines = [
    `title: ${yamlString(art.title)}`,
    `date: ${date}`,
    `description: ${yamlString(art.description)}`,
    `author: ${yamlString(art.author || 'Guillaume Hambourger')}`,
    `coAuthors: ${yamlStringArray(art.coAuthors)}`,
    `tags: ${yamlStringArray(art.tags)}`,
    `draft: ${draft}`,
  ];
  if (art.image) fmLines.push(`image: ${yamlString(art.image)}`);
  if (art.icon) fmLines.push(`icon: ${yamlString(art.icon)}`);
  const faqBlock = yamlFaqBlock(art.faq);
  if (faqBlock) fmLines.push(faqBlock);

  const body = art.bodyMarkdown.trim() + (sources?.length ? buildSourcesMarkdown(sources) : '');
  const md = `---\n${fmLines.join('\n')}\n---\n\n${body}\n`;

  if (opts.dry) {
    console.log('\n──────── DRY-RUN (aucune écriture) ────────\n');
    console.log(`Fichier cible : ${outFile}`);
    console.log(`\n--- frontmatter ---\n${fmLines.join('\n')}`);
    console.log(`\n--- corps (aperçu 600c) ---\n${body.slice(0, 600)}${body.length > 600 ? '…' : ''}`);
    console.log(`\nSources : ${sources?.length || 0} | corps total : ${body.length} caractères\n`);
    return;
  }

  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.writeFile(outFile, md);
  console.log(`\n✅ Brouillon écrit : ${outFile}`);
  console.log(`   draft=${draft} | tags=${(art.tags || []).join(', ') || '(aucun)'} | sources=${sources?.length || 0} | faq=${art.faq?.length || 0}`);
  if (!art.faq?.length) console.log('   ⚠️  Pas de FAQ — voir docs/geo-guidelines.md, 3-4 Q/R recommandées pour la citabilité GEO.');
  if (!art.image) console.log('   ℹ️  Pas de champ image — le fallback cover-{1..27}.webp existant s\'appliquera automatiquement.');
  console.log("   → Relire contre docs/charte_editoriale.md §11, puis npm run build, puis passer draft:false pour publier.\n");
}

main().catch((e) => fail(e.stack || e.message));
