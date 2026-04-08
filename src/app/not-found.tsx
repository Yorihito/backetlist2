import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">✦</div>
      <h1 className="text-2xl font-bold text-text mb-2">ページが見つかりません</h1>
      <p className="text-text-muted mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
      >
        バケットリストに戻る
      </Link>
    </main>
  );
}
