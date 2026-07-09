import { NextRequest, NextResponse } from 'next/server';

function decodeHtml(str: string) {
  return str
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#\d+;/g, (m) => {
      const code = parseInt(m.slice(2, -1), 10);
      return String.fromCharCode(code);
    })
    .trim();
}

function extractArticleText(html: string): string {
  const paragraphs: string[] = [];

  // Extract from <p> tags
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const p of pMatches) {
    const inner = p.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '');
    const text = decodeHtml(inner);
    if (text.length > 40) {
      paragraphs.push(text);
    }
  }

  // If no good paragraphs, try <article> tag
  if (paragraphs.length < 2) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      const innerPs = articleMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      for (const p of innerPs) {
        const inner = p.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '');
        const text = decodeHtml(inner);
        if (text.length > 40) {
          paragraphs.push(text);
        }
      }
    }
  }

  // Deduplicate consecutive similar paragraphs
  const unique: string[] = [];
  for (const p of paragraphs) {
    if (unique.length === 0 || p !== unique[unique.length - 1]) {
      unique.push(p);
    }
  }

  return unique.join('\n\n');
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const content = extractArticleText(html);

    if (!content || content.length < 50) {
      return NextResponse.json({
        content: '',
        fallback: true,
        message: 'Could not extract article text. The source may require JavaScript.',
      });
    }

    return NextResponse.json({ content, fallback: false });
  } catch {
    return NextResponse.json({
      content: '',
      fallback: true,
      message: 'Failed to fetch article. Opening source page instead.',
    });
  }
}
