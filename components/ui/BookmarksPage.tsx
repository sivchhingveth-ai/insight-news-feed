'use client';

import { useMemo } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import { Article } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X } from 'lucide-react';

interface BookmarksPageProps {
  isOpen: boolean;
  articles: Article[];
  bookmarkIds: string[];
  onClose: () => void;
  onArticleClick: (article: Article) => void;
  onSummarize: (article: Article) => void;
  onBookmarkToggle: (id: string) => void;
}

export function BookmarksPage({ isOpen, articles, bookmarkIds, onClose, onArticleClick, onSummarize, onBookmarkToggle }: BookmarksPageProps) {
  const savedArticles = useMemo(
    () => articles.filter((a) => bookmarkIds.includes(a.id)),
    [bookmarkIds, articles]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 z-50 h-full sm:max-w-lg overflow-y-auto border-l border-glass-border bg-surface/95 backdrop-blur-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-glass-border bg-surface/80 backdrop-blur-xl p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">Saved Articles</h2>
                <span className="text-sm text-text-secondary">({savedArticles.length})</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {savedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bookmark className="h-12 w-12 text-text-secondary/30 mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-1">No saved articles</h3>
                  <p className="text-sm text-text-secondary">Tap the bookmark icon on any article to save it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {savedArticles.map((article, index) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        isBookmarked={bookmarkIds.includes(article.id)}
                        staggerIndex={index}
                        onBookmarkToggle={onBookmarkToggle}
                        onClick={onArticleClick}
                        onSummarize={onSummarize}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
