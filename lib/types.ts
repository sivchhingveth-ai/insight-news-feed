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
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  source: string;
  sourceLogo: string;
  category: Category;
  imageUrl: string;
  publishedAt: string;
  url: string;
  isLive: boolean;
  isNew: boolean;
  isExpired: boolean;
}
