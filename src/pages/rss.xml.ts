import { articlesFeed } from '../lib/rss';

export async function GET(context: any) {
  return articlesFeed('fr', context.site);
}
