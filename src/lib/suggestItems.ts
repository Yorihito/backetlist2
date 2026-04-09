import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from './firebase';
import { Theme } from '@/data/themes';

export interface Suggestion {
  title: string;
  priority: 'high' | 'medium' | 'low';
}

export async function suggestBucketItems(
  theme: Theme,
  answers: Record<string, string>
): Promise<Suggestion[]> {
  const fn = httpsCallable<unknown, { suggestions: Suggestion[] }>(
    getFirebaseFunctions(),
    'suggestBucketItems'
  );

  const questions = theme.questions.map((q) => ({
    prompt: q.prompt,
    answer: answers[q.id] ?? '',
  }));

  const result = await fn({
    themeTitle: theme.title,
    themeDescription: theme.description,
    questions,
  });

  return result.data.suggestions;
}
