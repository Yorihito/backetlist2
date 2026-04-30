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
import { Priority, BucketItem } from '@/types';

const PRIORITY_FILTER_OPTIONS: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

type CompletionFilter = 'all' | 'pending' | 'completed';

type SortKey = 'createdAt_desc' | 'createdAt_asc' | 'priority_desc' | 'priority_asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'createdAt_desc', label: '追加日（新しい順）' },
  { value: 'createdAt_asc', label: '追加日（古い順）' },
  { value: 'priority_desc', label: '重要度（高い順）' },
  { value: 'priority_asc', label: '重要度（低い順）' },
];

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortItems(items: BucketItem[], key: SortKey): BucketItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'createdAt_desc': return b.createdAt.getTime() - a.createdAt.getTime();
      case 'createdAt_asc':  return a.createdAt.getTime() - b.createdAt.getTime();
      case 'priority_desc':  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'priority_asc':   return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    }
  });
}

const COMPLETION_FILTER_OPTIONS: { value: CompletionFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'pending', label: '未達成' },
  { value: 'completed', label: '達成済み' },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading: itemsLoading, error, addFromQuiz, updateItem, deleteItem, completeItem, uncompleteItem } = useBucketItems();
  const { progressMap } = useAllThemeProgress();

  const [showAdd, setShowAdd] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt_desc');
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

  const completedCount = items.filter((item) => !!item.completedAt).length;

  const filteredItems = sortItems(
    items.filter((item) => {
      const matchCategory = !categoryFilter || item.categories.includes(categoryFilter);
      const matchPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchCompletion =
        completionFilter === 'all' ||
        (completionFilter === 'completed' && !!item.completedAt) ||
        (completionFilter === 'pending' && !item.completedAt);
      return matchCategory && matchPriority && matchCompletion;
    }),
    sortKey,
  );

  const completedThemeCount = Array.from(progressMap.values()).filter((p) => p.status === 'completed').length;

  const hasActiveFilter = !!(categoryFilter || priorityFilter !== 'all' || completionFilter !== 'all');

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

        {/* 達成状況サマリー */}
        {items.length > 0 && (
          <section className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <h2 className="text-sm font-medium text-stone-500 mb-3">達成状況</h2>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-primary">{completedCount}</span>
              <span className="text-stone-400 text-lg mb-1">/ {items.length} 件達成</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: items.length > 0 ? `${Math.round((completedCount / items.length) * 100)}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-2 text-right">
              {items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}% 完了
            </p>
          </section>
        )}

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
                <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">達成状況</p>
                <div className="flex flex-wrap gap-2">
                  {COMPLETION_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCompletionFilter(opt.value)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        completionFilter === opt.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
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
              <div>
                <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wide">並び順</p>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="text-sm px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-stone-400 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-stone-400">
                {filteredItems.length} 件
                {hasActiveFilter && ` / 全 ${items.length} 件`}
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
              onComplete={completeItem}
              onUncomplete={uncompleteItem}
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
