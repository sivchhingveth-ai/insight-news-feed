'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { X, Send, Eraser } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedMessage } from './FormattedMessage';
import Image from 'next/image';

interface AIChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onOpen: () => void;
  onClose: () => void;
  onSend: (text: string) => void;
  onClear: () => void;
}

export function AIChatPanel({
  isOpen,
  messages,
  isLoading,
  error,
  onOpen,
  onClose,
  onSend,
  onClear,
}: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpen}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#0a0a0a] shadow-[0_0_20px_rgba(139,92,246,0.5),0_0_40px_rgba(139,92,246,0.3)] text-white overflow-hidden"
        aria-label="Open AI assistant"
      >
        <Image src="/icons/chat-ai.jpg" alt="AI Chat" width={40} height={40} className="object-cover" unoptimized />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-2 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex w-auto sm:w-[400px] h-auto sm:h-[560px] sm:max-h-[calc(100vh-3rem)] flex-col rounded-2xl border border-glass-border bg-surface/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-glass-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image src="/icons/chat-ai.jpg" alt="AI" width={20} height={20} className="rounded" unoptimized />
                  <span className="text-sm font-semibold text-text-primary">Noviq AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onClear}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                    title="Clear chat"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Image src="/icons/chat-ai.jpg" alt="AI" width={60} height={60} className="rounded-xl mb-3 opacity-60" unoptimized />
                    <p className="text-sm text-text-secondary mb-1">Ask me about any news</p>
                    <p className="text-xs text-text-secondary/60">
                      Click &ldquo;Summarize&rdquo; on an article, or type a question below
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-accent text-white whitespace-pre-wrap'
                          : 'bg-white/8 text-text-primary border border-glass-border'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.articleImage && (
                        <a href={msg.articleUrl} target="_blank" rel="noopener noreferrer" className="block mb-2 -mx-1 -mt-1">
                          <Image
                            src={msg.articleImage}
                            alt={msg.articleTitle || 'Article'}
                            width={400}
                            height={200}
                            className="rounded-lg w-full h-auto object-cover max-h-40"
                            unoptimized
                          />
                        </a>
                      )}
                      {msg.role === 'user' ? msg.text : <FormattedMessage text={msg.text} />}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-white/8 border border-glass-border px-3.5 py-2.5">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-sm text-red-400">
                    {error}
                  </div>
                )}
              </div>

              <div className="border-t border-glass-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about the news..."
                    className="flex-1 rounded-xl bg-white/5 border border-glass-border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/40 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
