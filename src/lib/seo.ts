/**
 * SEO Utilities for Atecna 2026
 */

export const SITE_URL = 'https://play-astronova.com';
export const SITE_NAME = 'Astro Nova - Jeu de stratégie spatiale 4X';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

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
  return `${title} | Astro Nova`;
}

/**
 * JSON-LD Schema Generators
 */

export function getOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": "Astro Nova",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/logo-horizontal.svg`,
      "width": "180",
      "height": "60"
    },
    "sameAs": [
      "https://twitter.com/astronova_game",
      "https://discord.gg/astronova"
    ]
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "inLanguage": "fr"
  };
}

export function getWebPageSchema(title: string, description: string, url: string) {
  return {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    "url": url,
    "name": title,
    "description": description,
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "breadcrumb": { "@id": `${url}/#breadcrumb` },
    "inLanguage": "fr"
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

export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  author: string;
}) {
  return {
    "@type": "Article",
    "@id": `${article.url}/#article`,
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
