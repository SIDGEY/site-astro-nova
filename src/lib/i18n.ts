/**
 * Le site en deux langues. Le français reste à la racine : aucune URL existante ne bouge.
 * L'anglais s'y ajoute sous /en/, avec ses propres slugs ; une page anglaise nomme sa page
 * française (`translationOf`), ce qui relie les deux pour le hreflang et le sélecteur de langue.
 *
 * Pas d'`i18n` d'Astro : sa gestion de la racine de langue ne sert à rien ici (comme sur
 * beryldesign.fr), et la langue d'une page se lit simplement dans son chemin.
 *
 * Ce module porte la langue d'une URL, les chemins des pages fixes et les libellés de
 * l'interface. Le contenu (pages, articles) vit dans les collections ; les textes des écrans du
 * jeu viennent du jeu lui-même (`lib/game.ts`).
 */

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { name: string; short: string; htmlLang: string; og: string; bcp47: string }> = {
  fr: { name: 'Français', short: 'FR', htmlLang: 'fr', og: 'fr_FR', bcp47: 'fr-FR' },
  en: { name: 'English', short: 'EN', htmlLang: 'en', og: 'en_US', bcp47: 'en-US' },
};

/**
 * La version que Google sert aux langues que le site ne parle pas : l'anglais, compris bien
 * au-delà du français (le jeu lui-même retombe sur l'anglais pour une langue qu'il n'a pas).
 */
export const X_DEFAULT_LOCALE: Locale = 'en';

/** Langue d'une page d'après son chemin : tout ce qui vit sous /en/ est anglais. */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr';
}

export const otherLocale = (locale: Locale): Locale => (locale === 'fr' ? 'en' : 'fr');

/** Les pages fixes du site, par langue. Les slugs anglais sont traduits : la table fait foi. */
export const PATHS = {
  home: { fr: '/', en: '/en/' },
  blog: { fr: '/blog/', en: '/en/blog/' },
  contact: { fr: '/contact/', en: '/en/contact/' },
  faq: { fr: '/faq/', en: '/en/faq/' },
  roadmap: { fr: '/roadmap/', en: '/en/roadmap/' },
  privacy: { fr: '/politique-de-confidentialite/', en: '/en/privacy-policy/' },
  terms: { fr: '/conditions-generales/', en: '/en/terms/' },
  cookies: { fr: '/cookies/', en: '/en/cookies/' },
  legal: { fr: '/mentions-legales/', en: '/en/legal-notice/' },
} satisfies Record<string, Record<Locale, string>>;

export type PathKey = keyof typeof PATHS;

export const pathFor = (key: PathKey, locale: Locale): string => PATHS[key][locale];

/** Une section de la home (`/#planets`), dans la langue : les ancres sont les mêmes partout. */
export const homeSection = (id: string, locale: Locale): string => `${PATHS.home[locale]}#${id}`;

/** URL d'une page de la collection `pages` d'après son id : `faq` → `/faq/`, `en/home` → `/en/`. */
export function pageUrl(id: string): string {
  if (id === 'home') return '/';
  if (id === 'en/home') return '/en/';
  return `/${id}/`;
}

/** URL d'un article dans sa langue. */
export const articleUrl = (slug: string, locale: Locale): string => `${PATHS.blog[locale]}${slug}/`;

/** Les deux versions d'une page, quand elles existent (chemins relatifs à la racine du site). */
export type Alternates = Partial<Record<Locale, string>>;

