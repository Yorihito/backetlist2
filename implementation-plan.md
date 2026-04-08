# バケットリストアプリ インプリメンテーションプラン

## 技術スタック（Google Platform 無料構成）

requirements.md の推奨スタックをGoogle Platform無料枠に最適化して変更する。

| 領域 | 採用技術 | 変更理由 |
|------|----------|---------|
| フロントエンド | Next.js (React) + TypeScript | 変更なし |
| スタイリング | Tailwind CSS | 変更なし |
| 認証 | Firebase Authentication | NextAuth.js → Firebase Auth（Googleサービスと直接統合） |
| データベース | Cloud Firestore | Supabase → Firestore（Firebase無料枠、NoSQL） |
| デプロイ | Firebase Hosting | Vercel → Firebase Hosting（Google Platform） |
| Next.js モード | Static Export (`output: 'export'`) | SSR不要のため静的エクスポートでFirebase Hostingに対応 |

### Firebase Spark プラン（無料）の制限
| リソース | 無料枠 |
|----------|--------|
| Authentication | 無制限 |
| Firestore 読み取り | 50,000回/日 |
| Firestore 書き込み | 20,000回/日 |
| Firestore ストレージ | 1 GiB |
| Hosting ストレージ | 10 GB |
| Hosting 転送量 | 360 MB/日 |

バケットリストアプリの想定利用規模では無料枠を超えない。

---

## ディレクトリ構成

```
backetlist2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # ルートレイアウト（フォント・テーマ設定）
│   │   ├── page.tsx                  # ルート（/login or /dashboard へリダイレクト）
│   │   ├── login/
│   │   │   └── page.tsx              # ログイン画面
│   │   └── dashboard/
│   │       └── page.tsx              # バケットリスト一覧
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleLoginButton.tsx # Googleログインボタン
│   │   ├── items/
│   │   │   ├── BucketItemList.tsx    # アイテム一覧
│   │   │   ├── BucketItemCard.tsx    # アイテム1件の表示カード
│   │   │   ├── AddItemModal.tsx      # アイテム追加モーダル
│   │   │   ├── EditItemModal.tsx     # アイテム編集モーダル
│   │   │   ├── DeleteConfirmDialog.tsx # 削除確認ダイアログ
│   │   │   └── PriorityQuiz.tsx      # 重要度自動設定の質問UI
│   │   └── ui/
│   │       ├── CategoryFilter.tsx    # カテゴリフィルター
│   │       ├── PriorityBadge.tsx     # 重要度バッジ（高/中/低）
│   │       └── CategoryBadge.tsx     # カテゴリバッジ
│   ├── lib/
│   │   ├── firebase.ts               # Firebase初期化
│   │   ├── auth.ts                   # 認証ヘルパー関数
│   │   └── firestore.ts              # Firestoreデータアクセス関数
│   ├── hooks/
│   │   ├── useAuth.ts                # 認証状態管理フック
│   │   └── useBucketItems.ts         # アイテムCRUDフック
│   ├── context/
│   │   └── AuthContext.tsx           # 認証コンテキスト（全体で認証状態を共有）
│   └── types/
│       └── index.ts                  # 型定義（BucketItem, User, Category等）
├── public/
├── .env.local                        # Firebase設定値（環境変数）
├── .env.local.example                # 環境変数テンプレート
├── .firebaserc                       # Firebaseプロジェクト設定
├── firebase.json                     # Firebase Hosting設定
├── firestore.rules                   # Firestoreセキュリティルール
├── firestore.indexes.json            # Firestoreインデックス設定
├── next.config.ts                    # Next.js設定（output: 'export'）
├── package.json
└── tailwind.config.ts
```

---

## データモデル（Firestore）

Firestoreはコレクション構造で管理する。

```
users/{userId}
  - email: string
  - name: string
  - photoURL: string
  - createdAt: Timestamp

users/{userId}/bucketItems/{itemId}
  - title: string
  - description: string
  - categories: string[]       // ["旅行", "学び"] など
  - priority: "high" | "medium" | "low"
  - emotionScore: 1 | 2 | 3   // 重要度自動設定の入力値（感情的強さ）
  - urgencyScore: 1 | 2 | 3   // 重要度自動設定の入力値（時間的制約）
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 重要度自動設定ロジック

アイテム追加時に以下2問を質問し、スコア合計で重要度を決定する。

**Q1: どのくらい強くやりたいと感じますか？（emotionScore）**
- 1: まあ、いつかやってみたい
- 2: ぜひやりたい
- 3: 絶対にやりたい！

**Q2: 体力や健康面で考えると、いつ頃がベストですか？（urgencyScore）**
- 1: いつでもできる
- 2: なるべく早めにやりたい
- 3: 今しかできない（体力・健康のうちに）

**判定ロジック:**
```
合計スコア = emotionScore + urgencyScore

