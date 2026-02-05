import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_URL } from '../lib/seo';

export async function GET(context: any) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  
  return rss({
    title: SITE_NAME,
    description: 'Expertise IA & Data pour le Mid-Market',
    site: context.site || SITE_URL,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description,
      link: `/blog/${article.slug}/`,
    })),
    customData: `<language>fr-fr</language>`,
  });
}
