import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

const HOME_PATH = "/home";
const ONBOARDING_PATH = "/onboarding/next";

const buttonStyle =
  "flex h-[53px] w-full max-w-[322px] items-center justify-center gap-2 rounded-[25px] text-[14px] font-bold leading-[22px]";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

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

        navigate(ONBOARDING_PATH);
        return;
      }

      const { onboardingCompleted = false } = snapshot.data();

      navigate(onboardingCompleted ? HOME_PATH : ONBOARDING_PATH);
    } catch (error) {
      console.error("Google 로그인 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestStart = () => {
    sessionStorage.setItem("isGuest", "true");
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
          <div className="flex h-[248px] w-[293px] items-center justify-center text-[120px]">
            🐱
          </div>

          <p className="w-full max-w-[364px] text-center text-lg font-bold leading-snug text-gray-900">
            더 밝고 건강한 내일을 위해,
            <br />
            쏠라니스와 함께 시작해 볼까요?
          </p>
        </div>

        <div className="flex w-full flex-col items-center space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`${buttonStyle} border border-gray-300 bg-white text-gray-800 shadow-[4px_4px_4px_0px_#FAC775] disabled:opacity-50`}
          >
            <span>G</span>
            {isLoading ? "로그인 중..." : "Google로 로그인"}
          </button>

          <div className="flex w-full max-w-[322px] items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleGuestStart}
            className={`${buttonStyle} bg-[#FFAC27] text-white shadow-[4px_4px_4px_0px_#8A3E0F40]`}
          >
            로그인 없이 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}