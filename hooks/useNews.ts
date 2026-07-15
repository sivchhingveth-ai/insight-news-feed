'use client';

import { useState, useEffect, useRef } from 'react';
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
        if (data.length > 0) setArticles(data);
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) return;

    let cancelled = false;
    setIsLoading(true);
    fetchLiveNews(category).then((data) => {
      if (!cancelled && data.length > 0) setArticles(data);
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [category]);

  useEffect(() => {
    if (category !== 'all' || searchQuery) return;

    const interval = setInterval(() => {
      fetchLiveNews('all').then((data) => {
        if (data.length > 0) setArticles(data);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [category, searchQuery]);

  const filteredArticles = searchQuery
    ? articles.filter((a) => {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
        );
      })
    : articles.filter((a) => !a.isExpired);

  const changeCategory = (cat: Category) => {
    setCategory(cat);
    setSearchQuery('');
  };

  const search = (query: string) => {
    setSearchQuery(query);
    if (query) setCategory('all');
  };

  const newCount = filteredArticles.filter((a) => a.isNew).length;

  return {
    articles: filteredArticles,
    category,
    searchQuery,
    isLoading,
    newCount,
    changeCategory,
    search,
  };
}
