import { NextRequest, NextResponse } from 'next/server';

const RSS_FEEDS: { url: string; category: string; source: string; logo: string }[] = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'tech', source: 'NY Times', logo: '📰' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', source: 'NY Times', logo: '🌍' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business', source: 'NY Times', logo: '📊' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', category: 'sports', source: 'NY Times', logo: '⚽' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'science', source: 'NY Times', logo: '🔬' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', category: 'health', source: 'NY Times', logo: '🏥' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', category: 'politics', source: 'NY Times', logo: '🏛️' },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world', source: 'BBC News', logo: '🇬🇧' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech', source: 'BBC Tech', logo: '💻' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business', source: 'BBC Business', logo: '💰' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports', source: 'BBC Sport', logo: '🏆' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', category: 'health', source: 'BBC Health', logo: '💊' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', source: 'BBC World', logo: '🌐' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', source: 'Al Jazeera', logo: '📡' },
];

function parseXml(text: string) {
  const items: { title: string; link: string; description: string; pubDate: string }[] = [];
  const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const item of itemMatches.slice(0, 5)) {
    const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]
      || item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
      || '';
    const link = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '';
    const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1]
      || item.match(/<description>([\s\S]*?)<\/description>/i)?.[1]
      || '';
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '';

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]*>/g, '').trim(),
        link,
        description: description.replace(/<[^>]*>/g, '').trim().slice(0, 200),
        pubDate,
      });
    }
  }
  return items;
}

function buildArticle(item: { title: string; link: string; description: string; pubDate: string }, feed: typeof RSS_FEEDS[0]) {
  const hash = Buffer.from(item.link).toString('base64').slice(0, 12);
  const pubTime = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
  return {
    id: `${feed.source}-${hash}`,
    title: item.title,
    summary: item.description || 'No description available.',
    fullContent: item.description || 'No content available.',
    source: feed.source,
    sourceLogo: feed.logo,
    category: feed.category,
    imageUrl: `https://picsum.photos/seed/${hash}/800/450`,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    url: item.link,
    isLive: Date.now() - pubTime < 30 * 60 * 1000,
    isNew: Date.now() - pubTime < 5 * 60 * 1000,
  };
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || 'all';

  const feeds = category === 'all'
    ? RSS_FEEDS
    : RSS_FEEDS.filter((f) => f.category === category);

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'InsightNewsFeed/1.0' },
        next: { revalidate: 30 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const items = parseXml(text);
      return items.map((item) => buildArticle(item, feed));
    })
  );

  const articles = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof buildArticle>[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ articles, count: articles.length });
}
