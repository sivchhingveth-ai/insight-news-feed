'use client';

import { useState, useEffect } from 'react';
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
    category,
    searchQuery,
    isLoading,
    newCount,
    changeCategory,
    search,
  } = useNews();

  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const { unseenCount, markSeen } = useNotifications(newCount);
  const { messages, isLoading: isAiLoading, error: aiError, sendMessage, summarizeArticle, clearChat } = useAI();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const handleSummarize = (article: Article) => {
    setSelectedArticle(null); // close the slide-over so the chat is visible
    setAiChatOpen(true);
    summarizeArticle(article);
  };

  // Jump back to the top whenever the category filter changes.
  // Use an instant scroll — the list is replaced by a loading skeleton on
  // change, and that reflow cancels a smooth-scroll animation mid-flight.
  const handleCategoryChange = (cat: Category) => {
    changeCategory(cat);
    window.scrollTo(0, 0);
  };

  // Single source of truth for locking background scroll — avoids two
  // overlays racing on document.body.style.overflow.
  useEffect(() => {
    const locked = selectedArticle !== null || aiChatOpen || bookmarksOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArticle, aiChatOpen, bookmarksOpen]);

  const breakingNews = articles.filter((a) => a.isLive || a.isNew).slice(0, 10);

  return (
    <>
      <Navbar
        category={category}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearch={search}
        notificationCount={unseenCount}
        onNotificationClick={markSeen}
        bookmarkCount={bookmarks.length}
        onBookmarkClick={() => setBookmarksOpen(true)}
      />

      <HeroSection breakingNews={breakingNews} />

      <main className="w-full px-3 sm:px-4 py-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {category === 'all' ? 'Latest News' : category === 'trading' ? 'Trading' : category === 'ai' ? 'AI' : category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <span className="text-sm text-text-secondary">
            {articles.length} articles
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
                articles={articles}
                isBookmarked={isBookmarked}
                onBookmarkToggle={toggleBookmark}
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
          toggleBookmark(id);
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
        onClose={() => setBookmarksOpen(false)}
        onArticleClick={(article) => {
          setBookmarksOpen(false);
          setSelectedArticle(article);
        }}
        onSummarize={handleSummarize}
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
