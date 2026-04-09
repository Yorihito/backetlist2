'use client';

import { useState } from 'react';
import { Theme } from '@/data/themes';
import { Priority, PRIORITY_LABELS } from '@/types';
import { suggestBucketItems, Suggestion } from '@/lib/suggestItems';

export interface DraftItem {
  title: string;
  priority: Priority;
}

interface Props {
  theme: Theme;
  answers: Record<string, string>;
  drafts: DraftItem[];
  onChangeDrafts: (drafts: DraftItem[]) => void;
}

const PRIORITY_BUTTON_STYLES: Record<Priority, string> = {
  high: 'border-red-400 bg-red-50 text-red-700',
  medium: 'border-orange-400 bg-orange-50 text-orange-700',
  low: 'border-stone-300 bg-stone-50 text-stone-600',
};

const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  high: 'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-orange-50 text-orange-600 border border-orange-200',
  low: 'bg-stone-50 text-stone-500 border border-stone-200',
};

export function ReviewStep({ theme, answers, drafts, onChangeDrafts }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  function updateDraft(index: number, updates: Partial<DraftItem>) {
    const next = drafts.map((d, i) => (i === index ? { ...d, ...updates } : d));
    onChangeDrafts(next);
  }

  function addDraft() {
    onChangeDrafts([...drafts, { title: '', priority: 'medium' }]);
  }

  function removeDraft(index: number) {
    onChangeDrafts(drafts.filter((_, i) => i !== index));
  }

  function addSuggestionToDrafts(suggestion: Suggestion, index: number) {
    onChangeDrafts([...drafts, { title: suggestion.title, priority: suggestion.priority }]);
    setAddedIndices((prev) => new Set(prev).add(index));
  }

  async function handleSuggest() {
    setLoadingSuggestions(true);
    setSuggestionError(null);
    setSuggestions([]);
    setAddedIndices(new Set());
    try {
      const results = await suggestBucketItems(theme, answers);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
      setSuggestionError('提案の取得に失敗しました。しばらく待ってから再度お試しください。');
    } finally {
      setLoadingSuggestions(false);
    }
  }

  const hasAnswers = Object.values(answers).some((a) => a.trim().length > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 回答の振り返り */}
      <section>
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-3">あなたの答え</h3>
        <div className="flex flex-col gap-3">
          {theme.questions.map((q, i) => {
            const ans = answers[q.id];
            if (!ans || !ans.trim()) return null;
            return (
              <div key={q.id} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <p className="text-xs text-stone-500 mb-1">Q{i + 1}</p>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{ans}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI提案セクション */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text">AIにアイデアを提案してもらう</h3>
        </div>
        <p className="text-sm text-stone-500">
          回答をもとに、あなたに合いそうなやりたいことの候補をAIが考えます。
        </p>

        {suggestions.length === 0 && !loadingSuggestions && (
          <button
            onClick={handleSuggest}
            disabled={!hasAnswers}
            className="w-full py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary font-medium text-sm hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>✨</span>
            <span>AIに候補を提案してもらう</span>
          </button>
        )}

        {loadingSuggestions && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone-400">あなたの答えをもとに考えています…</p>
          </div>
        )}

        {suggestionError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {suggestionError}
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => {
              const added = addedIndices.has(i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-opacity ${
                    added ? 'opacity-40' : 'border-stone-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-text leading-snug ${added ? 'line-through' : ''}`}>
                      {s.title}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${PRIORITY_BADGE_STYLES[s.priority]}`}>
                      重要度 {PRIORITY_LABELS[s.priority]}
                    </span>
                  </div>
                  <button
                    onClick={() => addSuggestionToDrafts(s, i)}
                    disabled={added}
                    className="flex-shrink-0 text-sm font-medium text-primary hover:underline disabled:text-stone-300 disabled:no-underline"
                  >
                    {added ? '追加済み' : '＋ 追加'}
                  </button>
                </div>
              );
            })}
            <button
              onClick={handleSuggest}
              className="text-sm text-stone-400 hover:text-stone-600 text-center py-1 transition-colors"
            >
              別の候補を提案してもらう
            </button>
          </div>
        )}
      </section>

      {/* アイテム手動入力 */}
      <section>
        <h3 className="text-base font-bold text-text mb-1">
          ここから浮かんだ「やりたいこと」はありますか？
        </h3>
        <p className="text-sm text-stone-500 mb-4">
          思いついたことを書いてみましょう。後から追加・編集もできます。
        </p>

        <div className="flex flex-col gap-3">
          {drafts.map((draft, index) => (
            <div key={index} className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => updateDraft(index, { title: e.target.value })}
                  placeholder="例：孫と一緒に北海道旅行に行く"
                  className="flex-1 text-base text-text placeholder-stone-300 focus:outline-none"
                />
                <button
                  onClick={() => removeDraft(index)}
                  className="text-stone-300 hover:text-stone-500 text-lg leading-none px-1"
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateDraft(index, { priority: p })}
                    className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors ${
                      draft.priority === p
                        ? PRIORITY_BUTTON_STYLES[p]
                        : 'border-stone-200 bg-white text-stone-400'
                    }`}
                  >
                    重要度 {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addDraft}
            className="py-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 text-sm hover:border-primary hover:text-primary transition-colors"
          >
            ＋ もう一つ追加
          </button>
        </div>
      </section>
    </div>
  );
}
