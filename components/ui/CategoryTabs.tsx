'use client';

import { Category } from '@/lib/types';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = maxScroll > 0;
    setIsOverflowing(overflow);

    if (!overflow) {
      setThumbLeft(0);
      setThumbWidth(0);
      return;
    }
    const trackWidth = clientWidth;
    const barWidth = Math.max(30, (clientWidth / scrollWidth) * trackWidth);
    const barLeft = (scrollLeft / maxScroll) * (trackWidth - barWidth);
    setThumbLeft(barLeft);
    setThumbWidth(barWidth);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    updateThumb();
    return () => {
      el.removeEventListener('scroll', updateThumb);
      ro.disconnect();
    };
  }, [updateThumb]);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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

      {/* Scroll indicator bar — only visible when content overflows */}
      {isOverflowing && (
        <div className="relative mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="absolute top-0 h-full rounded-full bg-accent/50"
            animate={{ left: thumbLeft, width: thumbWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      )}
    </div>
  );
}
