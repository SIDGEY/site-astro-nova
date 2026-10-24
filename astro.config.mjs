import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Date de publication de chaque article (champ `date` du frontmatter), pour le <lastmod> du sitemap.
// Un article anglais n'a pas de date à lui : il prend celle de l'article qu'il traduit (`translationOf`).
const ARTICLES_DIR = path.resolve('src/content/articles');
const ARTICLES_EN_DIR = path.resolve('src/content/articles-en');
const markdownFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith('.md')) : []);
const frontmatterField = (dir, file, field) =>
    fs.readFileSync(path.join(dir, file), 'utf8').match(new RegExp(`^${field}:\\s*["']?([^"'\\n]+)`, 'm'))?.[1].trim();
const frenchDates = new Map(
    markdownFiles(ARTICLES_DIR).map((file) => [file.slice(0, -3), frontmatterField(ARTICLES_DIR, file, 'date')?.slice(0, 10)]),
);
const articleDates = new Map(
    [
        ...[...frenchDates].map(([slug, date]) => [`/blog/${slug}/`, date]),
        ...markdownFiles(ARTICLES_EN_DIR).map((file) => [
            `/en/blog/${file.slice(0, -3)}/`,
            frenchDates.get(frontmatterField(ARTICLES_EN_DIR, file, 'translationOf')),
        ]),
    ].filter(([, date]) => date && /^\d{4}-\d{2}-\d{2}$/.test(date)),
);

// Pages marquées `index: false` dans leur frontmatter (pages légales, pages d'atterrissage des
// campagnes payantes) : servies en noindex, donc absentes du sitemap.
const PAGES_DIR = path.resolve('src/content/pages');
const noindexPages = fs
    .readdirSync(PAGES_DIR, { recursive: true })
    .filter((file) => file.endsWith('.md'))
    .filter((file) => /^index:\s*false\s*$/m.test(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8')))
    .map((file) => `/${file.slice(0, -3).split(path.sep).join('/')}/`);

// https://astro.build/config
export default defineConfig({
    site: 'https://dynastynova.com/',
    integrations: [
        sitemap({
            // Pages en noindex (champ `index: false` des pages, sommaire /pages/, styleguide, page
            // introuvable anglaise) : hors sitemap.
            filter: (page) =>
                !['/pages/', '/conditions-generales/', '/politique-de-confidentialite/', '/styleguide/', '/en/404/', ...noindexPages].some(
                    (path) => page.endsWith(path),
                ),
            serialize: (item) => {
                const lastmod = articleDates.get(new URL(item.url).pathname);
                return lastmod ? { ...item, lastmod } : item;
            },
        }),
    ],
    publicDir: './public',
    vite: {
        plugins: [tailwindcss()],
    },
});
