import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

/**
 * 회원 탈퇴: users/{uid} 문서를 먼저 지운 뒤 Firebase Auth 계정을 삭제한다.
 * (Auth 계정을 먼저 지우면 곧바로 로그아웃 상태가 돼서, Firestore 보안 규칙상
 * 본인 문서라도 그 뒤엔 지울 권한이 없어진다 — 그래서 순서가 중요하다.)
 * 로그인한 지 오래돼 Firebase가 재인증을 요구하면(auth/requires-recent-login)
 * Google 팝업으로 한 번 더 인증한 뒤 재시도한다.
 */
export async function deleteAccount(user: User): Promise<void> {
  await deleteDoc(doc(db, "users", user.uid));

  try {
    await deleteUser(user);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
      await deleteUser(user);
      return;
    }

    throw error;
  }
}
