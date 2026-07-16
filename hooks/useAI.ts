'use client';

import { useState, useCallback, useRef } from 'react';
import { Article, ChatMessage } from '@/lib/types';

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (text: string, article?: Article) => {
      setError(null);
      const userMsg: ChatMessage = { role: 'user', text };

      let promptText = text;
      if (article) {
        promptText = `[Article Context]\nTitle: ${article.title}\nSource: ${article.source}\nCategory: ${article.category}\nSummary: ${article.summary}\nFull Content: ${article.fullContent}\n\n[User Question]\n${text}`;
      }

      setMessages((prev) => {
        const next = [...prev, userMsg];
        messagesRef.current = next;
        return next;
      });
      setIsLoading(true);

      try {
        const payload = [...messagesRef.current, { role: 'user' as const, text: promptText }];

        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payload }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get response');

        setMessages((prev) => {
          const next = [...prev, { role: 'assistant' as const, text: data.response }];
          messagesRef.current = next;
          return next;
        });
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
        article
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
