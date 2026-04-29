# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bucket list app for users around age 60 (pre/post retirement). Goal: list life goals and boost motivation. See `requirements.md` and `implementation-plan.md` for full details.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript, `output: 'export'` (static HTML — no SSR)
- **Styling**: Tailwind CSS v4 with custom theme in `src/app/globals.css` (`@theme { ... }`)
- **Auth + DB**: Firebase v11 — Authentication (Google OAuth) + Cloud Firestore
- **Hosting**: Firebase Hosting (`out/` directory), `cleanUrls: true`
- **CI/CD**: `.github/workflows/deploy.yml` — pushes to `main` auto-build and deploy

## Common Commands

```bash
npm run dev          # Local dev server (http://localhost:3000)
npm run build        # Static export → /out directory
npm run lint         # ESLint check
firebase deploy                          # Deploy hosting + Firestore rules + functions
firebase deploy --only firestore:rules   # Rules only
firebase deploy --only functions         # Cloud Functions only
firebase emulators:start                 # Local Firebase emulators
```

## Architecture

### Critical: Firebase Lazy Initialization

Firebase must **not** initialize at module-load time — Next.js runs module code during static export build, which would fail without real env vars.

All Firebase initialization is deferred to `getFirebaseAuth()` / `getFirebaseDb()` in `src/lib/firebase.ts`. These are called only from client-side code (inside `useEffect` or event handlers), **never** at module level.

**Do not** import `auth` or `db` as module-level constants. Always call the getter functions:
```ts
// Wrong
import { auth } from '@/lib/firebase';

// Correct
import { getFirebaseAuth } from '@/lib/firebase';
// call inside useEffect or async handlers only
const auth = getFirebaseAuth();
```

### Data Flow

```
Component
  → useBucketItems / useThemeProgress / useAuth hook
  → src/lib/firestore.ts / auth.ts  (calls getFirebaseDb() / getFirebaseAuth())
  → Firebase SDK  →  Cloud Firestore / Firebase Auth
```

`AuthContext` (`src/context/AuthContext.tsx`) wraps the entire app and shares `{ user, loading }`. Unauthenticated users are redirected client-side via `useEffect` + `router.replace('/login')`.

### Key Files

| File | Role |
|------|------|
| `src/lib/firebase.ts` | Lazy Firebase init (`getFirebaseAuth`, `getFirebaseDb`, `getFirebaseFunctions`) |
| `src/lib/auth.ts` | `signInWithGoogle`, `signOut` |
| `src/lib/firestore.ts` | Firestore CRUD for `bucketItems` and `themeProgress` |
| `src/data/themes.ts` | 7 hardcoded themes × 3 questions; `Theme`, `Question` types |
| `src/context/AuthContext.tsx` | Global auth state via React context |
| `src/hooks/useAuth.ts` | Thin wrapper around `AuthContext` |
| `src/hooks/useBucketItems.ts` | CRUD + real-time listener; `addFromQuiz`, `addFromTheme` |
| `src/hooks/useThemeProgress.ts` | `useThemeProgress` (single theme page), `useAllThemeProgress` (dashboard) |
| `src/lib/suggestItems.ts` | Client-side caller for AI suggestion Cloud Function |
| `src/types/index.ts` | All shared types + `calculatePriority()` |

### Firestore Structure

```
users/{userId}
users/{userId}/bucketItems/{itemId}
users/{userId}/themeProgress/{themeId}
```

`BucketItem` fields: `title`, `description`, `categories: string[]`, `priority: 'high'|'medium'|'low'`, `emotionScore?: 1|2|3`, `urgencyScore?: 1|2|3`, `sourceThemeId?`, `createdAt`, `updatedAt`

`ThemeProgress` fields: `answers: Record<string, string>`, `status: 'not_started'|'in_progress'|'completed'`, `completedAt?`, `updatedAt`

### Two Item Creation Paths

**Theme flow** (`/themes/[themeId]`): User answers 3 questions per theme → review step → creates `DraftItem[]` with explicit priority → `addBucketItemFromTheme()`. No `emotionScore`/`urgencyScore`.

**Direct add flow** (`AddItemModal` on dashboard): 4-step modal — title/description → category → `PriorityQuiz` (2 questions) → priority confirmation → `addBucketItemFromQuiz()`. Priority is auto-calculated:
```
sum = emotionScore + urgencyScore
sum >= 5 → high | sum >= 3 → medium | sum <= 2 → low
```

### Theme Page Architecture (`/themes/[themeId]`)

`page.tsx` is a server component with `generateStaticParams()` for all 7 theme IDs (required for `output: 'export'`). It renders `ThemePageClient` which owns:
- `step` state: `0..(questions.length)` — last step is the review
- `answers` state: saved to Firestore on each "next" as `in_progress`
- `drafts` state: `DraftItem[]` for bucket list items to create on completion
- `hydrated` flag: prevents flash — waits for `progressLoading` to resolve before rendering

### AI Suggestion Feature

At the theme review step, the app calls a Firebase Cloud Function (`suggestBucketItems`) that uses the Claude API to propose bucket-list items based on the user's theme answers.

- **Client**: `src/lib/suggestItems.ts` — calls `getFirebaseFunctions()` then `httpsCallable('suggestBucketItems')`
- **Function**: `functions/src/index.ts` — `onCall`, region `asia-northeast1`, requires `ANTHROPIC_API_KEY` Firebase Secret
- **Model**: `claude-haiku-4-5-20251001`, returns 3–5 `{ title, priority }` suggestions as JSON
- The function uses `defineSecret('ANTHROPIC_API_KEY')` — set it with `firebase functions:secrets:set ANTHROPIC_API_KEY` before deploying

### Firestore Security

`firestore.rules` — each user can only access `users/{their-uid}/**` subcollections (`bucketItems`, `themeProgress`). Deploy whenever rules change:
```bash
firebase deploy --only firestore:rules
```

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in Firebase config values (all `NEXT_PUBLIC_FIREBASE_*`). Required before `npm run dev`.

For GitHub Actions, add the same keys plus `FIREBASE_SERVICE_ACCOUNT` as repository secrets.

## Design Tokens (Tailwind v4 `@theme`)

Custom colors defined in `src/app/globals.css`:
- `bg-background` / `bg-surface` — page and card backgrounds
- `text-primary` / `bg-primary` — `#4A6741` deep green
- `text-secondary` — `#8B7355` warm brown
- Priority: `text-priority-high` `#C0392B`, `text-priority-medium` `#E67E22`, `text-priority-low` `#7F8C8D`
- Base font: Noto Sans JP (`--font-noto-sans-jp`), min 16px

## 開発環境ルール
- Node.js / JDK は flake.nix で管理されている（direnvで自動ロード）
- 環境変更は flake.nix を編集すること（brew install / nvm 等は使わない）
- 一時的な検証ツールは `nix shell nixpkgs#<pkg>` で試す
- 定着したものだけ flake.nix の packages に追加してコミット

## よく使うコマンド
- 開発サーバ: `npm run dev`
- ビルド: `npm run build`
- Lint: `npm run lint`
- Firebase エミュレータ: `npx firebase emulators:start`

## 注意
- `.direnv/` はキャッシュなので Git にコミットしない
- `flake.nix` と `.envrc` はコミット対象
