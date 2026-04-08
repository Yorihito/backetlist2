'use client';

import { DEFAULT_CATEGORIES } from '@/types';

interface Props {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
          selected === null
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
        }`}
      >
        すべて
      </button>
      {DEFAULT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            selected === cat
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
