import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  allowGuest?: boolean;
  guestFallback?: ReactNode;
}

function RequireAuth({
  children,
  allowGuest = true,
  guestFallback,
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
   * 로그인도 게스트로 시작도 하지 않은 경우
   */
  if (!user && !isGuest) {
    return (
      <Navigate
        to="/onboarding/login"
        replace
      />
    );
  }
    
  /*
  * 게스트 접근을 허용하지 않는 화면인데
  * 로그인 사용자가 아닌 경우
  */
   if (!allowGuest && !user) {
    if(guestFallback){
      return guestFallback;
    }
    
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
