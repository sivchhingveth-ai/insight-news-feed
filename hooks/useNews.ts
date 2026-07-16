'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Article, Category } from '@/lib/types';

async function fetchLiveNews(category?: Category): Promise<Article[]> {
  try {
    const url = category && category !== 'all'
      ? `/api/news?category=${category}`
      : '/api/news';
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data.articles || [];
  } catch {
    return [];
  }
}

function dedupeByUrl(prev: Article[], next: Article[]): Article[] {
  const seen = new Set(prev.map((a) => a.url));
  const merged = [...prev];
  for (const a of next) {
    if (!seen.has(a.url)) {
      seen.add(a.url);
      merged.push(a);
    }
  }
  return merged;
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchLiveNews('all').then((data) => {
        if (data.length > 0) {
          setArticles((prev) => dedupeByUrl(prev, data));
        }
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) return;

    let cancelled = false;
    setIsLoading(true);
    fetchLiveNews(category).then((data) => {
      if (!cancelled && data.length > 0) {
        setArticles((prev) => dedupeByUrl(prev, data));
      }
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [category]);

  useEffect(() => {
    if (category !== 'all' || searchQuery) return;

    const interval = setInterval(() => {
      fetchLiveNews('all').then((data) => {
        if (data.length > 0) {
          setArticles((prev) => dedupeByUrl(prev, data));
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [category, searchQuery]);

  const filteredArticles = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return articles.filter((a) => {
        return (
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
        );
      });
    }
    return articles.filter((a) => !a.isExpired);
  }, [articles, searchQuery]);

  const changeCategory = useCallback((cat: Category) => {
    setCategory(cat);
    setSearchQuery('');
  }, []);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) setCategory('all');
  }, []);

  const newCount = useMemo(() => filteredArticles.filter((a) => a.isNew).length, [filteredArticles]);

  return {
    articles: filteredArticles,
    allArticles: articles,
    category,
    searchQuery,
    isLoading,
    newCount,
    changeCategory,
    search,
  };
}
