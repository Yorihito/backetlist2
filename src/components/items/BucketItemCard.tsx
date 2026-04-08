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
}

export function BucketItemCard({ item, onUpdate, onDelete }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text leading-snug mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-3">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <PriorityBadge priority={item.priority} />
              {item.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-stone-50">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 py-2 text-sm text-stone-500 hover:text-primary hover:bg-green-50 rounded-xl transition-colors font-medium"
          >
            編集
          </button>
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
