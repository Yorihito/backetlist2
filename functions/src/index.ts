import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

interface QuestionAnswer {
  prompt: string;
  answer: string;
}

interface SuggestInput {
  themeTitle: string;
  themeDescription: string;
  questions: QuestionAnswer[];
}

interface Suggestion {
  title: string;
  priority: 'high' | 'medium' | 'low';
}

export const suggestBucketItems = onCall(
  { secrets: [anthropicApiKey], region: 'asia-northeast1' },
  async (request): Promise<{ suggestions: Suggestion[] }> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'ログインが必要です');
    }

    const { themeTitle, themeDescription, questions } = request.data as SuggestInput;

    const answeredQuestions = questions.filter((q) => q.answer.trim().length > 0);
    if (answeredQuestions.length === 0) {
      throw new HttpsError('invalid-argument', '回答が入力されていません');
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    const qaText = answeredQuestions
      .map((q, i) => `Q${i + 1}: ${q.prompt}\n回答: ${q.answer}`)
      .join('\n\n');

    const prompt = `あなたはバケットリスト作成のアシスタントです。
60歳前後の方が「${themeTitle}（${themeDescription}）」というテーマについて、以下の質問に答えました。

${qaText}

この回答をもとに、この方が「やりたいこと」としてバケットリストに追加できそうな具体的なアイデアを3〜5個提案してください。

条件：
- 回答の内容から自然に導き出されるアイデアにすること
- 60歳前後でも実現可能な、具体的な内容にすること
- 「〇〇する」という行動の形で書くこと（例：「妻と京都で1週間過ごす」「俳句を始めて句集を作る」）
- 優先度は high（強く望んでいる・時間的に急ぐ）/ medium（やりたいがいつでもよい）/ low（興味はあるが優先度は低い）で判断すること
- 似たようなアイデアを重複させないこと

必ず以下のJSON形式だけで返してください。説明文や前後の文章は不要です：
{"suggestions":[{"title":"...","priority":"high"},{"title":"...","priority":"medium"}]}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new HttpsError('internal', 'AIからの応答を処理できませんでした');
    }

    // JSONのみ抽出（前後に余分なテキストが入った場合に対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new HttpsError('internal', 'AIからの応答を解析できませんでした');
    }

    const result = JSON.parse(jsonMatch[0]) as { suggestions: Suggestion[] };
    return result;
  }
);
