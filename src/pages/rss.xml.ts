import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL } from '../lib/seo';

export async function GET(context: any) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  
  return rss({
    title: SITE_NAME,
    description: 'Le blog de Dynasty Nova : guides, conseils de stratégie et nouveautés du jeu de stratégie spatiale 4X gratuit par navigateur.',
    site: context.site || SITE_URL,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description,
      link: `/blog/${article.id}/`,
    })),
    customData: `<language>fr-fr</language>`,
  });
}
