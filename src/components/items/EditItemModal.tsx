'use client';

import { useState } from 'react';
import { BucketItem, DEFAULT_CATEGORIES, Priority, PRIORITY_LABELS } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';

interface Props {
  item: BucketItem;
  onClose: () => void;
  onSubmit: (updates: Partial<Pick<BucketItem, 'title' | 'description' | 'categories' | 'priority'>>) => Promise<void>;
}

const PRIORITY_BUTTON_STYLES: Record<Priority, string> = {
  high: 'border-red-400 bg-red-50 text-red-700',
  medium: 'border-orange-400 bg-orange-50 text-orange-700',
  low: 'border-stone-300 bg-stone-50 text-stone-600',
};

export function EditItemModal({ item, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(item.categories);
  const [priority, setPriority] = useState<Priority>(item.priority);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), categories: selectedCategories, priority });
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-text">やりたいことを編集</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">タイトル <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-text focus:outline-none focus:border-primary"
            />
          </div>

          {/* 詳細 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">詳細・メモ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-text focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-2 rounded-full border text-sm transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 重要度 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">重要度</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                    priority === p
                      ? PRIORITY_BUTTON_STYLES[p]
                      : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <PriorityBadge priority={priority} />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-base font-medium hover:bg-stone-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
