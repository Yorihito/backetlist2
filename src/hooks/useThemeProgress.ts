import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeAllThemeProgress,
  subscribeThemeProgress,
  saveThemeAnswers,
} from '@/lib/firestore';
import { ThemeProgress } from '@/types';

/** 全テーマの進捗を購読（ダッシュボード用） */
export function useAllThemeProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ThemeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeAllThemeProgress(user.uid, (items) => {
      setProgress(items);
      setLoading(false);
    });
  }, [user]);

  const progressMap = new Map(progress.map((p) => [p.themeId, p]));
  return { progress, progressMap, loading };
}

/** 特定テーマの進捗を購読（テーマページ用） */
export function useThemeProgress(themeId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ThemeProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeThemeProgress(user.uid, themeId, (p) => {
      setProgress(p);
      setLoading(false);
    });
  }, [user, themeId]);

  async function save(answers: Record<string, string>, status: 'in_progress' | 'completed') {
    if (!user) return;
    await saveThemeAnswers(user.uid, themeId, answers, status);
  }

  return { progress, loading, save };
}
