'use client';

import { useState, useCallback, useMemo } from 'react';
import { getBookmarks, toggleBookmark as storeToggle } from '@/lib/store';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return getBookmarks();
  });

  const toggle = useCallback((id: string) => {
    const next = storeToggle(id);
    setBookmarks(next);
    return next;
  }, []);

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const isBookmarked = useCallback(
    (id: string) => bookmarkSet.has(id),
    [bookmarkSet]
  );

  return { bookmarks, toggleBookmark: toggle, isBookmarked };
}
