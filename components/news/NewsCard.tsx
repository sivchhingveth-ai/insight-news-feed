'use client';

import Image from 'next/image';
import { Article } from '@/lib/types';
import { timeAgo, cn } from '@/lib/utils';
import { PulsingDot } from '@/components/ui/PulsingDot';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { SummarizeButton } from '@/components/ui/SummarizeButton';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useState, memo } from 'react';

interface NewsCardProps {
  article: Article;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onClick: (article: Article) => void;
  onSummarize: (article: Article) => void;
}

export const NewsCard = memo(function NewsCard({
  article,
  isBookmarked,
  onBookmarkToggle,
  onClick,
  onSummarize,
}: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = `https://picsum.photos/seed/${article.id}/800/450`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(article)}
      className={cn(
        'glass glass-hover group cursor-pointer overflow-hidden transition-all duration-300',
        article.isNew && 'glow-new'
      )}
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={imgError ? fallbackImg : article.imageUrl}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          {article.isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-accent backdrop-blur-sm">
              <PulsingDot className="h-1.5 w-1.5" />
              LIVE
            </span>
          )}
          {article.isNew && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
              NEW
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={() => onBookmarkToggle(article.id)}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Image
            src={article.sourceLogo}
            alt={article.source}
            width={20}
            height={20}
            className="h-5 w-5 rounded"
            unoptimized
          />
          <span className="text-xs font-medium text-text-secondary">
            {article.source}
          </span>
          <span className="text-text-secondary">·</span>
          <span className="text-xs text-text-secondary">
            {timeAgo(article.publishedAt)}
          </span>
        </div>

        <h3 className="mb-2 text-[15px] font-semibold leading-snug text-text-primary line-clamp-2 transition-colors group-hover:text-accent">
          {article.title}
        </h3>

        <p className="text-[13px] leading-relaxed text-text-secondary line-clamp-2">
          {article.summary}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <SummarizeButton onClick={() => onSummarize(article)} />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-glass-border bg-white/5 px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-all hover:bg-white/10 hover:text-text-primary"
          >
            Read
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.article>
  );
});
