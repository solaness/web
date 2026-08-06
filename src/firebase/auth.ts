import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

export async function ensureUserDocument(user: User): Promise<boolean> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
    });

    return false;
  }

  const { onboardingCompleted = false } = snapshot.data();
  return onboardingCompleted;
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
