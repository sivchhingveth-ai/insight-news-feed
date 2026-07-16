'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/hero/HeroSection';
import { NewsFeed } from '@/components/news/NewsFeed';
import { NewsSlideOver } from '@/components/news/NewsSlideOver';
import { AIChatPanel } from '@/components/ui/AIChatPanel';
import { BookmarksPage } from '@/components/ui/BookmarksPage';
import { useNews } from '@/hooks/useNews';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useNotifications } from '@/hooks/useNotifications';
import { useAI } from '@/hooks/useAI';
import { Article, Category } from '@/lib/types';

function Dashboard() {
  const {
    articles,
    allArticles,
    category,
    searchQuery,
    isLoading,
    newCount,
    changeCategory,
    search,
  } = useNews();

  const { bookmarks, bookmarkedArticles, isBookmarked, toggleBookmark } = useBookmarks();
  const { unseenCount, markSeen } = useNotifications(newCount);
  const { messages, isLoading: isAiLoading, error: aiError, sendMessage, summarizeArticle, clearChat } = useAI();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const handleSummarize = useCallback((article: Article) => {
    setSelectedArticle(null);
    setAiChatOpen(true);
    summarizeArticle(article);
  }, [summarizeArticle]);

  const handleCategoryChange = useCallback((cat: Category) => {
    changeCategory(cat);
    window.scrollTo(0, 0);
  }, [changeCategory]);

  useEffect(() => {
    const locked = selectedArticle !== null || aiChatOpen || bookmarksOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArticle, aiChatOpen, bookmarksOpen]);

  const breakingNews = useMemo(() => articles.filter((a) => a.isLive || a.isNew).slice(0, 10), [articles]);

  const articleMap = useMemo(() => {
    const map = new Map<string, Article>();
    for (const a of allArticles) map.set(a.id, a);
    return map;
  }, [allArticles]);

  // Pass the article object along so a snapshot can be persisted with the id.
  const handleBookmarkToggle = useCallback(
    (id: string) => toggleBookmark(id, articleMap.get(id)),
    [toggleBookmark, articleMap]
  );

  // Live articles plus saved snapshots that are no longer in any feed.
  const bookmarksViewArticles = useMemo(() => {
    const extras = bookmarkedArticles.filter((a) => !articleMap.has(a.id));
    return extras.length === 0 ? allArticles : [...allArticles, ...extras];
  }, [allArticles, articleMap, bookmarkedArticles]);

  const validBookmarks = useMemo(() => {
    return bookmarks.filter((id) => {
      const article = articleMap.get(id);
      if (!article) return true;
      return !article.isExpired;
    });
  }, [bookmarks, articleMap]);

  const validBookmarkSet = useMemo(() => new Set(validBookmarks), [validBookmarks]);

  const displayArticles = useMemo(() => {
    const filtered = category === 'all'
      ? articles
      : articles.filter((a) => (a.categories ?? [a.category]).includes(category));

    const bookmarked = articles.filter((a) => validBookmarkSet.has(a.id));
    const nonBookmarked = filtered.filter((a) => !validBookmarkSet.has(a.id));
    const merged = [...bookmarked, ...nonBookmarked];

    const seen = new Set<string>();
    return merged.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    }).filter((a) => !a.isExpired);
  }, [category, articles, validBookmarkSet]);

  const articleCount = displayArticles.length;

  return (
    <>
      <Navbar
        category={category}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearch={search}
        notificationCount={unseenCount}
        onNotificationClick={markSeen}
        bookmarkCount={validBookmarks.length}
        onBookmarkClick={() => setBookmarksOpen(true)}
      />

      <HeroSection breakingNews={breakingNews} />

      <main className="w-full px-3 sm:px-4 py-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {category === 'all' ? 'Latest News' : category === 'trading' ? 'Trading' : category === 'ai' ? 'AI' : category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <span className="text-sm text-text-secondary">
            {articleCount} articles
          </span>
        </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass overflow-hidden animate-pulse">
                    <div className="h-44 bg-white/5" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NewsFeed
                key={category}
                articles={displayArticles}
                isBookmarked={isBookmarked}
                onBookmarkToggle={handleBookmarkToggle}
                onArticleClick={setSelectedArticle}
                onSummarize={handleSummarize}
              />
            )}
          </main>

      <NewsSlideOver
        key={selectedArticle?.id || 'closed'}
        article={selectedArticle}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
        onBookmarkToggle={(id) => {
          handleBookmarkToggle(id);
          if (selectedArticle?.id === id) {
            setSelectedArticle({ ...selectedArticle });
          }
        }}
        onClose={() => setSelectedArticle(null)}
        onSummarize={handleSummarize}
      />

      <AIChatPanel
        isOpen={aiChatOpen}
        messages={messages}
        isLoading={isAiLoading}
        error={aiError}
        onOpen={() => setAiChatOpen(true)}
        onClose={() => setAiChatOpen(false)}
        onSend={sendMessage}
        onClear={clearChat}
      />

      <BookmarksPage
        isOpen={bookmarksOpen}
        articles={bookmarksViewArticles}
        bookmarkIds={validBookmarks}
        onClose={() => setBookmarksOpen(false)}
        onArticleClick={(article) => {
          setBookmarksOpen(false);
          setSelectedArticle(article);
        }}
        onSummarize={handleSummarize}
        onBookmarkToggle={handleBookmarkToggle}
      />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
