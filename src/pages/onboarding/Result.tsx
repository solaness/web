import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import ResultTypeCard from "../../components/onboarding/ResultTypeCard";
import ResultActionButtons from "../../components/onboarding/ResultActionButtons";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useGuestWbtiType } from "../../hooks/useGuestWbtiType";
import { WBTI_TYPES, calculateWbtiType } from "../../data/wbtiTypes";
import { saveOnboardingResult } from "../../firebase/firestore";

const HOME_PATH = "/home";
const FALLBACK_PATH = "/onboarding/test/1";

function Result() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { region, wbtiAnswers: answers, resetOnboarding } = useOnboarding();
  const { setGuestTypeId } = useGuestWbtiType();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // "시작하기"로 온보딩을 마치고 나가는 중에는 resetOnboarding()이 answers를 비우면서
  // 이 컴포넌트가 다시 렌더링될 수 있다. 그때 아래 typeInfo 방어 로직이 재실행돼서
  // /home 대신 FALLBACK_PATH로 되돌아가버리는 걸 막기 위한 플래그.
  const isLeavingRef = useRef(false);

  const typeId = useMemo(() => calculateWbtiType(answers), [answers]);
  const typeInfo = typeId ? WBTI_TYPES[typeId] : null;

  if (!typeInfo) {
    if (isLeavingRef.current) {
      // "시작하기"로 나가는 중 resetOnboarding()이 answers를 비워서 여기로 들어온 경우 —
      // 곧 /home으로 unmount되니 아무것도 그리지 않는다.
      return null;
    }

    // 답변이 아직 다 없는 상태(직접 URL 접근 등)로 들어온 경우 검사 첫 페이지로 되돌린다.
    return <Navigate to={FALLBACK_PATH} replace />;
  }

  const handleStart = async () => {
    if (!typeInfo) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 게스트는 개인 데이터 저장 기능을 쓸 수 없으므로(CLAUDE.md 게스트 모드 제한) Firestore 저장을 건너뛴다.
      // 정상 플로우라면 region이 항상 채워져 있지만, 방어적으로 비어 있으면 저장 없이 넘어간다.
      if (!isGuest && user && region.provinceCode && region.districtCode) {
        await saveOnboardingResult(user.uid, {
          region,
          wbti: { answers, typeId: typeInfo.typeId },
        });
      } else if (isGuest) {
        // Firestore엔 못 남기지만, 마이페이지에서 유형을 보여줄 수 있게 세션 동안은 남겨둔다.
        setGuestTypeId(typeInfo.typeId);
      }

      isLeavingRef.current = true;
      resetOnboarding();
      navigate(HOME_PATH);
    } catch (error) {
      console.error("온보딩 결과 저장 실패:", error);
      setErrorMessage("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    // TODO: 공유하기 기능 구현 예정 (우선순위 낮음)
  };

  const handleSave = () => {
    // TODO: 저장하기 기능 구현 예정 (우선순위 낮음)
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
          onStart={handleStart}
          isSubmitting={isSubmitting}
          onShare={handleShare}
          onSave={handleSave}
        />

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 text-center text-sm font-bold text-red-500"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default Result;