const UI = {
  // En-tête
  'nav.game': { fr: 'Le jeu', en: 'The game' },
  'nav.dynasties': { fr: 'Dynasties', en: 'Dynasties' },
  'nav.planets': { fr: 'Planètes', en: 'Planets' },
  'nav.resources': { fr: 'Ressources', en: 'Resources' },
  'nav.buildings': { fr: 'Bâtiments', en: 'Buildings' },
  'nav.technologies': { fr: 'Technologies', en: 'Technologies' },
  'nav.defenses': { fr: 'Défenses', en: 'Defenses' },
  'nav.fleet': { fr: 'Vaisseaux', en: 'Ships' },
  'nav.shop': { fr: 'Boutique', en: 'Shop' },
  'nav.gallery': { fr: 'Galerie', en: 'Gallery' },
  'nav.blog': { fr: 'Blog', en: 'Blog' },
  'nav.community': { fr: 'Communauté', en: 'Community' },
  'nav.roadmap': { fr: 'Roadmap', en: 'Roadmap' },
  'nav.join': { fr: 'Rejoindre Dynasty Nova', en: 'Join Dynasty Nova' },
  'nav.openMenu': { fr: 'Ouvrir le menu', en: 'Open the menu' },
  'nav.closeMenu': { fr: 'Fermer le menu', en: 'Close the menu' },
  'nav.homeLink': { fr: 'Dynasty Nova, accueil', en: 'Dynasty Nova, home' },
  'a11y.skip': { fr: 'Passer au contenu principal', en: 'Skip to main content' },

  // Sélecteur de langue. Chaque proposition parle sa propre langue : c'est elle qu'on cherche.
  'lang.label': { fr: 'Langue', en: 'Language' },
  'lang.change': { fr: 'Changer de langue (actuellement en français)', en: 'Change language (currently English)' },
  'lang.suggest': { fr: 'Cette page existe aussi en français.', en: 'This page is also available in English.' },
  'lang.suggestCta': { fr: 'Lire en français', en: 'Read in English' },
  'lang.dismiss': { fr: 'Fermer', en: 'Close' },

  // Pied de page
  'footer.rights': { fr: '© 2026 Dynasty Nova. Tous droits réservés.', en: '© 2026 Dynasty Nova. All rights reserved.' },
  'footer.privacy': { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  'footer.terms': { fr: "Conditions d'utilisation", en: 'Terms of use' },
  'footer.cookies': { fr: 'Cookies', en: 'Cookies' },

  // Fil d'Ariane
  'crumb.home': { fr: 'Accueil', en: 'Home' },
  'crumb.blog': { fr: 'Blog', en: 'Blog' },

  // Appels à jouer, partout où le site renvoie vers le jeu
  'play.free': { fr: 'Jouer gratuitement', en: 'Play for free' },
  'play.highlightFree': { fr: 'Gratuit', en: 'Free' },
  'play.highlightBrowser': { fr: 'Sans téléchargement', en: 'No download' },
  'play.highlightDevices': { fr: 'Mobile et ordinateur', en: 'Mobile and desktop' },

  // Blog
  'blog.title': { fr: 'Blog - Dynasty Nova', en: 'Blog: space strategy guides and game news' },
  'blog.description': {
    fr: 'Guides, actualités et conseils stratégiques pour devenir un maître de la galaxie.',
    en: 'Guides, news and strategy tips to become a master of the galaxy.',
  },
  'blog.heading': { fr: 'Blog Dynasty Nova', en: 'Dynasty Nova blog' },
  'blog.rssDescription': {
    fr: 'Le blog de Dynasty Nova : guides, conseils de stratégie et nouveautés du jeu de stratégie spatiale 4X gratuit par navigateur.',
    en: 'The Dynasty Nova blog: guides, strategy tips and news from the free 4X space strategy browser game.',
  },
  'article.back': { fr: 'Retour', en: 'Back' },
  'article.readTime': { fr: '{n} min de lecture', en: '{n} min read' },
  'article.ctaTitle': { fr: 'Fondez votre empire dans Dynasty Nova', en: 'Build your empire in Dynasty Nova' },
  'article.faq': { fr: 'Questions fréquentes', en: 'Frequently asked questions' },
  'article.moreEyebrow': { fr: "Plus d'articles", en: 'More articles' },
  'article.moreTitle': { fr: 'Vous pourriez également être intéressé', en: 'You might also like' },
  'carousel.page': { fr: 'Page {n}', en: 'Page {n}' },

  // Blocs de la home
  'hero.discover': { fr: 'Découvrir le jeu', en: 'Discover the game' },
  'hero.planetScreen': { fr: "La page Planète du jeu, telle qu'elle s'affiche sur mobile", en: "The game's Planet page, as it looks on mobile" },
  'hero.scroll': { fr: 'Découvrir la suite', en: 'Scroll down' },
  'dynasties.choose': { fr: 'Choisir', en: 'Choose' },
  'benefits.more': { fr: 'Découvrir', en: 'Learn more' },
  'roadmap.more': { fr: 'En savoir plus', en: 'Learn more' },
  'countdown.eyebrow': { fr: 'Lancement officiel', en: 'Official launch' },
  'countdown.when': { fr: '{date} à {time} (heure de Paris)', en: '{date} at {time} (Paris time)' },
  'countdown.days': { fr: 'Jours', en: 'Days' },
  'countdown.hours': { fr: 'Heures', en: 'Hours' },
  'countdown.minutes': { fr: 'Min', en: 'Min' },
  'countdown.seconds': { fr: 'Sec', en: 'Sec' },
  'biome.desert': { fr: 'Désertique', en: 'Desert' },
  'biome.dry': { fr: 'Aride', en: 'Arid' },
  'biome.normal': { fr: 'Tempérée', en: 'Temperate' },
  'biome.jungle': { fr: 'Jungle', en: 'Jungle' },
  'biome.water': { fr: 'Océanique', en: 'Ocean' },
  'biome.ice': { fr: 'Glaciaire', en: 'Ice' },
  'biome.gas': { fr: 'Géante gazeuse', en: 'Gas giant' },
  'biome.moon': { fr: 'Lune', en: 'Moon' },

  // Écrans du jeu reconstruits : ce que lit un lecteur d'écran (les textes des écrans sont ceux du jeu)
  'screen.planet': { fr: 'Écran Planète du jeu', en: "The game's Planet screen" },
  'screen.shopShowcase': { fr: 'Écran Boutique du jeu, la vitrine', en: "The game's Shop screen, showcase" },
  'screen.shopCollection': { fr: "Écran Boutique du jeu, la collection d'avatars", en: "The game's Shop screen, avatar collection" },
  'screen.list': { fr: 'Écran {title} du jeu, onglet {tab}', en: "The game's {title} screen, {tab} tab" },
  'screen.resource': { fr: "Fiche d'une ressource dans le jeu", en: 'A resource sheet in the game' },
  'screen.entity': { fr: 'Fiche {name} dans le jeu', en: 'The {name} sheet in the game' },

  // Page introuvable
  'notFound.title': { fr: 'Page introuvable', en: 'Page not found' },
  'notFound.description': {
    fr: "Désolé, la page que vous recherchez n'existe pas ou a été déplacée.",
    en: "Sorry, the page you're looking for doesn't exist or has moved.",
  },
  'notFound.oops': { fr: 'Oups !', en: 'Oops!' },
  'notFound.lost': { fr: 'Donnée égarée.', en: 'Data lost in space.' },
  'notFound.text': {
    fr: "La page que vous cherchez semble avoir disparu des radars. Nos algorithmes n'ont pas réussi à la localiser.",
    en: "The page you're looking for seems to have vanished from our radar. Our algorithms couldn't track it down.",
  },
  'notFound.home': { fr: "Retour à l'accueil", en: 'Back to home' },
  'notFound.contact': { fr: 'Contacter le support', en: 'Contact support' },
} satisfies Record<string, Record<Locale, string>>;

export type UiKey = keyof typeof UI;

/** Un libellé de l'interface ; `{n}` et consorts sont remplacés par `vars`. */
export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  const text: string = UI[key][locale];
  return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match)) : text;
}

/** Une citation dans les guillemets de la langue : « … » en français, “…” en anglais. */
export const quote = (text: string, locale: Locale): string => (locale === 'fr' ? `« ${text} »` : `“${text}”`);

/** Une date longue : « 6 octobre 2026 », "October 6, 2026". */
export const formatDate = (date: Date, locale: Locale): string =>
  date.toLocaleDateString(LOCALE_META[locale].bcp47, { day: 'numeric', month: 'long', year: 'numeric' });
