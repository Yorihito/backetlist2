'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTheme } from '@/data/themes';
import { useAuth } from '@/hooks/useAuth';
import { useThemeProgress } from '@/hooks/useThemeProgress';
import { useBucketItems } from '@/hooks/useBucketItems';
import { StepIndicator } from '@/components/themes/StepIndicator';
import { QuestionStep } from '@/components/themes/QuestionStep';
import { ReviewStep, DraftItem } from '@/components/themes/ReviewStep';

interface Props {
  themeId: string;
}

export function ThemePageClient({ themeId }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const { progress, loading: progressLoading, save } = useThemeProgress(themeId);
  const { addFromTheme } = useBucketItems();

  const [step, setStep] = useState(0); // 0..(questions.length) — last step is review
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<DraftItem[]>([{ title: '', priority: 'medium' }]);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // 認証リダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // 保存済みの回答をロード
  useEffect(() => {
    if (progressLoading) return;
    if (progress && !hydrated) {
      setAnswers(progress.answers ?? {});
      setHydrated(true);
    } else if (!progress && !hydrated) {
      setHydrated(true);
    }
  }, [progress, progressLoading, hydrated]);

  if (authLoading || !user || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!theme) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-text-muted mb-4">テーマが見つかりません</p>
        <Link href="/dashboard" className="text-primary font-medium">ダッシュボードに戻る</Link>
      </main>
    );
  }

  const totalSteps = theme.questions.length + 1; // questions + review
  const isReview = step === theme.questions.length;
  const currentQuestion = isReview ? null : theme.questions[step];

  function updateAnswer(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  async function handleNext() {
    setSaving(true);
    try {
      // 現時点の回答を保存（途中でも）
      await save(answers, 'in_progress');
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleBack() {
    if (step === 0) {
      router.push('/dashboard');
      return;
    }
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleComplete() {
    if (!theme) return;
    setSaving(true);
    try {
      // 回答を完了として保存
      await save(answers, 'completed');

      // ドラフトアイテムをバケットリストに追加
      const validDrafts = drafts.filter((d) => d.title.trim().length > 0);
      for (const draft of validDrafts) {
        await addFromTheme({
          title: draft.title.trim(),
          categories: [theme.defaultCategory],
          priority: draft.priority,
          sourceThemeId: theme.id,
        });
      }

      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-600 text-xl leading-none">
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{theme.emoji}</span>
              <h1 className="text-base font-bold text-text truncate">{theme.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* ステップインジケータ */}
      <div className="max-w-2xl mx-auto px-4 pt-5 flex justify-center">
        <StepIndicator current={step} total={totalSteps} />
      </div>

      {/* 本体 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isReview ? (
          <ReviewStep theme={theme} answers={answers} drafts={drafts} onChangeDrafts={setDrafts} />
        ) : (
          currentQuestion && (
            <QuestionStep
              question={currentQuestion}
              questionNumber={step + 1}
              totalQuestions={theme.questions.length}
              answer={answers[currentQuestion.id] ?? ''}
              onChange={updateAnswer}
            />
          )
        )}
      </main>

      {/* フッター */}
      <footer className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          <button
            onClick={handleBack}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-base font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            {step === 0 ? 'やめる' : '← 戻る'}
          </button>
          {isReview ? (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? '保存中...' : '完了する'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? '保存中...' : '次へ →'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
