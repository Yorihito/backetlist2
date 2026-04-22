'use client';

import { useState } from 'react';
import { BucketItem } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { EditItemModal } from './EditItemModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Props {
  item: BucketItem;
  onUpdate: (updates: Partial<Pick<BucketItem, 'title' | 'description' | 'categories' | 'priority'>>) => Promise<void>;
  onDelete: () => Promise<void>;
  onComplete: () => Promise<void>;
  onUncomplete: () => Promise<void>;
}

export function BucketItemCard({ item, onUpdate, onDelete, onComplete, onUncomplete }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isCompleted = !!item.completedAt;

  async function handleToggleComplete() {
    setToggling(true);
    try {
      if (isCompleted) {
        await onUncomplete();
      } else {
        await onComplete();
      }
    } finally {
      setToggling(false);
    }
  }

  return (
    <>
      <div className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
        isCompleted
          ? 'bg-stone-50 border-stone-100 opacity-80'
          : 'bg-white border-stone-100'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  ✓ 達成済み
                </span>
              )}
              <h3 className={`text-lg font-bold leading-snug ${
                isCompleted ? 'line-through text-stone-400' : 'text-text'
              }`}>
                {item.title}
              </h3>
            </div>
            {item.description && (
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {!isCompleted && <PriorityBadge priority={item.priority} />}
              {item.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>
            {isCompleted && item.completedAt && (
              <p className="text-xs text-stone-400">
                {item.completedAt.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}に達成
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-stone-50">
          <button
            onClick={handleToggleComplete}
            disabled={toggling}
            className={`flex-1 py-2 text-sm rounded-xl transition-colors font-medium disabled:opacity-50 ${
              isCompleted
                ? 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                : 'text-green-700 hover:bg-green-50 bg-green-50/50'
            }`}
          >
            {toggling ? '更新中...' : isCompleted ? '未達成に戻す' : '達成！'}
          </button>
          {!isCompleted && (
            <button
              onClick={() => setShowEdit(true)}
              className="flex-1 py-2 text-sm text-stone-500 hover:text-primary hover:bg-green-50 rounded-xl transition-colors font-medium"
            >
              編集
            </button>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="flex-1 py-2 text-sm text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            削除
          </button>
        </div>
      </div>

      {showEdit && (
        <EditItemModal
          item={item}
          onClose={() => setShowEdit(false)}
          onSubmit={onUpdate}
        />
      )}
      {showDelete && (
        <DeleteConfirmDialog
          title={item.title}
          onClose={() => setShowDelete(false)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
}
