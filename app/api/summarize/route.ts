import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided. Click the gear icon to add your Gemini API key.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'You are Insight AI, a news assistant for InsightNewsFeed. Follow these rules: Be concise (under 200 words). Be factual. Use article context when provided. If the user asks about news, provide helpful summaries.' }] },
        { role: 'model', parts: [{ text: 'Understood. I am Insight AI, ready to summarize news and answer questions accurately and concisely.' }] },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('API_KEY_INVALID') || message.includes('key not valid')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please get a free key at aistudio.google.com/apikey and save it in Settings.' },
        { status: 401 }
      );
    }

    if (message.includes('fetch') || message.includes('network')) {
      return NextResponse.json(
        { error: 'Network error. Please check your internet connection and try again.' },
        { status: 502 }
      );
    }

    console.error('Gemini API error:', message);
    return NextResponse.json(
      { error: `AI request failed: ${message}` },
      { status: 500 }
    );
  }
}
