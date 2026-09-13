import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  signInWithGoogle,
  ensureUserDocument,
  signOutUser,
  deleteAccount as deleteFirebaseAccount,
} from "../firebase/auth";
import { GUEST_WBTI_TYPE_STORAGE_KEY } from "../hooks/useGuestWbtiType";

const GUEST_STORAGE_KEY = "isGuest";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<{ onboardingCompleted: boolean }>;
  startGuestMode: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem(GUEST_STORAGE_KEY) === "true",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const nextUser = await signInWithGoogle();

    let onboardingCompleted: boolean;
    try {
      onboardingCompleted = await ensureUserDocument(nextUser);
    } catch (error) {
      await signOutUser();
      throw error;
    }

    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setUser(nextUser);

    return { onboardingCompleted };
  }, []);

  const startGuestMode = useCallback(async () => {
    // Google 로그인이 남아있는 상태로 "로그인 없이 시작하기"를 누르면 Firebase Auth 세션이
    // 그대로 유지돼서(onAuthStateChanged의 user가 안 바뀜) 게스트인데도 이전 계정 이름 등이
    // 화면에 그대로 남아있는 버그가 있었다. 게스트 모드로 들어갈 땐 먼저 로그아웃해서
    // user를 확실히 비운다.
    if (auth.currentUser) {
      await signOutUser();
    }

    sessionStorage.setItem(GUEST_STORAGE_KEY, "true");
    setIsGuest(true);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    // 이전에 게스트로 검사했던 WBTI 결과가 다음 게스트 세션까지 새어나가지 않도록 같이 지운다.
    sessionStorage.removeItem(GUEST_WBTI_TYPE_STORAGE_KEY);
    setIsGuest(false);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return;
    }

    await deleteFirebaseAccount(user);
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isGuest,
      loading,
      loginWithGoogle,
      startGuestMode,
      logout,
      deleteAccount,
    }),
    [user, isGuest, loading, loginWithGoogle, startGuestMode, logout, deleteAccount],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
