'use client';

import { EmotionScore, UrgencyScore } from '@/types';

interface Props {
  emotionScore: EmotionScore;
  urgencyScore: UrgencyScore;
  onChangeEmotion: (v: EmotionScore) => void;
  onChangeUrgency: (v: UrgencyScore) => void;
}

const EMOTION_OPTIONS: { value: EmotionScore; label: string }[] = [
  { value: 1, label: 'まあ、いつかやってみたい' },
  { value: 2, label: 'ぜひやりたい' },
  { value: 3, label: '絶対にやりたい！' },
];

const URGENCY_OPTIONS: { value: UrgencyScore; label: string }[] = [
  { value: 1, label: 'いつでもできる' },
  { value: 2, label: 'なるべく早めにやりたい' },
  { value: 3, label: '今しかできない（体力・健康のうちに）' },
];

function RadioGroup<T extends number>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors text-base ${
            value === opt.value
              ? 'border-primary bg-green-50 text-primary'
              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <span
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              value === opt.value ? 'border-primary' : 'border-stone-300'
            }`}
          >
            {value === opt.value && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function PriorityQuiz({ emotionScore, urgencyScore, onChangeEmotion, onChangeUrgency }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-base font-medium text-text mb-3">
          Q1. どのくらい強くやりたいと感じますか？
        </p>
        <RadioGroup
          name="emotion"
          options={EMOTION_OPTIONS}
          value={emotionScore}
          onChange={onChangeEmotion}
        />
      </div>
      <div>
        <p className="text-base font-medium text-text mb-3">
          Q2. 体力や健康面で考えると、いつ頃がベストですか？
        </p>
        <RadioGroup
          name="urgency"
          options={URGENCY_OPTIONS}
          value={urgencyScore}
          onChange={onChangeUrgency}
        />
      </div>
    </div>
  );
}
