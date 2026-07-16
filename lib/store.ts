import { Article } from './types';

// Full article snapshots are persisted (not just ids) so saved articles
// still render after the live feed rotates past them.
const BOOKMARK_ARTICLES_KEY = 'insight_bookmark_articles';
const READ_KEY = 'insight_read';
const SEEN_KEY = 'insight_seen';

export function getBookmarkedArticles(): Article[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_ARTICLES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((a) => a && typeof a.id === 'string') : [];
  } catch {
    return [];
  }
}

function setBookmarkedArticles(articles: Article[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKMARK_ARTICLES_KEY, JSON.stringify(articles));
}

export function toggleBookmark(id: string, article?: Article): Article[] {
  const saved = getBookmarkedArticles();
  const exists = saved.some((a) => a.id === id);
  const next = exists
    ? saved.filter((a) => a.id !== id)
    : article
      ? [...saved, article]
      : saved;
  setBookmarkedArticles(next);
  return next;
}

export function getReadIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setReadIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READ_KEY, JSON.stringify(ids));
}

export function markAsRead(id: string): string[] {
  const read = getReadIds();
  if (!read.includes(id)) {
    const next = [...read, id];
    setReadIds(next);
    return next;
  }
  return read;
}

export function getSeenIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setSeenIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
}
