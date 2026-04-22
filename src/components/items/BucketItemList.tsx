'use client';

import { BucketItem } from '@/types';
import { BucketItemCard } from './BucketItemCard';

interface Props {
  items: BucketItem[];
  onUpdate: (itemId: string, updates: Partial<Pick<BucketItem, 'title' | 'description' | 'categories' | 'priority'>>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  onComplete: (itemId: string) => Promise<void>;
  onUncomplete: (itemId: string) => Promise<void>;
}

export function BucketItemList({ items, onUpdate, onDelete, onComplete, onUncomplete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">✦</div>
        <p className="text-stone-400 text-lg">まだやりたいことが登録されていません</p>
        <p className="text-stone-300 text-sm mt-1">「＋ 追加する」から始めてみましょう</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <BucketItemCard
          key={item.id}
          item={item}
          onUpdate={(updates) => onUpdate(item.id, updates)}
          onDelete={() => onDelete(item.id)}
          onComplete={() => onComplete(item.id)}
          onUncomplete={() => onUncomplete(item.id)}
        />
      ))}
    </div>
  );
}
