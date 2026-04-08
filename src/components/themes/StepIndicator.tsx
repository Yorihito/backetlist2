interface Props {
  current: number; // 0-indexed
  total: number;
}

export function StepIndicator({ current, total }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current
              ? 'w-8 bg-primary'
              : i < current
              ? 'w-2 bg-primary'
              : 'w-2 bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}
