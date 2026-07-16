'use client';

import { Article } from '@/lib/types';
import { NewsCard } from './NewsCard';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, useRef } from 'react';

const BATCH_SIZE = 10;

interface NewsFeedProps {
  articles: Article[];
  isBookmarked: (id: string) => boolean;
  onBookmarkToggle: (id: string) => void;
  onArticleClick: (article: Article) => void;
  onSummarize: (article: Article) => void;
}

export function NewsFeed({
  articles,
  isBookmarked,
  onBookmarkToggle,
  onArticleClick,
  onSummarize,
}: NewsFeedProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bookmarkSet = useMemo(() => {
    return new Set(articles.filter((a) => isBookmarked(a.id)).map((a) => a.id));
  }, [articles, isBookmarked]);

  // No reset when `articles` changes: the 30s poll produces a new array and
  // resetting here collapsed the feed back to 10 cards under the reader.
  // Category switches remount this component via key={category} instead.
  useEffect(() => {
    if (visibleCount >= articles.length) return;

    timerRef.current = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, articles.length));
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visibleCount, articles.length]);

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl mb-4">📰</div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No articles found</h3>
        <p className="text-sm text-text-secondary">Try a different search or category</p>
      </div>
    );
  }

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <AnimatePresence mode="sync">
        {visibleArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            isBookmarked={bookmarkSet.has(article.id)}
            onBookmarkToggle={onBookmarkToggle}
            onClick={onArticleClick}
            onSummarize={onSummarize}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