高 (high)  : 合計 >= 5
中 (medium): 合計 >= 3
低 (low)   : 合計 <= 2
```

---

## Firestoreセキュリティルール

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 自分のユーザーデータのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // 自分のバケットアイテムのみ読み書き可能
      match /bucketItems/{itemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## デザイン仕様

### カラーパレット（シック・落ち着いた色調）
```
メイン背景:      #F5F0EB  (温かみのあるオフホワイト)
カード背景:      #FFFFFF
プライマリ:      #4A6741  (深みのあるグリーン - 人生・自然のイメージ)
セカンダリ:      #8B7355  (ウォームブラウン)
テキスト:        #2C2C2C
テキスト薄:      #6B6B6B
ボーダー:        #E0D8D0
重要度 高:       #C0392B  (落ち着いたレッド)
重要度 中:       #E67E22  (ウォームオレンジ)
重要度 低:       #7F8C8D  (グレー)
```

### フォント
- 日本語: Noto Sans JP（Google Fonts）
- 文字サイズ: 基本16px以上（ターゲット層に配慮）

---

## 実装フェーズ

### Phase 1: プロジェクト初期設定（Day 1）

1. Next.js プロジェクト作成
   ```bash
   npx create-next-app@latest backetlist2 --typescript --tailwind --app
   ```

2. 依存パッケージのインストール
   ```bash
   npm install firebase
   npm install -D firebase-tools
   ```

3. Firebase プロジェクト作成（Firebase Console）
   - Firestore Database 有効化
   - Authentication > Google プロバイダー有効化

4. 環境変数設定（`.env.local`）
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

5. `next.config.ts` に `output: 'export'` を設定

6. `tailwind.config.ts` にカラーパレット設定

**成果物**: 開発環境が動作する空のNext.jsプロジェクト

---

### Phase 2: 認証機能（Day 2）

1. `src/lib/firebase.ts` — Firebase初期化
2. `src/lib/auth.ts` — signInWithGoogle / signOut 関数
3. `src/context/AuthContext.tsx` — 認証状態をアプリ全体で共有
4. `src/hooks/useAuth.ts` — 認証状態を取得するフック
5. `src/app/login/page.tsx` — ログイン画面
6. `src/components/auth/GoogleLoginButton.tsx` — Googleログインボタン
7. ルート保護（未ログインは `/login` へリダイレクト）

**成果物**: Googleアカウントでログイン・ログアウトが動作する

---

### Phase 3: コア機能実装（Day 3–5）

1. `src/types/index.ts` — 型定義
2. `src/lib/firestore.ts` — Firestoreデータアクセス関数
   - `addBucketItem(userId, item)`
   - `updateBucketItem(userId, itemId, updates)`
   - `deleteBucketItem(userId, itemId)`
   - `subscribeBucketItems(userId, callback)` — リアルタイム更新
3. `src/hooks/useBucketItems.ts` — アイテムCRUDフック
4. `src/components/items/PriorityQuiz.tsx` — 重要度自動設定UI（2問の質問）
5. `src/components/items/AddItemModal.tsx` — アイテム追加モーダル
6. `src/components/items/EditItemModal.tsx` — アイテム編集モーダル
7. `src/components/items/DeleteConfirmDialog.tsx` — 削除確認
8. `src/components/items/BucketItemCard.tsx` — アイテムカード表示
9. `src/components/items/BucketItemList.tsx` — アイテム一覧
10. `firestore.rules` — セキュリティルール設定

**成果物**: バケットリストのCRUD操作が全て動作する

---

### Phase 4: UI仕上げ（Day 6–7）

1. `src/components/ui/CategoryFilter.tsx` — カテゴリフィルター
2. `src/components/ui/PriorityBadge.tsx` — 重要度バッジ
3. `src/components/ui/CategoryBadge.tsx` — カテゴリバッジ
4. `src/app/dashboard/page.tsx` — ダッシュボード（フィルター統合）
5. レスポンシブデザイン調整（PC/スマホ）
6. エラーメッセージの日本語化
7. ローディング状態の表示

**成果物**: デザインが仕上がり、PC/スマホで快適に使える

---

### Phase 5: デプロイ（Day 8）

1. Firebase Hosting 設定
   ```bash
   firebase init hosting
   ```
   - `firebase.json`: publicディレクトリを `out` に設定（Next.js static export出力先）

2. GitHub Actions による自動デプロイ設定
   ```
   .github/workflows/deploy.yml
   ```
   - `main` ブランチへのpushで自動ビルド → Firebase Hosting へデプロイ

3. Firestoreセキュリティルールのデプロイ
   ```bash
   firebase deploy --only firestore:rules
   ```

4. 本番動作確認

**成果物**: Firebase Hosting でアプリが公開される

---

## セットアップ手順（前提作業）

Firebase Console での作業が必要。

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新規プロジェクト作成（プロジェクト名: `backetlist2`）
3. **Authentication** → 「始める」→ Google プロバイダーを有効化
4. **Firestore Database** → 「データベースの作成」→ 本番モードで作成（後でセキュリティルールを適用）
5. **プロジェクトの設定** → 「ウェブアプリを追加」→ 設定値を `.env.local` にコピー
6. Google Cloud Console で OAuth 同意画面を設定
   - 承認済みドメインに Firebase Hosting のドメインを追加

---

## 主要パッケージ一覧

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "typescript": "^5.x",
    "firebase": "^11.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@types/react": "^19.x",
    "@types/node": "^22.x",
    "firebase-tools": "^14.x",
    "eslint": "^9.x"
  }
}
```
