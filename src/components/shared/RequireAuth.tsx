import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFAC27] border-t-transparent"
          role="status"
          aria-label="로딩 중"
        />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/onboarding/login" replace />;
  }

  return <>{children}</>;
}
