'use client';

import { Article } from '@/lib/types';
import { Ticker } from './Ticker';

interface HeroSectionProps {
  breakingNews: Article[];
}

export function HeroSection({ breakingNews }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tighter text-text-primary mb-4">
          Insight<span className="text-accent">News</span>Feed
        </h1>
        <p className="text-sm sm:text-lg text-text-secondary max-w-xl mb-8 sm:mb-10">
          Real-time news. Zero noise. Stay ahead with live updates from the sources you trust.
        </p>
      </div>

      {breakingNews.length > 0 && (
        <Ticker headlines={breakingNews.map((a) => a.title)} />
      )}
    </section>
  );
}
