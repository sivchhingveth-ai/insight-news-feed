export type Category =
  | 'all'
  | 'trading'
  | 'tech'
  | 'ai'
  | 'technology'
  | 'wars';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  /** Full text sent to the AI (e.g. with article context); `text` is what the UI shows. */
  promptText?: string;
  /** Article metadata for rendering image/link in the chat. */
  articleUrl?: string;
  articleImage?: string;
  articleTitle?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  source: string;
  sourceLogo: string;
  category: Category;
  /** All categories this article belongs to (an article can match several tabs). */
  categories?: Category[];
  imageUrl: string;
  publishedAt: string;
  url: string;
  isLive: boolean;
  isNew: boolean;
  isExpired: boolean;
}
