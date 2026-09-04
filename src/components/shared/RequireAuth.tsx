import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

function RequireAuth({
  children,
}: RequireAuthProps) {
  const {
    user,
    isGuest,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF6]">
        <p className="text-[15px] font-medium text-[#A1A1A1]">
          불러오는 중...
        </p>
      </div>
    );
  }

  /*
   * Google 로그인 사용자 또는 게스트는
   * 메인 화면과 기록 탭에 접근할 수 있습니다.
   */
  if (!user && !isGuest) {
    return (
      <Navigate
        to="/onboarding/login"
        replace
      />
    );
  }

  return children;
}

export default RequireAuth;
