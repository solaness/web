import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isValidRegionSelection } from "../data/regions";
import type { WbtiAnswerMap, WbtiAxisCode } from "../types/wbti";

const REGION_STORAGE_KEY = "onboardingRegion";
const WBTI_STORAGE_KEY = "onboardingWbtiAnswers";

export interface OnboardingRegion {
  provinceCode: string;
  districtCode: string;
}

const EMPTY_REGION: OnboardingRegion = {
  provinceCode: "",
  districtCode: "",
};

interface OnboardingContextValue {
  region: OnboardingRegion;
  setRegion: (region: OnboardingRegion) => void;
  wbtiAnswers: WbtiAnswerMap;
  selectWbtiAnswer: (questionId: number, code: WbtiAxisCode) => void;
  isWbtiPageComplete: (questionIds: number[]) => boolean;
  /** Firestore 저장 완료 등 온보딩이 끝났을 때 Context와 백업 저장소를 함께 비운다. */
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function readStoredRegion(): OnboardingRegion {
  const storedValue = sessionStorage.getItem(REGION_STORAGE_KEY);

  if (!storedValue) {
    return EMPTY_REGION;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<OnboardingRegion>;
    const provinceCode = parsedValue.provinceCode ?? "";
    const districtCode = parsedValue.districtCode ?? "";

    if (!isValidRegionSelection(provinceCode, districtCode)) {
      return EMPTY_REGION;
    }

    return { provinceCode, districtCode };
  } catch {
    return EMPTY_REGION;
  }
}

function readStoredWbtiAnswers(): WbtiAnswerMap {
  const storedValue = sessionStorage.getItem(WBTI_STORAGE_KEY);

  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue) as WbtiAnswerMap | null;
    return parsedValue ?? {};
  } catch {
    return {};
  }
}

/**
 * 온보딩(지역 선택 + WBTI 검사) 진행 상태를 한곳에서 관리하는 Context.
 *
 * 이전에는 Region.tsx와 useWbtiAnswers 훅이 각자 sessionStorage를 직접 읽고 썼는데,
 * 이 Provider로 그 로직을 전부 모았다 — 컴포넌트들은 이제 sessionStorage를 직접 건드리지
 * 않고 useOnboarding()만 사용한다. 내부적으로는 여전히 sessionStorage에 미러링해서,
 * 모바일 브라우저가 온보딩 도중 탭을 백그라운드로 내렸다 살릴 때(reload)도 진행 중이던
 * 답변이 날아가지 않도록 유지한다.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<OnboardingRegion>(readStoredRegion);
  const [wbtiAnswers, setWbtiAnswers] = useState<WbtiAnswerMap>(
    readStoredWbtiAnswers,
  );

  const setRegion = useCallback((nextRegion: OnboardingRegion) => {
    setRegionState(nextRegion);
    sessionStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(nextRegion));
  }, []);

  const selectWbtiAnswer = useCallback(
    (questionId: number, code: WbtiAxisCode) => {
      setWbtiAnswers((prev) => {
        const next = { ...prev, [questionId]: code };
        sessionStorage.setItem(WBTI_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const isWbtiPageComplete = useCallback(
    (questionIds: number[]) =>
      questionIds.every((id) => Boolean(wbtiAnswers[id])),
    [wbtiAnswers],
  );

  const resetOnboarding = useCallback(() => {
    setRegionState(EMPTY_REGION);
    setWbtiAnswers({});
    sessionStorage.removeItem(REGION_STORAGE_KEY);
    sessionStorage.removeItem(WBTI_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      region,
      setRegion,
      wbtiAnswers,
      selectWbtiAnswer,
      isWbtiPageComplete,
      resetOnboarding,
    }),
    [
      region,
      setRegion,
      wbtiAnswers,
      selectWbtiAnswer,
      isWbtiPageComplete,
      resetOnboarding,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }

  return context;
}
