# バケットリスト

定年退職前後の方が、残りの人生でやりたいことをリスト化し、実現に向けてのモチベーションを高めるWebアプリです。

**本番URL**: https://backetlist-0829.web.app

## 機能

- **Google アカウントでログイン** — Firebase Authentication による OAuth 2.0
- **テーマから考える** — 7つのテーマ（人生の振り返り・旅・学び・健康など）に沿った質問に答えることでやりたいことを発見
- **AI提案** — テーマの回答をもとに Claude AI がバケットリストアイテムを3〜5件提案
- **直接追加** — タイトル・カテゴリ・重要度クイズの4ステップモーダルからアイテムを追加
- **重要度の自動算出** — 「どのくらいやりたいか」「今やるべきか」の2問から high / medium / low を自動設定
- **達成管理** — 「達成！」ボタンで完了記録、プログレスバーで全体の達成率を表示
- **フィルター & ソート** — 達成状況・カテゴリ・重要度でフィルタリング、追加日・重要度で並び替え

## 技術スタック

| 領域 | 技術 |
|------|------|
| フレームワーク | Next.js 15 (App Router) + TypeScript, `output: 'export'` |
| スタイリング | Tailwind CSS v4 |
| 認証 / DB | Firebase v11 (Authentication + Cloud Firestore) |
| AI機能 | Firebase Cloud Functions + Claude API (`claude-haiku-4-5-20251001`) |
| ホスティング | Firebase Hosting |
| CI/CD | GitHub Actions — `main` push で自動ビルド & デプロイ |

## 開発セットアップ

### 前提

- Node.js / JDK は `flake.nix` で管理（`direnv allow` で自動ロード）
- 環境変更は `flake.nix` を編集する（`brew install` / `nvm` は使わない）

```bash
# 依存インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.local に Firebase の設定値を記入

# 開発サーバ起動
npm run dev        # http://localhost:3000
```

### よく使うコマンド

```bash
npm run build                            # 静的エクスポート → /out
npm run lint                             # ESLint チェック
firebase emulators:start                 # Firebase エミュレータ起動
firebase deploy                          # hosting + rules + functions を一括デプロイ
firebase deploy --only firestore:rules   # Firestore ルールのみ
firebase deploy --only functions         # Cloud Functions のみ
```

### AI機能（Cloud Functions）のセットアップ

```bash
# Anthropic API キーを Firebase Secret として登録（初回のみ）
firebase functions:secrets:set ANTHROPIC_API_KEY
```

## 7つのテーマ

| テーマ | 内容 |
|--------|------|
| 🌱 これまでの人生を振り返って | やり残した想いを掘り起こす |
| 💝 大切な人との時間 | 誰と、どんな時間を過ごしたいか |
| 🌍 行ってみたい場所 | 憧れの旅先・もう一度行きたい場所 |
| 📚 学び・挑戦 | 忙しくてできなかった学びや習い事 |
| 💪 健康・体力があるうちに | 元気なうちにしかできないこと |
| 🎨 創作・表現 | 自分史・絵・写真集など形にして残す |
| 🕊️ 次の世代に遺したいこと | 経験・知識・メッセージを手渡す |

## ライセンス

Private
