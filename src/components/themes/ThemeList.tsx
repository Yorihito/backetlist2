'use client';

import { THEMES } from '@/data/themes';
import { ThemeProgress } from '@/types';
import { ThemeCard } from './ThemeCard';

interface Props {
  progressMap: Map<string, ThemeProgress>;
}

export function ThemeList({ progressMap }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {THEMES.map((theme) => (
        <ThemeCard key={theme.id} theme={theme} progress={progressMap.get(theme.id)} />
      ))}
    </div>
  );
}
