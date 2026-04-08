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
firebase deploy                          # Deploy hosting + Firestore rules
firebase deploy --only firestore:rules   # Rules only
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
  → useBucketItems / useAuth hook
  → src/lib/firestore.ts / auth.ts  (calls getFirebaseDb() / getFirebaseAuth())
  → Firebase SDK  →  Cloud Firestore / Firebase Auth
```

`AuthContext` (`src/context/AuthContext.tsx`) wraps the entire app and shares `{ user, loading }`. Unauthenticated users are redirected client-side via `useEffect` + `router.replace('/login')`.

### Key Files

| File | Role |
|------|------|
| `src/lib/firebase.ts` | Lazy Firebase init (`getFirebaseAuth`, `getFirebaseDb`) |
| `src/lib/auth.ts` | `signInWithGoogle`, `signOut` |
| `src/lib/firestore.ts` | `subscribeBucketItems`, `addBucketItem`, `updateBucketItem`, `deleteBucketItem` |
| `src/context/AuthContext.tsx` | Global auth state via React context |
| `src/hooks/useAuth.ts` | Thin wrapper around `AuthContext` |
| `src/hooks/useBucketItems.ts` | CRUD + real-time Firestore listener |
| `src/types/index.ts` | All shared types + `calculatePriority()` |

### Firestore Structure

```
users/{userId}
users/{userId}/bucketItems/{itemId}
```

`BucketItem` fields: `title`, `description`, `categories: string[]`, `priority: 'high'|'medium'|'low'`, `emotionScore: 1|2|3`, `urgencyScore: 1|2|3`, `createdAt`, `updatedAt`

### Priority Auto-Setting Logic (`src/types/index.ts: calculatePriority`)

```
sum = emotionScore + urgencyScore
sum >= 5 → high | sum >= 3 → medium | sum <= 2 → low
```

### Add Item Flow (4-step modal)

`AddItemModal` has internal `step: 1|2|3|4` state:
1. Title + description input
2. Category multi-select
3. `PriorityQuiz` (2 radio questions)
4. Priority confirmation (auto-set, user can override)

### Firestore Security

`firestore.rules` — each user can only access `users/{their-uid}/**`. Deploy whenever rules change:
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
