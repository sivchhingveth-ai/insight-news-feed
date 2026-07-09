'use client';

import Image from 'next/image';
import { Article } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { PulsingDot } from '@/components/ui/PulsingDot';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { SummarizeButton } from '@/components/ui/SummarizeButton';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Newspaper, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NewsSlideOverProps {
  article: Article | null;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onClose: () => void;
  onSummarize: (article: Article) => void;
}

export function NewsSlideOver({
  article,
  isBookmarked,
  onBookmarkToggle,
  onClose,
  onSummarize,
}: NewsSlideOverProps) {
  const [imgError, setImgError] = useState(false);
  const [fullContent, setFullContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!article) return;
    document.body.style.overflow = 'hidden';

    const controller = new AbortController();

    fetch(`/api/article?url=${encodeURIComponent(article.url)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.content && data.content.length > 50) {
          setFullContent(data.content);
        } else {
          setContentError(true);
        }
      })
      .catch(() => setContentError(true))
      .finally(() => setLoadingContent(false));

    return () => {
      document.body.style.overflow = '';
      controller.abort();
    };
  }, [article]);

  const displayContent = fullContent || article?.fullContent || '';

  return (
    <AnimatePresence>
      {article && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-glass-border bg-surface/95 backdrop-blur-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-glass-border bg-surface/80 backdrop-blur-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{article.sourceLogo}</span>
                <span className="text-sm font-medium text-text-secondary">{article.source}</span>
                {article.isLive && (
                  <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    <PulsingDot className="h-1.5 w-1.5" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <BookmarkButton
                  isBookmarked={isBookmarked}
                  onToggle={() => onBookmarkToggle(article.id)}
                />
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="h-[calc(100vh-64px)] overflow-y-auto">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={imgError ? `https://picsum.photos/seed/${article.id}/800/450` : article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 512px"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-xs text-text-secondary">
                  <span>{timeAgo(article.publishedAt)}</span>
                  <span>·</span>
                  <span className="capitalize">{article.category}</span>
                </div>

                <h2 className="text-2xl font-bold leading-tight text-text-primary mb-4">
                  {article.title}
                </h2>

                <div className="mb-6 rounded-xl border border-glass-border bg-white/5 p-4">
                  {loadingContent ? (
                    <div className="flex items-center gap-3 py-4 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-accent" />
                      <span className="text-sm text-text-secondary">Loading full article...</span>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed text-text-secondary space-y-3">
                      {displayContent.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  )}
                </div>

                {contentError && !loadingContent && (
                  <p className="text-xs text-text-secondary mb-4 text-center">
                    Full text unavailable — tap below to read on the source site.
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <SummarizeButton
                    onClick={() => onSummarize(article)}
                    size="md"
                  />
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
                  >
                    <Newspaper className="h-4 w-4" />
                    Read full article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-4 rounded-xl border border-glass-border bg-white/5 p-3">
                  <p className="text-[11px] text-text-secondary">
                    Source:{' '}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {article.source}
                    </a>
                    {' '}· Opens in new tab
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
