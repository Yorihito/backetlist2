'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useBucketItems } from '@/hooks/useBucketItems';
import { signOut } from '@/lib/auth';
import { BucketItemList } from '@/components/items/BucketItemList';
import { AddItemModal } from '@/components/items/AddItemModal';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { Priority } from '@/types';

const PRIORITY_FILTER_OPTIONS: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading: itemsLoading, error, addItem, updateItem, deleteItem } = useBucketItems();

  const [showAdd, setShowAdd] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setSigningOut(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const filteredItems = items.filter((item) => {
    const matchCategory = !categoryFilter || item.categories.includes(categoryFilter);
    const matchPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchCategory && matchPriority;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text">✦ バケットリスト</h1>
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? 'ユーザー'}
                width={36}
                height={36}
                className="rounded-full border border-stone-200"
              />
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm text-stone-500 hover:text-stone-700 disabled:opacity-50 transition-colors"
            >
              {signingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* 追加ボタン */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-primary text-primary text-base font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">＋</span>
          やりたいことを追加する
        </button>

        {/* フィルター */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">カテゴリ</p>
            <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">重要度</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    priorityFilter === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 件数表示 */}
        {!itemsLoading && (
          <p className="text-sm text-stone-400">
            {filteredItems.length} 件
            {(categoryFilter || priorityFilter !== 'all') && ` / 全 ${items.length} 件`}
          </p>
        )}

        {/* リスト */}
        {itemsLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <BucketItemList
            items={filteredItems}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
      </main>

      {/* 追加モーダル */}
      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onSubmit={addItem}
        />
      )}
    </div>
  );
}
