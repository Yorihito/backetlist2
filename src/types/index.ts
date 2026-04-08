export type Priority = 'high' | 'medium' | 'low';

export type EmotionScore = 1 | 2 | 3;
export type UrgencyScore = 1 | 2 | 3;

export const DEFAULT_CATEGORIES = [
  '旅行',
  '学び',
  '経験',
  '人間関係',
  '健康・フィットネス',
  '趣味・創作',
  'その他',
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  priority: Priority;
  emotionScore: EmotionScore;
  urgencyScore: UrgencyScore;
  createdAt: Date;
  updatedAt: Date;
}

export interface BucketItemInput {
  title: string;
  description: string;
  categories: string[];
  emotionScore: EmotionScore;
  urgencyScore: UrgencyScore;
}

export function calculatePriority(emotionScore: EmotionScore, urgencyScore: UrgencyScore): Priority {
  const sum = emotionScore + urgencyScore;
  if (sum >= 5) return 'high';
  if (sum >= 3) return 'medium';
  return 'low';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};
