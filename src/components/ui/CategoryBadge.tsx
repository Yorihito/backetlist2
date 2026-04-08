interface Props {
  category: string;
}

export function CategoryBadge({ category }: Props) {
  return (
    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
      {category}
    </span>
  );
}
