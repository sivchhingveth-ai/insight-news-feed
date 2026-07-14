'use client';

import { useState, useCallback } from 'react';
import { Article, ChatMessage } from '@/lib/types';

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiKey = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('insight_gemini_key') || '';
  }, []);

  const sendMessage = useCallback(
    async (text: string, article?: Article) => {
      const apiKey = getApiKey();
      if (!apiKey) {
        setError('No API key set. Click the gear icon to add your Gemini API key.');
        return;
      }

      setError(null);
      const userMsg: ChatMessage = { role: 'user', text };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        let prompt = text;
        if (article) {
          prompt = `[Article Context]\nTitle: ${article.title}\nSource: ${article.source}\nCategory: ${article.category}\nSummary: ${article.summary}\nFull Content: ${article.fullContent}\n\n[User Question]\n${text}`;
        }

        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ text: prompt }],
            apiKey,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get response');

        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    },
    [getApiKey]
  );

  const summarizeArticle = useCallback(
    async (article: Article) => {
      await sendMessage('Summarize this article for me in 2-3 concise bullet points.', article);
    },
    [sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, summarizeArticle, clearChat };
}
