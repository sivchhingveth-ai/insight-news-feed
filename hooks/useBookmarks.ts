'use client';

import { useState, useCallback, useMemo } from 'react';
import { Article } from '@/lib/types';
import { getBookmarkedArticles, toggleBookmark as storeToggle } from '@/lib/store';

export function useBookmarks() {
  const [savedArticles, setSavedArticles] = useState<Article[]>(() => {
    if (typeof window === 'undefined') return [];
    return getBookmarkedArticles();
  });

  const toggle = useCallback((id: string, article?: Article) => {
    setSavedArticles(storeToggle(id, article));
  }, []);

  const bookmarks = useMemo(() => savedArticles.map((a) => a.id), [savedArticles]);
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const isBookmarked = useCallback(
    (id: string) => bookmarkSet.has(id),
    [bookmarkSet]
  );

  return { bookmarks, bookmarkedArticles: savedArticles, toggleBookmark: toggle, isBookmarked };
}
