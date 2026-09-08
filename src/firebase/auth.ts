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
 * users/{uid} 문서는 이미 지워졌는데 Firebase Auth 계정 삭제가 끝내 실패했을 때 던지는 에러.
 * (재인증 팝업을 닫거나 막히는 경우 등) 호출부가 "완전히 실패함"과 구분해서, 계정은 남아있지만
 * 데이터는 이미 사라졌다는 걸 정확히 안내할 수 있게 한다.
 */
export class AccountPartiallyDeletedError extends Error {
  readonly originalError?: unknown;

  constructor(originalError?: unknown) {
    super("회원 정보는 삭제됐지만 계정 삭제는 완료되지 않았어요.");
    this.name = "AccountPartiallyDeletedError";
    this.originalError = originalError;
  }
}

/**
 * 회원 탈퇴: users/{uid} 문서를 먼저 지운 뒤 Firebase Auth 계정을 삭제한다.
 * (Auth 계정을 먼저 지우면 곧바로 로그아웃 상태가 돼서, Firestore 보안 규칙상
 * 본인 문서라도 그 뒤엔 지울 권한이 없어진다 — 그래서 순서가 중요하다.)
 * 로그인한 지 오래돼 Firebase가 재인증을 요구하면(auth/requires-recent-login)
 * Google 팝업으로 한 번 더 인증한 뒤 재시도한다. 이 시점부턴 Firestore 문서가 이미 지워진
 * 뒤라, 재인증이나 재시도가 실패하면 일반 에러 대신 AccountPartiallyDeletedError를 던진다.
 */
export async function deleteAccount(user: User): Promise<void> {
  await deleteDoc(doc(db, "users", user.uid));

  try {
    await deleteUser(user);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
      try {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
        await deleteUser(user);
        return;
      } catch (reauthError) {
        throw new AccountPartiallyDeletedError(reauthError);
      }
    }

    throw new AccountPartiallyDeletedError(error);
  }
}
