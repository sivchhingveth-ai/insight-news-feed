'use client';

import { Category } from '@/lib/types';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryTabs } from '@/components/ui/CategoryTabs';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Zap } from 'lucide-react';

interface NavbarProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  notificationCount: number;
  onNotificationClick: () => void;
}

export function Navbar({
  category,
  onCategoryChange,
  searchQuery,
  onSearch,
  notificationCount,
  onNotificationClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-glass-border bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-8">
        <button
          onClick={() => {
            onCategoryChange('all');
            onSearch('');
          }}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary hidden sm:block">
            InsightNewsFeed
          </span>
        </button>

        <div className="hidden lg:flex items-center flex-1">
          <SearchBar value={searchQuery} onChange={onSearch} />
        </div>

        <nav className="hidden lg:flex items-center flex-1 justify-center">
          <CategoryTabs active={category} onChange={onCategoryChange} />
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <NotificationBell count={notificationCount} onClick={onNotificationClick} />
          <ThemeToggle />
        </div>
      </div>

      <div className="lg:hidden border-t border-glass-border px-4 pb-3">
        <div className="flex items-center gap-3 pt-3">
          <SearchBar value={searchQuery} onChange={onSearch} />
        </div>
        <div className="mt-2">
          <CategoryTabs active={category} onChange={onCategoryChange} />
        </div>
      </div>
    </header>
  );
}
