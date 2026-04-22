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
  /** 直接追加モーダルのクイズ経由で作られた場合のみ値あり */
  emotionScore?: EmotionScore;
  urgencyScore?: UrgencyScore;
  /** テーマ由来のアイテムならテーマID、直接追加ならundefined */
  sourceThemeId?: string;
  /** 達成日時。未設定なら未達成 */
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 直接追加フロー（クイズ経由）の入力 */
export interface BucketItemQuizInput {
  title: string;
  description: string;
  categories: string[];
  emotionScore: EmotionScore;
  urgencyScore: UrgencyScore;
}

/** テーマ経由の入力 */
export interface BucketItemThemeInput {
  title: string;
  description?: string;
  categories: string[];
  priority: Priority;
  sourceThemeId: string;
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

// ===== テーマ進捗 =====

export type ThemeStatus = 'not_started' | 'in_progress' | 'completed';

export interface ThemeProgress {
  themeId: string;
  /** 質問ID → 回答テキスト */
  answers: Record<string, string>;
  status: ThemeStatus;
  completedAt?: Date;
  updatedAt: Date;
}
