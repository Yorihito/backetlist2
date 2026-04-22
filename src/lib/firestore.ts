import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  BucketItem,
  BucketItemQuizInput,
  BucketItemThemeInput,
  ThemeProgress,
  calculatePriority,
} from '@/types';

// ===== BucketItems =====

function itemsRef(userId: string) {
  return collection(getFirebaseDb(), 'users', userId, 'bucketItems');
}

function itemRef(userId: string, itemId: string) {
  return doc(getFirebaseDb(), 'users', userId, 'bucketItems', itemId);
}

export function subscribeBucketItems(
  userId: string,
  callback: (items: BucketItem[]) => void
): () => void {
  const q = query(itemsRef(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: BucketItem[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description ?? '',
        categories: data.categories ?? [],
        priority: data.priority,
        emotionScore: data.emotionScore,
        urgencyScore: data.urgencyScore,
        sourceThemeId: data.sourceThemeId,
        completedAt: (data.completedAt as Timestamp | undefined)?.toDate(),
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      };
    });
    callback(items);
  });
}

/** 直接追加フロー経由のアイテム作成（クイズで重要度自動設定） */
export async function addBucketItemFromQuiz(userId: string, input: BucketItemQuizInput) {
  const priority = calculatePriority(input.emotionScore, input.urgencyScore);
  await addDoc(itemsRef(userId), {
    ...input,
    priority,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** テーマ経由のアイテム作成（重要度はユーザー直接指定） */
export async function addBucketItemFromTheme(userId: string, input: BucketItemThemeInput) {
  await addDoc(itemsRef(userId), {
    title: input.title,
    description: input.description ?? '',
    categories: input.categories,
    priority: input.priority,
    sourceThemeId: input.sourceThemeId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBucketItem(
  userId: string,
  itemId: string,
  updates: Partial<Pick<BucketItem, 'title' | 'description' | 'categories' | 'priority' | 'emotionScore' | 'urgencyScore'>>
) {
  await updateDoc(itemRef(userId, itemId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBucketItem(userId: string, itemId: string) {
  await deleteDoc(itemRef(userId, itemId));
}

export async function completeBucketItem(userId: string, itemId: string) {
  await updateDoc(itemRef(userId, itemId), {
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function uncompleteBucketItem(userId: string, itemId: string) {
  await updateDoc(itemRef(userId, itemId), {
    completedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

// ===== ThemeProgress =====

function themeProgressCollection(userId: string) {
  return collection(getFirebaseDb(), 'users', userId, 'themeProgress');
}

function themeProgressRef(userId: string, themeId: string) {
  return doc(getFirebaseDb(), 'users', userId, 'themeProgress', themeId);
}

export function subscribeAllThemeProgress(
  userId: string,
  callback: (progress: ThemeProgress[]) => void
): () => void {
  return onSnapshot(themeProgressCollection(userId), (snapshot) => {
    const progress: ThemeProgress[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        themeId: doc.id,
        answers: data.answers ?? {},
        status: data.status ?? 'not_started',
        completedAt: (data.completedAt as Timestamp | undefined)?.toDate(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      };
    });
    callback(progress);
  });
}

export function subscribeThemeProgress(
  userId: string,
  themeId: string,
  callback: (progress: ThemeProgress | null) => void
): () => void {
  return onSnapshot(themeProgressRef(userId, themeId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      themeId: snap.id,
      answers: data.answers ?? {},
      status: data.status ?? 'not_started',
      completedAt: (data.completedAt as Timestamp | undefined)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    });
  });
}

export async function saveThemeAnswers(
  userId: string,
  themeId: string,
  answers: Record<string, string>,
  status: 'in_progress' | 'completed'
) {
  const data: Record<string, unknown> = {
    answers,
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'completed') {
    data.completedAt = serverTimestamp();
  }
  await setDoc(themeProgressRef(userId, themeId), data, { merge: true });
}
