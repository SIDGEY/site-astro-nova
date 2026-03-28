import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://dynastynova.com/',
    integrations: [sitemap()],
    publicDir: './public',
    vite: {
        plugins: [tailwindcss()],
    },
});
