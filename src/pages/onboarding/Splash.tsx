import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import { useAuth } from "../../contexts/AuthContext";

const HOME_PATH = "/home";
const INTRO_PATH = "/onboarding/intro";

// 인증 상태 확인이 순식간에 끝나도 로고가 최소 이 정도는 눈에 보이게 한다
// (앱 첫인상이 깜빡하고 사라지지 않도록 하기 위한 최소 노출 시간).
const MIN_SPLASH_DURATION_MS = 700;

function Splash() {
  const { user, isGuest, loading } = useAuth();
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDurationElapsed(true), MIN_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!loading && minDurationElapsed) {
    // 이미 로그인했거나(구글 계정) 게스트로 온보딩을 마친 적 있는 사용자는 바로 홈으로,
    // 그 외(처음 방문)엔 서비스 소개 캐러셀로 보낸다 — RequireAuth의 판단 기준과 동일하다.
    return <Navigate to={user || isGuest ? HOME_PATH : INTRO_PATH} replace />;
  }

  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col items-center justify-center bg-[#FFFDF6]">
      <BackgroundBlobs />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <h1 className="text-[40px] font-bold text-[#F78903]">Solaness</h1>
        <p className="text-sm font-medium text-[#B3A386]">
          나에게 맞는 햇빛 충전 시간
        </p>
      </div>
    </main>
  );
}

export default Splash;
