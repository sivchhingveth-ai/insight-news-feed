import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/lib/types';

const RSS_FEEDS: { url: string; category: string; source: string; logo: string; format: 'rss' | 'atom' }[] = [
  // Trading — financial & investment news
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'trading', source: 'CNBC', logo: '/logos/cnbc.svg', format: 'rss' },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'trading', source: 'CNBC Finance', logo: '/logos/cnbc.svg', format: 'rss' },
  { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'trading', source: 'MarketWatch', logo: '/logos/marketwatch.svg', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'trading', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },

  // Tech — general technology
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'tech', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech', source: 'BBC Tech', logo: '/logos/bbc.svg', format: 'rss' },

  // AI — artificial intelligence specific
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai', source: 'The Verge', logo: '/logos/verge.svg', format: 'atom' },
  { url: 'https://www.technologyreview.com/feed/', category: 'ai', source: 'MIT Tech Review', logo: '/logos/mit.svg', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'ai', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },

  // Technology — broader tech & science
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'technology', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology', source: 'BBC Tech', logo: '/logos/bbc.svg', format: 'rss' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },

  // Wars — conflict & world news
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'wars', source: 'NY Times', logo: '/logos/nyt.svg', format: 'rss' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'wars', source: 'BBC World', logo: '/logos/bbc.svg', format: 'rss' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'wars', source: 'Al Jazeera', logo: '/logos/aljazeera.svg', format: 'rss' },
];

function decodeCodePoint(match: string, code: number): string {
  if (Number.isNaN(code) || code < 0 || code > 0x10ffff) return match;
  return String.fromCodePoint(code);
}

// Numeric and named entities first; &amp; must be decoded LAST so that
// double-encoded input (e.g. "&amp;quot;") is not decoded twice.
function decodeHtmlEntities(str: string) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => decodeCodePoint(m, parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (m, dec) => decodeCodePoint(m, parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// Decode entities BEFORE stripping tags so entity-encoded markup
// (common in RSS <description>) is removed instead of shown as text.
function cleanText(raw: string): string {
  return decodeHtmlEntities(raw).replace(/<[^>]*>/g, '').trim();
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
          title: cleanText(title),
          link,
          description: cleanText(summary),
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
          title: cleanText(title),
          link,
          description: cleanText(description),
          pubDate,
          imageUrl: mediaContent,
        });
      }
    }
  }
  return items;
}

const WAR_KEYWORDS = ['war', 'strike', 'bomb', 'attack', 'conflict', 'military', 'troops', 'invasion', 'ceasefire', 'missile', 'weapon', 'nato', 'combat', 'soldier', 'ukraine', 'russia', 'gaza', 'israel', 'iran', 'syria', 'yemen', 'coup', 'civil war', 'nuclear'];
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'anthropic', 'gemini', 'llm', 'gpt', 'machine learning', 'deep learning', 'neural', 'copilot', 'claude', 'deepseek', 'meta ai', 'ai model', 'ai safety', 'agi'];

// Whole-word matching — a bare .includes() would match "ai" in "said"
// or "war" in "software".
function buildKeywordRegex(keywords: string[]): RegExp {
  const escaped = keywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');
}

const WAR_REGEX = buildKeywordRegex(WAR_KEYWORDS);
const AI_REGEX = buildKeywordRegex(AI_KEYWORDS);

function upgradeImageUrl(url: string): string {
  if (!url) return url;
  // BBC images: replace small size variants with larger ones
  // e.g. /news/320/ → /news/1280/, /news/660/ → /news/1280/
  if (url.includes('ichef.bbci.co.uk')) {
    return url.replace(/\/news\/(320|480|660|800)\//, '/news/1280/');
  }
  // NYT images: replace thumbnail size with large
  if (url.includes('static01.nyt.com') || url.includes('nyt.com')) {
    return url.replace(/\/thumbLarge\//, '/superJumbo/').replace(/\/thumbStandard\//, '/superJumbo/');
  }
  // MarketWatch: try larger variant
  if (url.includes('images.mktw.net')) {
    return url.replace(/\/images\/\d+x\d+\//, '/images/1280x720/');
  }
  return url;
}

// Stable hash of the article URL so ids survive feed reordering —
// index-based ids broke persisted bookmarks between fetches.
function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function buildArticle(item: { title: string; link: string; description: string; pubDate: string; imageUrl: string }, feed: typeof RSS_FEEDS[0]) {
  const parsedDate = item.pubDate ? new Date(item.pubDate.trim()) : null;
  const pubTime = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getTime() : Date.now();
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const ageMs = Date.now() - pubTime;

  return {
    id: `${slug}-${hashString(item.link)}`,
    title: item.title,
    summary: item.description || 'No description available.',
    fullContent: item.description || 'No content available.',
    source: feed.source,
    sourceLogo: feed.logo,
    category: feed.category as Category,
    categories: [feed.category as Category],
    imageUrl: upgradeImageUrl(item.imageUrl) || `https://picsum.photos/seed/${slug}/800/450`,
    publishedAt: new Date(pubTime).toISOString(),
    url: item.link,
    isLive: ageMs < 30 * 60 * 1000,
    isNew: ageMs < 5 * 60 * 1000,
    isExpired: ageMs > 7 * 24 * 60 * 60 * 1000,
  };
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || 'all';

  // "All" means every feed (deduplicated by URL — some feeds are listed
  // under multiple categories), not just the trading feeds.
  const feeds = category === 'all'
    ? RSS_FEEDS.filter((f, i) => RSS_FEEDS.findIndex((g) => g.url === f.url) === i)
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
      let feedArticles = items.map((item) => buildArticle(item, feed));
      // Keyword-gated categories filter per feed so the result is the same
      // whether articles arrive via their own tab or via "all".
      if (feed.category === 'ai') feedArticles = feedArticles.filter((a) => AI_REGEX.test(a.title));
      if (feed.category === 'wars') feedArticles = feedArticles.filter((a) => WAR_REGEX.test(a.title));
      return feedArticles;
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

  articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ articles, count: articles.length });
}
