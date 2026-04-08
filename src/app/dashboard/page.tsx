'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useBucketItems } from '@/hooks/useBucketItems';
import { useAllThemeProgress } from '@/hooks/useThemeProgress';
import { signOut } from '@/lib/auth';
import { BucketItemList } from '@/components/items/BucketItemList';
import { AddItemModal } from '@/components/items/AddItemModal';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { ThemeList } from '@/components/themes/ThemeList';
import { THEMES } from '@/data/themes';
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
  const { items, loading: itemsLoading, error, addFromQuiz, updateItem, deleteItem } = useBucketItems();
  const { progressMap } = useAllThemeProgress();

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

  const completedThemeCount = Array.from(progressMap.values()).filter((p) => p.status === 'completed').length;

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

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-10">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ようこそメッセージ */}
        <section className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-text leading-snug">
            {user.displayName ? `こんにちは、${user.displayName}さん` : 'ようこそ'}
          </h2>
          <p className="text-stone-500 leading-relaxed">
            いくつかの質問に答えながら、これからやりたいことを一緒に見つけていきましょう。
          </p>
        </section>

        {/* テーマセクション */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">考えてみるテーマ</h2>
              <p className="text-sm text-stone-500 mt-0.5">
                気になるテーマから始めてみましょう
              </p>
            </div>
            <p className="text-sm text-stone-400 flex-shrink-0">
              {completedThemeCount} / {THEMES.length} 完了
            </p>
          </div>
          <ThemeList progressMap={progressMap} />
        </section>

        {/* マイバケットリスト */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">マイバケットリスト</h2>
              <p className="text-sm text-stone-500 mt-0.5">これまでに集まったやりたいこと</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="text-sm text-primary font-medium hover:underline flex-shrink-0"
            >
              ＋ 直接追加
            </button>
          </div>

          {/* フィルター */}
          {items.length > 0 && (
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
              <p className="text-sm text-stone-400">
                {filteredItems.length} 件
                {(categoryFilter || priorityFilter !== 'all') && ` / 全 ${items.length} 件`}
              </p>
            </div>
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
        </section>
      </main>

      {/* 追加モーダル */}
      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onSubmit={addFromQuiz}
        />
      )}
    </div>
  );
}
