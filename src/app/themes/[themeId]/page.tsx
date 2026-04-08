import { THEMES } from '@/data/themes';
import { ThemePageClient } from './ThemePageClient';

export function generateStaticParams() {
  return THEMES.map((theme) => ({ themeId: theme.id }));
}

export const dynamicParams = false;

export default async function ThemePage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  return <ThemePageClient themeId={themeId} />;
}
