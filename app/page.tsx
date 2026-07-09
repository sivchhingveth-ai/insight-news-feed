'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { HeroSection } from '@/components/hero/HeroSection';
import { NewsFeed } from '@/components/news/NewsFeed';
import { NewsSlideOver } from '@/components/news/NewsSlideOver';
import { AIChatPanel } from '@/components/ui/AIChatPanel';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { useNews } from '@/hooks/useNews';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useNotifications } from '@/hooks/useNotifications';
import { useAI } from '@/hooks/useAI';
import { Article } from '@/lib/types';

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

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { unseenCount, markSeen } = useNotifications(newCount);
  const { summarizeArticle } = useAI();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  const breakingNews = articles.filter((a) => a.isLive || a.isNew).slice(0, 10);

  return (
    <>
      <Navbar
        category={category}
        onCategoryChange={changeCategory}
        searchQuery={searchQuery}
        onSearch={search}
        notificationCount={unseenCount}
        onNotificationClick={markSeen}
      />

      <HeroSection breakingNews={breakingNews} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                {category === 'all' ? 'Latest News' : category === 'trading' ? 'Trading' : category === 'ai' ? 'AI' : category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <span className="text-sm text-text-secondary">
                {articles.length} articles
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                onSummarize={summarizeArticle}
              />
            )}
          </div>

          <Sidebar />
        </div>
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
        onSummarize={summarizeArticle}
      />

      <AIChatPanel onOpenSettings={() => { setSettingsKey((k) => k + 1); setSettingsOpen(true); }} />
      <SettingsModal key={settingsKey} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
