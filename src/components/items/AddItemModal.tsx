'use client';

import { useState } from 'react';
import { BucketItemInput, DEFAULT_CATEGORIES, EmotionScore, UrgencyScore, calculatePriority, Priority, PRIORITY_LABELS } from '@/types';
import { PriorityQuiz } from './PriorityQuiz';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

interface Props {
  onClose: () => void;
  onSubmit: (input: BucketItemInput) => Promise<void>;
}

type Step = 1 | 2 | 3 | 4;

const PRIORITY_BUTTON_STYLES: Record<Priority, string> = {
  high: 'border-red-400 bg-red-50 text-red-700',
  medium: 'border-orange-400 bg-orange-50 text-orange-700',
  low: 'border-stone-300 bg-stone-50 text-stone-600',
};

export function AddItemModal({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [emotionScore, setEmotionScore] = useState<EmotionScore>(2);
  const [urgencyScore, setUrgencyScore] = useState<UrgencyScore>(2);
  const [priority, setPriority] = useState<Priority>('medium');
  const [loading, setLoading] = useState(false);

  function handleNextFromStep1() {
    if (!title.trim()) return;
    setStep(2);
  }

  function handleNextFromStep2() {
    setStep(3);
  }

  function handleNextFromStep3() {
    const calculated = calculatePriority(emotionScore, urgencyScore);
    setPriority(calculated);
    setStep(4);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), categories: selectedCategories, emotionScore, urgencyScore });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const stepTitles: Record<Step, string> = {
    1: 'やりたいことを教えてください',
    2: 'カテゴリを選んでください',
    3: 'もう少し教えてください',
    4: '重要度が設定されました',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-sm">STEP {step} / 4</span>
            <h2 className="text-lg font-bold text-text">{stepTitles[step]}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">タイトル <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：富士山に登る"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-text placeholder-stone-300 focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleNextFromStep1()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">詳細・メモ（任意）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="いつ、誰と、どんなふうにやりたいか…"
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-text placeholder-stone-300 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2.5 rounded-full border text-base transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <p className="w-full text-sm text-stone-400 mt-2">複数選択できます（スキップも可）</p>
            </div>
          )}

          {step === 3 && (
            <PriorityQuiz
              emotionScore={emotionScore}
              urgencyScore={urgencyScore}
              onChangeEmotion={setEmotionScore}
              onChangeUrgency={setUrgencyScore}
            />
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 py-4">
                <PriorityBadge priority={priority} size="md" />
                <p className="text-stone-500 text-sm">回答をもとに重要度を自動設定しました</p>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-600 mb-2">変更する場合はこちら</p>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${
                        priority === p
                          ? PRIORITY_BUTTON_STYLES[p]
                          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-base font-medium hover:bg-stone-50 transition-colors"
            >
              ← 戻る
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-base font-medium hover:bg-stone-50 transition-colors"
            >
              キャンセル
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={step === 1 ? handleNextFromStep1 : step === 2 ? handleNextFromStep2 : handleNextFromStep3}
              disabled={step === 1 && !title.trim()}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              次へ →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? '保存中...' : '保存する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
