export type Category =
  | 'all'
  | 'trending'
  | 'tech'
  | 'ai'
  | 'technology'
  | 'wars';

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
