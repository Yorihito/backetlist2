import { Priority, PRIORITY_LABELS } from '@/types';

const STYLES: Record<Priority, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-orange-50 text-orange-700 border-orange-200',
  low: 'bg-stone-100 text-stone-500 border-stone-200',
};

const DOTS: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-400',
  low: 'bg-stone-400',
};

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: Props) {
  const textSize = size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${textSize} ${STYLES[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[priority]}`} />
      重要度：{PRIORITY_LABELS[priority]}
    </span>
  );
}
