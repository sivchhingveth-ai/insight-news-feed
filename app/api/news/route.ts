import { NextRequest, NextResponse } from 'next/server';

const RSS_FEEDS: { url: string; category: string; source: string; logo: string; format: 'rss' | 'atom' }[] = [
  // Trading — financial & investment news
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'trading', source: 'CNBC', logo: '📈', format: 'rss' },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'trading', source: 'CNBC Finance', logo: '💰', format: 'rss' },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'trading', source: 'MarketWatch', logo: '📊', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'trading', source: 'NY Times', logo: '📰', format: 'rss' },

  // Tech — general technology
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'tech', source: 'NY Times', logo: '📰', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech', source: 'BBC Tech', logo: '💻', format: 'rss' },

  // AI — artificial intelligence specific
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai', source: 'The Verge', logo: '🤖', format: 'atom' },
  { url: 'https://www.technologyreview.com/feed/', category: 'ai', source: 'MIT Tech Review', logo: '🧠', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'ai', source: 'NY Times', logo: '📰', format: 'rss' },

  // Technology — broader tech & science
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'technology', source: 'NY Times', logo: '🔬', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology', source: 'BBC Tech', logo: '💻', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology', source: 'NY Times', logo: '📰', format: 'rss' },

  // Wars — conflict & world news
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'wars', source: 'NY Times', logo: '📰', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'wars', source: 'BBC World', logo: '🌐', format: 'rss' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'wars', source: 'Al Jazeera', logo: '📡', format: 'rss' },
];

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (m) => {
      const code = parseInt(m.slice(2, -1), 10);
      return String.fromCharCode(code);
    });
}

function parseXml(text: string, format: 'rss' | 'atom') {
  const items: { title: string; link: string; description: string; pubDate: string; imageUrl: string }[] = [];

  if (format === 'atom') {
    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/gi) || [];
    for (const entry of entries.slice(0, 20)) {
      const title = entry.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]
        || entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        || '';
      const link = entry.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
      const summary = entry.match(/<summary[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/summary>/i)?.[1]
        || entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1]
        || entry.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/i)?.[1]
        || entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1]
        || '';
      const pubDate = entry.match(/<published>([\s\S]*?)<\/published>/i)?.[1]
        || entry.match(/<updated>([\s\S]*?)<\/updated>/i)?.[1]
        || '';
      const mediaContent = entry.match(/<media:content[^>]*url="([^"]+)"/i)?.[1]
        || entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1]
        || '';

      if (title && link) {
        items.push({
          title: decodeHtmlEntities(title.replace(/<[^>]*>/g, '').trim()),
          link,
          description: decodeHtmlEntities(summary.replace(/<[^>]*>/g, '').trim()),
          pubDate,
          imageUrl: mediaContent,
        });
      }
    }
  } else {
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    for (const item of itemMatches.slice(0, 20)) {
      const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]
        || item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
        || '';
      const link = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '';
      const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1]
        || item.match(/<description>([\s\S]*?)<\/description>/i)?.[1]
        || '';
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '';
      const mediaContent = item.match(/<media:content[^>]*url="([^"]+)"/i)?.[1]
        || item.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1]
        || item.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]+"/i)?.[1]
        || '';

      if (title && link) {
        items.push({
          title: decodeHtmlEntities(title.replace(/<[^>]*>/g, '').trim()),
          link,
          description: decodeHtmlEntities(description.replace(/<[^>]*>/g, '').trim()),
          pubDate,
          imageUrl: mediaContent,
        });
      }
    }
  }
  return items;
}

const WAR_KEYWORDS = ['war', 'strike', 'bomb', 'attack', 'conflict', 'military', 'troops', 'invasion', 'ceasefire', 'missile', 'weapon', 'nato', 'combat', 'soldier', 'ukraine', 'russia', 'gaza', 'israel', 'iran', 'Syria', 'yemen', 'coup', 'civil war', 'nuclear'];
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'anthropic', 'gemini', 'llm', 'gpt', 'machine learning', 'deep learning', 'neural', 'copilot', 'claude', 'deepseek', 'meta ai', 'ai model', 'ai safety', 'agi'];

function matchesKeywords(title: string, keywords: string[]) {
  const lower = title.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function buildArticle(item: { title: string; link: string; description: string; pubDate: string; imageUrl: string }, feed: typeof RSS_FEEDS[0], index: number) {
  const pubTime = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const ageMs = Date.now() - pubTime;

  return {
    id: `${feed.category}-${slug}-${feed.source.replace(/\s+/g, '')}-${index}`,
    title: item.title,
    summary: item.description || 'No description available.',
    fullContent: item.description || 'No content available.',
    source: feed.source,
    sourceLogo: feed.logo,
    category: feed.category as 'all' | 'trading' | 'tech' | 'ai' | 'technology' | 'wars',
    imageUrl: item.imageUrl || `https://picsum.photos/seed/${slug}/800/450`,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    url: item.link,
    isLive: ageMs < 30 * 60 * 1000,
    isNew: ageMs < 5 * 60 * 1000,
    isExpired: ageMs > 24 * 60 * 60 * 1000,
  };
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || 'all';

  const feeds = category === 'all'
    ? RSS_FEEDS.filter((f) => f.category === 'trading')
    : RSS_FEEDS.filter((f) => f.category === category);

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'InsightNewsFeed/1.0' },
        next: { revalidate: 30 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const items = parseXml(text, feed.format);
      return items.map((item, i) => buildArticle(item, feed, i));
    })
  );

  const seen = new Set<string>();
  let articles = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof buildArticle>[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

  // For AI tab, only keep articles with AI-related keywords
  if (category === 'ai') {
    articles = articles.filter((a) => matchesKeywords(a.title, AI_KEYWORDS));
  }

  // For Wars tab, only keep articles with war/conflict keywords
  if (category === 'wars') {
    articles = articles.filter((a) => matchesKeywords(a.title, WAR_KEYWORDS));
  }

  articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ articles, count: articles.length });
}
