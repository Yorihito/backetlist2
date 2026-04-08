export interface Question {
  id: string;
  prompt: string;
  placeholder?: string;
}

export interface Theme {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** バケットリストアイテムを作る際の既定カテゴリ */
  defaultCategory: string;
  questions: Question[];
}

export const THEMES: Theme[] = [
  {
    id: 'reflection',
    title: 'これまでの人生を振り返って',
    emoji: '🌱',
    description: '過去を見つめ直すと、まだ叶えていない想いが見つかるかもしれません。',
    defaultCategory: '経験',
    questions: [
      {
        id: 'q1',
        prompt: '子供の頃、どんな大人になりたかったですか？ 今でもその気持ちは心のどこかに残っていますか？',
        placeholder: '例：冒険家に憧れていた。今でも知らない土地を旅するのは好き…',
      },
      {
        id: 'q2',
        prompt: '「あの時やっておけばよかった」と感じることはありますか？',
        placeholder: '例：もっと外国語を勉強しておけばよかった…',
      },
      {
        id: 'q3',
        prompt: 'これまでの人生で一番印象に残っている出来事は何ですか？ そこからまだやり残していると感じることはありますか？',
        placeholder: '思い出した出来事と、そこに残る気持ちを書いてみてください',
      },
    ],
  },
  {
    id: 'relationships',
    title: '大切な人との時間',
    emoji: '💝',
    description: '誰と、どんな時間を過ごしたいか。想いを言葉にしてみましょう。',
    defaultCategory: '人間関係',
    questions: [
      {
        id: 'q1',
        prompt: '今、一番一緒に時間を過ごしたい人は誰ですか？ その人とどんなことをしたいですか？',
        placeholder: '例：妻と二人でゆっくり温泉旅行に行きたい',
      },
      {
        id: 'q2',
        prompt: '家族や友人の中で、「ありがとう」を伝えそびれている人はいますか？',
        placeholder: '例：恩師に手紙を書きたい、あの同級生にもう一度会いたい…',
      },
      {
        id: 'q3',
        prompt: 'お子さんやお孫さん、後輩に、今のうちに伝えておきたいことはありますか？',
        placeholder: '例：自分史を書いて子供に渡したい…',
      },
    ],
  },
  {
    id: 'places',
    title: '行ってみたい場所',
    emoji: '🌍',
    description: '心が動く風景を思い浮かべてみましょう。',
    defaultCategory: '旅行',
    questions: [
      {
        id: 'q1',
        prompt: '昔から憧れていて、まだ行けていない場所はありますか？',
        placeholder: '例：オーロラを見にカナダへ…',
      },
      {
        id: 'q2',
        prompt: '若い頃に訪れて、もう一度行ってみたい場所はありますか？',
        placeholder: '例：新婚旅行で行ったハワイ、学生時代にバイクで走った北海道…',
      },
      {
        id: 'q3',
        prompt: '日本国内で、まだ行ったことのない「いつか行きたい」場所はありますか？',
        placeholder: '例：しまなみ海道をサイクリング、奥入瀬渓流…',
      },
    ],
  },
  {
    id: 'learning',
    title: '学び・挑戦',
    emoji: '📚',
    description: '時間ができた今こそ、始められることがあるかもしれません。',
    defaultCategory: '学び',
    questions: [
      {
        id: 'q1',
        prompt: '忙しくて手が出せなかったけれど、時間があれば学んでみたかったことは何ですか？',
        placeholder: '例：哲学、歴史、楽器、語学…',
      },
      {
        id: 'q2',
        prompt: '新しく始めてみたい趣味や習い事はありますか？',
        placeholder: '例：陶芸、俳句、家庭菜園…',
      },
      {
        id: 'q3',
        prompt: '挑戦してみたいけれど、「もう歳だから」と諦めかけていることはありますか？',
        placeholder: '例：マラソン、ひとり旅、資格取得…',
      },
    ],
  },
  {
    id: 'health',
    title: '健康・体力があるうちに',
    emoji: '💪',
    description: '元気なうちにしかできないこと、早めに叶えておきたいですね。',
    defaultCategory: '健康・フィットネス',
    questions: [
      {
        id: 'q1',
        prompt: '体が元気なうちに、やっておきたい身体を使うことは何ですか？（登山、ダンス、長旅など）',
        placeholder: '例：富士山に登る、四国八十八箇所を歩く…',
      },
      {
        id: 'q2',
        prompt: '健康のために、新しく始めたい習慣はありますか？',
        placeholder: '例：毎日30分ウォーキング、ヨガを始める…',
      },
      {
        id: 'q3',
        prompt: '身体のメンテナンスで、やってみたいことはありますか？（人間ドック、温泉療養など）',
        placeholder: '例：2週間の湯治、歯の総点検…',
      },
    ],
  },
  {
    id: 'creative',
    title: '創作・表現',
    emoji: '🎨',
    description: '自分の想いを「形」にしてみませんか。',
    defaultCategory: '趣味・創作',
    questions: [
      {
        id: 'q1',
        prompt: '書き残したいこと、形にして残したいことはありますか？（自分史、詩、絵、写真集など）',
        placeholder: '例：両親について自分史にまとめる、庭の四季を写真集にする…',
      },
      {
        id: 'q2',
        prompt: '自分を表現してみたいと思ったことはありますか？',
        placeholder: '例：油絵を習って個展を開く、詩を書いてみる…',
      },
      {
        id: 'q3',
        prompt: '誰かに見てもらいたい、聞いてもらいたい「自分の作品」はありますか？',
        placeholder: '例：孫に読み聞かせる絵本を自作したい…',
      },
    ],
  },
  {
    id: 'legacy',
    title: '次の世代に遺したいこと',
    emoji: '🕊️',
    description: '自分の経験や想いを、誰かに手渡す方法を考えてみましょう。',
    defaultCategory: 'その他',
    questions: [
      {
        id: 'q1',
        prompt: '自分が亡くなった後も誰かの役に立てるとしたら、どんな形がいいですか？',
        placeholder: '例：読み終えた本を地域の図書館に寄贈する…',
      },
      {
        id: 'q2',
        prompt: 'これまでの経験や知識を、誰かに伝えたいと思うことはありますか？',
        placeholder: '例：若い世代に自分の仕事の話をする、ボランティアで教える…',
      },
      {
        id: 'q3',
        prompt: '世の中に残していきたいメッセージや教えはありますか？',
        placeholder: '例：孫に宛てた手紙を書いておく…',
      },
    ],
  },
];

export function getTheme(themeId: string): Theme | undefined {
  return THEMES.find((t) => t.id === themeId);
}
