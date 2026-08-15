import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import ResultTypeCard from "../../components/onboarding/ResultTypeCard";
import { useAuth } from "../../contexts/AuthContext";
import {
  useWbtiAnswers,
  WBTI_ANSWERS_STORAGE_KEY,
} from "../../hooks/useWbtiAnswers";
import { WBTI_TYPES, calculateWbtiType } from "../../data/wbtiTypes";
import { isValidRegionSelection } from "../../data/regions";
import { saveOnboardingResult } from "../../firebase/firestore";

const REGION_STORAGE_KEY = "onboardingRegion";
const HOME_PATH = "/home";
const FALLBACK_PATH = "/onboarding/test/1";

interface StoredRegion {
  provinceCode: string;
  districtCode: string;
}

function readStoredRegion(): StoredRegion | null {
  const storedValue = sessionStorage.getItem(REGION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<StoredRegion>;
    const provinceCode = parsedValue.provinceCode ?? "";
    const districtCode = parsedValue.districtCode ?? "";

    if (!isValidRegionSelection(provinceCode, districtCode)) {
      return null;
    }

    return { provinceCode, districtCode };
  } catch {
    return null;
  }
}

function Result() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { answers } = useWbtiAnswers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const typeId = useMemo(() => calculateWbtiType(answers), [answers]);
  const typeInfo = typeId ? WBTI_TYPES[typeId] : null;

  if (!typeInfo) {
    // 답변이 아직 다 없는 상태(직접 URL 접근 등)로 들어온 경우 검사 첫 페이지로 되돌린다.
    return <Navigate to={FALLBACK_PATH} replace />;
  }

  const handleStart = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 게스트는 개인 데이터 저장 기능을 쓸 수 없으므로(CLAUDE.md 게스트 모드 제한) Firestore 저장을 건너뛴다.
      if (!isGuest && user) {
        const region = readStoredRegion();

        // 정상 플로우라면 항상 존재하지만, 방어적으로 지역 정보가 없으면 저장 없이 넘어간다.
        if (region) {
          await saveOnboardingResult(user.uid, {
            region,
            wbti: { answers, typeId: typeInfo.typeId },
          });
        }
      }

      sessionStorage.removeItem(REGION_STORAGE_KEY);
      sessionStorage.removeItem(WBTI_ANSWERS_STORAGE_KEY);
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
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col items-center justify-center overflow-hidden bg-[#FFFDF6] px-[19px]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <div className="relative z-10 w-full">
        <ResultTypeCard
          typeInfo={typeInfo}
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
