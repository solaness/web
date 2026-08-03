import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  signInWithGoogle,
  ensureUserDocument,
  signOutUser,
} from "../firebase/auth";

const GUEST_STORAGE_KEY = "isGuest";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<{ onboardingCompleted: boolean }>;
  startGuestMode: () => void;
  logout: () => Promise<void>;
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

  const loginWithGoogle = async () => {
    const nextUser = await signInWithGoogle();
    const onboardingCompleted = await ensureUserDocument(nextUser);

    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setUser(nextUser);

    return { onboardingCompleted };
  };

  const startGuestMode = () => {
    sessionStorage.setItem(GUEST_STORAGE_KEY, "true");
    setIsGuest(true);
  };

  const logout = async () => {
    await signOutUser();
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isGuest, loading, loginWithGoogle, startGuestMode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
