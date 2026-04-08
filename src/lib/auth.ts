import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // ユーザープロフィールをFirestoreに保存（初回ログイン時のみ作成）
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
