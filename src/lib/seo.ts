/**
 * SEO Utilities for Atecna 2026
 */
import { LOCALE_META, LOCALES, type Locale } from './i18n';

export const SITE_URL = 'https://dynastynova.com';
export const SITE_NAME = 'Dynasty Nova - Jeu de stratégie spatiale 4X';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

/** Nom du site et description par défaut, par langue. */
export const SITE_NAMES: Record<Locale, string> = {
  fr: SITE_NAME,
  en: 'Dynasty Nova - 4X Space Strategy Game',
};
export const DEFAULT_DESCRIPTIONS: Record<Locale, string> = {
  fr: "Conquérez l'univers dans ce jeu de stratégie 4X spatial immersif. Explorez, colonisez et dominez les étoiles.",
  en: 'Conquer the universe in this immersive 4X space strategy game. Explore, colonize and rule the stars.',
};

/**
 * Construct a canonical URL
 */
export function getCanonicalURL(path: string): string {
  const base = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Format page title
 */
export function formatTitle(title: string): string {
  if (title === SITE_NAME) return SITE_NAME;
  return `${title} | Dynasty Nova`;
}

/**
 * JSON-LD Schema Generators
 */

export function getOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": "Dynasty Nova",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/logo-horizontal.svg`,
      "width": "180",
      "height": "60"
    },
    "sameAs": [
      "https://twitter.com/dynastynova",
      "https://discord.gg/dVXdVqw5d5"
    ]
  };
}

export function getWebSiteSchema(locale: Locale = 'fr') {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAMES[locale],
    "publisher": { "@id": `${SITE_URL}/#organization` },
    // Les langues du site, pas celle de la page : chaque WebPage porte la sienne.
    "inLanguage": LOCALES.map((l) => LOCALE_META[l].bcp47)
  };
}

export function getWebPageSchema(title: string, description: string, url: string, locale: Locale = 'fr') {
  return {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    "url": url,
    "name": title,
    "description": description,
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "breadcrumb": { "@id": `${url}/#breadcrumb` },
    "inLanguage": LOCALE_META[locale].bcp47
  };
}

export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${items[items.length - 1].item}/#breadcrumb`,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}

const VIDEO_GAME_TEXT: Record<Locale, { description: string; operatingSystem: string }> = {
  fr: {
    description: "Jeu de stratégie spatiale 4X par navigateur : gérez vos ressources, développez vos technologies, construisez votre flotte et conquérez la galaxie.",
    operatingSystem: "Tous (navigateur web)",
  },
  en: {
    description: "A 4X space strategy browser game: manage your resources, research technologies, build your fleet and conquer the galaxy.",
    operatingSystem: "Any (web browser)",
  },
};

export function getVideoGameSchema(locale: Locale = 'fr') {
  return {
    "@type": "VideoGame",
    "@id": `${SITE_URL}/#videogame`,
    "name": "Dynasty Nova",
    "description": VIDEO_GAME_TEXT[locale].description,
    "url": SITE_URL,
    "genre": ["Strategy", "4X", "Space"],
    "gamePlatform": "Web Browser",
    "applicationCategory": "Game",
    "operatingSystem": VIDEO_GAME_TEXT[locale].operatingSystem,
    // Les langues du jeu (`SUPPORTED_LANGUAGES` du Frontend), pas celles du site.
    "inLanguage": ["en", "fr", "es"],
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "image": `${SITE_URL}${DEFAULT_OG_IMAGE}`
  };
}

export function getFaqSchema(items: { question: string; answer: string }[], url: string) {
  return {
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  author: string;
  locale?: Locale;
}) {
  return {
    "@type": "Article",
    "@id": `${article.url}/#article`,
    "inLanguage": LOCALE_META[article.locale ?? 'fr'].bcp47,
    "headline": article.title,
    "description": article.description,
    "image": article.image ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`) : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    "datePublished": article.datePublished.toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "mainEntityOfPage": { "@id": `${article.url}/#webpage` }
  };
}
