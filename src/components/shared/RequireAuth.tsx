import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user && !isGuest) {
    return <Navigate to="/onboarding/login" replace />;
  }

  return <>{children}</>;
}
