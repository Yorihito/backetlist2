'use client';

import { useState } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({ title, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h2 className="text-lg font-bold text-text mb-1">削除しますか？</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            「<span className="font-medium text-text">{title}</span>」を削除します。<br />この操作は元に戻せません。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-base font-medium hover:bg-stone-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-base font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}
