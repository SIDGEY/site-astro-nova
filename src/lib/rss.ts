import rss from '@astrojs/rss';
import { getArticles } from './articles';
import { LOCALE_META, t, type Locale } from './i18n';
import { SITE_NAMES, SITE_URL } from './seo';

/** Le flux RSS des articles d'une langue : /rss.xml (français), /en/rss.xml (anglais). */
export async function articlesFeed(locale: Locale, site: URL | undefined) {
  const articles = await getArticles(locale);

  return rss({
    title: SITE_NAMES[locale],
    description: t(locale, 'blog.rssDescription'),
    site: site || SITE_URL,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: article.date,
      description: article.description,
      link: article.url,
    })),
    customData: `<language>${LOCALE_META[locale].bcp47.toLowerCase()}</language>`,
  });
}
