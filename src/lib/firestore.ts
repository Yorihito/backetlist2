import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { BucketItem, BucketItemInput, calculatePriority } from '@/types';

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
        description: data.description,
        categories: data.categories,
        priority: data.priority,
        emotionScore: data.emotionScore,
        urgencyScore: data.urgencyScore,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      };
    });
    callback(items);
  });
}

export async function addBucketItem(userId: string, input: BucketItemInput) {
  const priority = calculatePriority(input.emotionScore, input.urgencyScore);
  await addDoc(itemsRef(userId), {
    ...input,
    priority,
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
