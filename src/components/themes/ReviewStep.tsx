'use client';

import { Theme } from '@/data/themes';
import { Priority, PRIORITY_LABELS } from '@/types';

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

export function ReviewStep({ theme, answers, drafts, onChangeDrafts }: Props) {
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

      {/* アイテム作成 */}
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
