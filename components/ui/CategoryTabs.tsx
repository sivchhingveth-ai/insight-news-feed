'use client';

import { Category } from '@/lib/types';
import { motion } from 'framer-motion';

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'trading', label: 'Trading' },
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
          className={`relative rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:bg-white/5 ${
            active === cat.value ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {active === cat.value && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 rounded-lg bg-white/10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
