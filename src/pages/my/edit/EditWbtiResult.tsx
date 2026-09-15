import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../../components/shared/BackgroundBlobs";
import GuestNotice from "../../../components/shared/GuestNotice";
import ResultTypeCard from "../../../components/onboarding/ResultTypeCard";
import ResultActionButtons from "../../../components/onboarding/ResultActionButtons";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { WBTI_TYPES, calculateWbtiType } from "../../../data/wbtiTypes";
import { updateWbtiResult } from "../../../firebase/firestore";

const MY_PATH = "/my";
const FALLBACK_PATH = "/my/edit/wbti/1";

/**
 * 마이페이지 "WBTI 유형 재검사" 결과 화면. 온보딩 Result.tsx와 카드/버튼 컴포넌트는
 * 그대로 재사용하고(둘 다 이미 이 재사용을 염두에 두고 만든 순수 컴포넌트), 저장 로직만
 * saveOnboardingResult 대신 updateWbtiResult로, 이동지는 /home 대신 /my로 바꿨다.
 * Result.tsx 자체는 게스트 분기 등 온보딩 전용 로직이 얽혀 있어 건드리지 않는다.
 */
function EditWbtiResult() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { wbtiAnswers: answers, resetOnboarding } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // "저장하고 돌아가기"로 나가는 중 resetOnboarding()이 answers를 비우면서 이 컴포넌트가
  // 다시 렌더링될 수 있다 — 그때 아래 typeInfo 방어 로직이 재실행돼 /my 대신 FALLBACK_PATH로
  // 되돌아가버리는 걸 막는 플래그. (Result.tsx와 동일한 패턴)
  const isLeavingRef = useRef(false);

  const typeId = useMemo(() => calculateWbtiType(answers), [answers]);
  const typeInfo = typeId ? WBTI_TYPES[typeId] : null;

  if (isGuest) {
    return (
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF6]">
        <GuestNotice message="WBTI 재검사는 로그인 후 이용할 수 있어요" />
      </main>
    );
  }

  if (!typeInfo) {
    if (isLeavingRef.current) {
      return null;
    }

    return <Navigate to={FALLBACK_PATH} replace />;
  }

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateWbtiResult(user.uid, { answers, typeId: typeInfo.typeId });
      isLeavingRef.current = true;
      resetOnboarding();
      navigate(MY_PATH);
    } catch (error) {
      console.error("WBTI 재검사 저장 실패:", error);
      setErrorMessage("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col items-center justify-center overflow-hidden bg-[#FFFDF6] px-[19px]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <ResultTypeCard typeInfo={typeInfo} />

        <ResultActionButtons
          onStart={handleSave}
          startLabel="저장하고 돌아가기"
          isSubmitting={isSubmitting}
        />

        {errorMessage && (
          <p role="alert" className="mt-4 text-center text-sm font-bold text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default EditWbtiResult;
