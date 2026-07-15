'use client';

import { Category } from '@/lib/types';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryTabs } from '@/components/ui/CategoryTabs';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';

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
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-8">
        <button
          onClick={() => {
            onCategoryChange('all');
            onSearch('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <Image src="/icons/logo.png" alt="InsightNewsFeed" width={32} height={32} />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary hidden sm:block">
            InsightNewsFeed
          </span>
        </button>

        {/* Search always lives in the top row to save vertical space */}
        <div className="flex items-center flex-1 min-w-0">
          <SearchBar value={searchQuery} onChange={onSearch} />
        </div>

        {/* Category tabs sit inline on large screens */}
        <nav className="hidden lg:flex items-center flex-1 justify-center">
          <CategoryTabs active={category} onChange={onCategoryChange} />
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <NotificationBell count={notificationCount} onClick={onNotificationClick} />
          <ThemeToggle />
        </div>
      </div>

      {/* On smaller screens only the tabs drop to a second row */}
      <div className="lg:hidden border-t border-glass-border px-4 py-2 overflow-x-auto scrollbar-thin">
        <CategoryTabs active={category} onChange={onCategoryChange} />
      </div>
    </header>
  );
}
