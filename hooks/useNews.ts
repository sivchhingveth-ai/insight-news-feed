'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

function articleCategories(a: Article): Category[] {
  return a.categories ?? [a.category];
}

// isLive/isNew/isExpired are derived from publishedAt, so recompute them
// locally — otherwise merged articles keep the flags from their first fetch
// forever (LIVE/NEW badges that never clear).
function refreshFlags(a: Article): Article {
  const age = Date.now() - new Date(a.publishedAt).getTime();
  const isLive = age < 30 * 60 * 1000;
  const isNew = age < 5 * 60 * 1000;
  const isExpired = age > 7 * 24 * 60 * 60 * 1000;
  if (isLive === a.isLive && isNew === a.isNew && isExpired === a.isExpired) return a;
  return { ...a, isLive, isNew, isExpired };
}

// Merge keeps the existing object for known URLs (stable identity for
// bookmarks/memoization), unions categories, refreshes time flags, and
// returns `prev` unchanged when nothing actually changed so downstream
// memos and the feed's batching don't reset on every poll.
function mergeArticles(prev: Article[], next: Article[]): Article[] {
  const freshByUrl = new Map(next.map((a) => [a.url, a]));
  let changed = false;

  const merged = prev.map((old) => {
    const fresh = freshByUrl.get(old.url);
    let article = old;
    if (fresh) {
      freshByUrl.delete(old.url);
      const cats = new Set([...articleCategories(old), ...articleCategories(fresh)]);
      if (cats.size !== articleCategories(old).length) {
        article = { ...old, categories: [...cats] };
      }
    }
    const refreshed = refreshFlags(article);
    if (refreshed !== old) changed = true;
    return refreshed;
  });

  const additions = [...freshByUrl.values()];
  if (additions.length === 0 && !changed) return prev;

  return [...merged, ...additions].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRender = useRef(true);

  // Fetch effect — runs on mount (category starts as 'all') and on every category change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setIsLoading(true);
    }
    let cancelled = false;
    fetchLiveNews(category).then((data) => {
      if (cancelled) return;
      if (data.length > 0) {
        setArticles((prev) => mergeArticles(prev, data));
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [category]);

  useEffect(() => {
    if (category !== 'all' || searchQuery) return;

    const interval = setInterval(() => {
      fetchLiveNews('all').then((data) => {
        if (data.length > 0) {
          setArticles((prev) => mergeArticles(prev, data));
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
