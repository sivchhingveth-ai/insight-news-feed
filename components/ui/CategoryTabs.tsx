'use client';

import { Category } from '@/lib/types';
import { motion } from 'framer-motion';

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'trending', label: 'Trending' },
  { value: 'tech', label: 'Tech' },
  { value: 'ai', label: 'AI' },
  { value: 'technology', label: 'Technology' },
  { value: 'wars', label: 'Wars' },
];

interface CategoryTabsProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className="relative px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
          style={{ color: active === cat.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {active === cat.value && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 rounded-lg bg-white/10"
              style={{ background: 'var(--glass)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
