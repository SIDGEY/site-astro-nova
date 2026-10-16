import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://dynastynova.com/',
    integrations: [
        sitemap({
            // Pages en noindex (champ `index: false` des pages, sommaire /pages/) : hors sitemap.
            filter: (page) =>
                !['/pages/', '/conditions-generales/', '/politique-de-confidentialite/'].some((path) =>
                    page.endsWith(path),
                ),
        }),
    ],
    publicDir: './public',
    vite: {
        plugins: [tailwindcss()],
    },
});
