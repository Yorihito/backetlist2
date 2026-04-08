'use client';

import Link from 'next/link';
import { Theme } from '@/data/themes';
import { ThemeProgress } from '@/types';

interface Props {
  theme: Theme;
  progress: ThemeProgress | undefined;
}

export function ThemeCard({ theme, progress }: Props) {
  const status = progress?.status ?? 'not_started';
  const answeredCount = progress
    ? Object.values(progress.answers).filter((a) => a && a.trim().length > 0).length
    : 0;
  const totalQuestions = theme.questions.length;

  const statusLabel =
    status === 'completed'
      ? '完了 ✓'
      : status === 'in_progress'
      ? `回答中 ${answeredCount}/${totalQuestions}`
      : '未着手';

  const statusStyle =
    status === 'completed'
      ? 'text-primary bg-green-50 border-green-200'
      : status === 'in_progress'
      ? 'text-orange-700 bg-orange-50 border-orange-200'
      : 'text-stone-500 bg-stone-50 border-stone-200';

  return (
    <Link
      href={`/themes/${theme.id}`}
      className="block bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md hover:border-stone-200 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 leading-none">{theme.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text leading-snug mb-1">{theme.title}</h3>
          <p className="text-sm text-stone-500 leading-relaxed mb-3 line-clamp-2">{theme.description}</p>
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
