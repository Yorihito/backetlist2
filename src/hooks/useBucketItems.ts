import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeBucketItems, addBucketItem, updateBucketItem, deleteBucketItem } from '@/lib/firestore';
import { BucketItem, BucketItemInput } from '@/types';

export function useBucketItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeBucketItems(user.uid, (items) => {
      setItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function addItem(input: BucketItemInput) {
    if (!user) return;
    try {
      await addBucketItem(user.uid, input);
    } catch {
      setError('追加に失敗しました。もう一度お試しください。');
    }
  }

  async function updateItem(
    itemId: string,
    updates: Partial<Pick<BucketItem, 'title' | 'description' | 'categories' | 'priority' | 'emotionScore' | 'urgencyScore'>>
  ) {
    if (!user) return;
    try {
      await updateBucketItem(user.uid, itemId, updates);
    } catch {
      setError('更新に失敗しました。もう一度お試しください。');
    }
  }

  async function deleteItem(itemId: string) {
    if (!user) return;
    try {
      await deleteBucketItem(user.uid, itemId);
    } catch {
      setError('削除に失敗しました。もう一度お試しください。');
    }
  }

  return { items, loading, error, addItem, updateItem, deleteItem };
}
