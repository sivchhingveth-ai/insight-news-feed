'use client';

import { useState, useRef, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import { X, Send, Trash2, Settings, Sparkles, ExternalLink, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatPanelProps {
  onOpenSettings: () => void;
}

function getHasKey(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('insight_gemini_key');
}

export function AIChatPanel({ onOpenSettings }: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [hasKey, setHasKey] = useState(() => getHasKey());
  const { messages, isLoading, error, sendMessage, clearChat } = useAI();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpen = () => {
    setHasKey(getHasKey());
    setIsOpen(true);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 text-white"
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-50 flex w-[400px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-3rem)] flex-col rounded-2xl border border-glass-border bg-surface/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-glass-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-text-primary">Insight AI</span>
                  {hasKey && (
                    <span className="h-2 w-2 rounded-full bg-green-500" title="API key connected" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onOpenSettings}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {!hasKey && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                      <Key className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-sm font-medium text-text-primary mb-1">API Key Required</p>
                    <p className="text-xs text-text-secondary mb-4">
                      Add your free Gemini API key to start using AI
                    </p>
                    <button
                      onClick={onOpenSettings}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Add API Key
                    </button>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      Get free key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {hasKey && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-8 w-8 text-accent/40 mb-3" />
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
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-white/8 text-text-primary border border-glass-border'
                      }`}
                    >
                      {msg.text}
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
                    placeholder={hasKey ? 'Ask about the news...' : 'Set API key first...'}
                    disabled={!hasKey}
                    className="flex-1 rounded-xl bg-white/5 border border-glass-border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/40 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || !hasKey}
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
