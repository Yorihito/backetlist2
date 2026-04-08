'use client';

import { Question } from '@/data/themes';

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onChange: (value: string) => void;
}

export function QuestionStep({ question, questionNumber, totalQuestions, answer, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-primary tracking-wide mb-1">
          質問 {questionNumber} / {totalQuestions}
        </p>
        <h2 className="text-lg font-bold text-text leading-relaxed">{question.prompt}</h2>
      </div>
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder ?? '思い浮かんだことを、自由に書いてみてください'}
        rows={8}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-base text-text placeholder-stone-300 focus:outline-none focus:border-primary resize-none leading-relaxed"
      />
      <p className="text-xs text-stone-400">
        ※ 完璧に書かなくても大丈夫です。思い浮かんだことをそのまま書いてみましょう。
      </p>
    </div>
  );
}
