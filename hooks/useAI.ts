'use client';

import { useState, useCallback, useRef } from 'react';
import { Article, ChatMessage } from '@/lib/types';

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (text: string, article?: Article, displayText?: string) => {
      setError(null);

      // The full prompt (article context / instructions) is stored on the
      // message (promptText) so it stays in the conversation history —
      // follow-up questions still see the article. `text` is what the UI
      // displays; `displayText` overrides it for canned prompts.
      const userMsg: ChatMessage = article
        ? {
            role: 'user',
            text: displayText ?? text,
            promptText: `[Article Context]\nTitle: ${article.title}\nSource: ${article.source}\nCategory: ${article.category}\nURL: ${article.url}\nImage: ${article.imageUrl}\nSummary: ${article.summary}\nFull Content: ${article.fullContent}\n\n[User Question]\n${text}`,
          }
        : displayText
          ? { role: 'user', text: displayText, promptText: text }
          : { role: 'user', text };

      // Build the history synchronously from the ref (single source of truth)
      // instead of relying on a setState updater side effect.
      const history = [...messagesRef.current, userMsg];
      messagesRef.current = history;
      setMessages(history);
      setIsLoading(true);

      try {
        const payload = history.map((m) => ({ role: m.role, text: m.promptText ?? m.text }));

        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payload }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get response');

        const withReply = [...messagesRef.current, {
          role: 'assistant' as const,
          text: data.response,
          articleUrl: article?.url,
          articleImage: article?.imageUrl,
          articleTitle: article?.title,
        }];
        messagesRef.current = withReply;
        setMessages(withReply);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const summarizeArticle = useCallback(
    async (article: Article) => {
      await sendMessage(
        [
          'Summarize this article in plain, easy-to-read language for a general reader. Use this exact structure:',
          '',
          'Start with one short line: **TL;DR:** followed by a single simple sentence.',
          'Then leave a blank line and give 4-6 bullet points (each starting with "- ").',
          'Each bullet should be ONE short, clear sentence covering a key fact, name, number, or piece of context.',
          'Use simple everyday words. If a technical or financial term is needed, explain it briefly in plain English.',
          'Do not leave out important points, but keep every sentence short and easy to follow.',
        ].join('\n'),
        article,
        `Summarize: "${article.title}"`
      );
    },
    [sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, summarizeArticle, clearChat };
}
