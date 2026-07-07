'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink, Check, Copy, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && <SettingsContent onClose={onClose} />}
    </AnimatePresence>
  );
}

function SettingsContent({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('insight_gemini_key') || '';
  });
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    localStorage.setItem('insight_gemini_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApiKey(text);
      inputRef.current?.focus();
    } catch {
      // clipboard access denied
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-glass-border bg-surface/95 backdrop-blur-xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Setup Insight AI</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-accent/5 border border-accent/10 p-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-text-primary">3 quick steps:</span>
              <br />
              1. Click &ldquo;Get free key&rdquo; below
              <br />
              2. Copy your API key
              <br />
              3. Paste &amp; save here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="AIza..."
                className="flex-1 rounded-xl bg-white/5 border border-glass-border px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button
                onClick={handlePaste}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-glass-border text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                title="Paste from clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-text-secondary">
                Free tier: 15 req/min, 1M tokens/day
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline inline-flex items-center gap-1"
              >
                Get free key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved! Restarting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Save & Start Using AI
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
