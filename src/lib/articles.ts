/**
 * Les articles du blog d'une langue, sous une seule forme, pour toutes les pages qui les listent
 * ou les affichent (blog, article, actualités de la home, roadmap, flux RSS).
 *
 * Un article anglais (`src/content/articles-en/`) n'a que son texte : date, auteur, tags, cover,
 * icône et statut de brouillon sont ceux de l'article français qu'il traduit (`translationOf`). Il
 * paraît donc le jour où le français paraît, ni avant ni sans lui, et le skill `publication`
 * n'a rien de plus à faire.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { articleUrl, type Locale } from './i18n';

export interface Article {
  /** Slug d'URL, dans la langue de l'article. */
  slug: string;
  locale: Locale;
  url: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  tags: string[];
  icon?: string;
  /** La cover de l'article français, ou celle que son slug lui attribue : la même dans les deux langues. */
  image: string;
  faq?: { question: string; answer: string }[];
  /** L'entrée à rendre (`render()`), dans la langue de l'article. */
  entry: CollectionEntry<'articles'> | CollectionEntry<'articlesEn'>;
  /** L'URL du même article dans l'autre langue, quand il y est publié. */
  alternate?: string;
}

const COVERS = Array.from({ length: 27 }, (_, i) => `/uploads/blog/covers/cover-${i + 1}.webp`);

/** Cover de repli d'un article sans image, tirée de son slug français. */
export function fallbackCover(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return COVERS[hash % COVERS.length];
}

/** Les articles publiés d'une langue, du plus récent au plus ancien. */
export async function getArticles(locale: Locale): Promise<Article[]> {
  const french = await getCollection('articles');
  const english = await getCollection('articlesEn');
  const frenchBySlug = new Map(french.map((entry) => [entry.id, entry]));

  for (const entry of english) {
    if (!frenchBySlug.has(entry.data.translationOf)) {
      throw new Error(
        `Article anglais « ${entry.id} » : translationOf « ${entry.data.translationOf} » ne correspond à aucun article de src/content/articles/.`,
      );
    }
  }

  const isPublished = (entry: CollectionEntry<'articles'>) => entry.data.draft !== true;
  const translations = english.filter(
    (entry) => entry.data.draft !== true && isPublished(frenchBySlug.get(entry.data.translationOf)!),
  );
  const translationOf = new Map(translations.map((entry) => [entry.data.translationOf, entry]));

  const fromFrench = (source: CollectionEntry<'articles'>) => ({
    date: source.data.date,
    author: source.data.author,
    tags: source.data.tags,
    icon: source.data.icon,
    image: source.data.image ?? fallbackCover(source.id),
  });

  const articles: Article[] =
    locale === 'fr'
      ? french.filter(isPublished).map((entry) => {
          const english = translationOf.get(entry.id);
          return {
            slug: entry.id,
            locale,
            url: articleUrl(entry.id, 'fr'),
            title: entry.data.title,
            description: entry.data.description,
            faq: entry.data.faq,
            entry,
            alternate: english ? articleUrl(english.id, 'en') : undefined,
            ...fromFrench(entry),
          };
        })
      : translations.map((entry) => {
          const source = frenchBySlug.get(entry.data.translationOf)!;
          return {
            slug: entry.id,
            locale,
            url: articleUrl(entry.id, 'en'),
            title: entry.data.title,
            description: entry.data.description,
            faq: entry.data.faq,
            entry,
            alternate: articleUrl(source.id, 'fr'),
            ...fromFrench(source),
          };
        });

  return articles.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
