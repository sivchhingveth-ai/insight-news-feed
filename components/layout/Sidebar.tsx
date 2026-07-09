'use client';

import { trendingTopics, topSources } from '@/lib/mockData';
import { TrendingUp, Newspaper } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 space-y-5">
      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Market Movers</h3>
        </div>
        <ul className="space-y-3">
          {trendingTopics.map((item) => (
            <li key={item.topic}>
              <button className="w-full text-left group">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                  {item.topic}
                </p>
                <p className="text-xs text-text-secondary">{item.count}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Top Sources</h3>
        </div>
        <ul className="space-y-3">
          {topSources.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <span className="text-sm text-text-primary">{item.name}</span>
              <span className="text-xs text-text-secondary">{item.articles} articles</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
