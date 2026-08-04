import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SocialLoginButton from "../../components/shared/SocialLoginButton";
import solnyangHelloSun from "../../assets/images/solnyang-hello-sun.png";

const HOME_PATH = "/home";
const ONBOARDING_PATH = "/onboarding/region";

export default function LoginPage() { 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate(); 
  const { loginWithGoogle, startGuestMode } = useAuth(); 

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const { onboardingCompleted } = await loginWithGoogle();
      navigate(onboardingCompleted ? HOME_PATH : ONBOARDING_PATH);
    } catch (error) {
      console.error("Google 로그인 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestStart = () => {
    startGuestMode();
    navigate(ONBOARDING_PATH);
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100">
      <div
        className="
          flex w-full max-w-[430px]
          min-h-screen flex-col
          items-center justify-between
          bg-gradient-to-b from-white via-white to-orange-50
          px-6 py-14
        "
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="flex h-[248px] w-[293px] items-center justify-center">
            <img
              src={solnyangHelloSun}
              alt="쏠냥이가 해를 향해 인사하는 모습"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="w-full max-w-[364px] text-center text-lg font-bold leading-snug text-[#754308]">
            더 밝고 건강한 내일을 위해,
            <br />
            쏠라니스와 함께 시작해 볼까요?
          </p>
        </div>

        <div className="flex w-full flex-col items-center space-y-4">
          <SocialLoginButton onClick={handleGoogleLogin} isLoading={isLoading} />

          <div className="flex w-full max-w-[322px] items-center gap-3">
            <div className="h-px flex-1 bg-[#A1A1A1]" />
            <span className="text-xs text-[#A1A1A1]">또는</span>
            <div className="h-px flex-1 bg-[#A1A1A1]" />
          </div>

          <button
            onClick={handleGuestStart}
            className="flex h-[53px] w-full max-w-[322px] items-center justify-center gap-2 rounded-[25px] bg-[#FFAC27] text-[14px] font-bold leading-[22px] text-white shadow-[4px_4px_4px_0px_#8A3E0F40]"
          >
            로그인 없이 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
