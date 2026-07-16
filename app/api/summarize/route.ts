import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT =
  'You are Insight AI, a news assistant for InsightNewsFeed. Write for a general reader in plain, easy-to-read English: short sentences, simple everyday words, and explain any jargon. Format for skimming — use short paragraphs and bullet points (each starting with "- ") for lists, and **bold** for key terms or labels. Be factual and neutral. When summarizing, cover all the important points, names, and figures without oversimplifying, but keep it clear and easy to follow. Use the article context when provided.';

interface IncomingMessage {
  role?: 'user' | 'assistant';
  text: string;
}

// Caps so a client can't relay unbounded payloads to the Groq account.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 12000;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'AI is not configured yet. Add GROQ_API_KEY to your .env.local file (get a free key at console.groq.com/keys) and restart the server.',
        },
        { status: 503 }
      );
    }

    const body = (await req.json().catch(() => null)) as { messages?: unknown } | null;
    const rawMessages = Array.isArray(body?.messages) ? (body.messages as unknown[]) : [];

    const messages = rawMessages
      .filter((m): m is IncomingMessage => !!m && typeof (m as IncomingMessage).text === 'string')
      .slice(-MAX_MESSAGES);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text.slice(0, MAX_MESSAGE_CHARS),
      })),
    ];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: chatMessages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();

      if (res.status === 401) {
        return NextResponse.json(
          { error: 'Invalid GROQ_API_KEY. Get a free key at console.groq.com/keys and update .env.local.' },
          { status: 401 }
        );
      }
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit reached on the free tier. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      console.error('Groq API error:', res.status, detail);
      return NextResponse.json({ error: `AI request failed (${res.status}).` }, { status: 502 });
    }

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content?.trim();

    if (!response) {
      return NextResponse.json({ error: 'The AI returned an empty response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Summarize route error:', message);
    return NextResponse.json({ error: `AI request failed: ${message}` }, { status: 500 });
  }
}
