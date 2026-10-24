import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Date de publication de chaque article (champ `date` du frontmatter), pour le <lastmod> du sitemap.
const ARTICLES_DIR = path.resolve('src/content/articles');
const articleDates = new Map(
    fs
        .readdirSync(ARTICLES_DIR)
        .filter((file) => file.endsWith('.md'))
        .map((file) => {
            const frontmatter = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
            const date = frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
            return [`/blog/${file.slice(0, -3)}/`, date];
        })
        .filter(([, date]) => date),
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
            // Pages en noindex (champ `index: false` des pages, sommaire /pages/, styleguide) : hors sitemap.
            filter: (page) =>
                !['/pages/', '/conditions-generales/', '/politique-de-confidentialite/', '/styleguide/', ...noindexPages].some(
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
