'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative flex items-center"
      animate={{ scale: focused ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="absolute left-3 z-10 flex items-center justify-center pointer-events-none"
        animate={{ scale: focused ? 1.1 : 1, rotate: focused ? -8 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      >
        <Search
          className={`h-4 w-4 transition-colors duration-200 ${
            focused ? 'text-accent' : 'text-text-secondary'
          }`}
        />
      </motion.div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search news..."
        className={`h-10 rounded-xl bg-transparent border pl-9 pr-8 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-[width,border-color,box-shadow] duration-300 ease-out w-full lg:w-56 ${
          focused
            ? 'border-accent/50 shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:w-72'
            : 'border-glass-border'
        }`}
      />

      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange('')}
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
