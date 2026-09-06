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

const DEFAULT_REGION_STORAGE_KEY = "onboardingRegion";
const DEFAULT_WBTI_STORAGE_KEY = "onboardingWbtiAnswers";

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

function readStoredRegion(storageKey: string): OnboardingRegion {
  const storedValue = sessionStorage.getItem(storageKey);

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

function readStoredWbtiAnswers(storageKey: string): WbtiAnswerMap {
  const storedValue = sessionStorage.getItem(storageKey);

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

interface OnboardingProviderProps {
  children: ReactNode;
  /**
   * 세션스토리지 키를 실제 온보딩 마법사와 분리하고 싶을 때 지정한다 (예: 마이페이지
   * "지역 수정"/"WBTI 재검사"). 지정하지 않으면 기존 온보딩 마법사가 쓰던 키를 그대로 쓴다.
   *
   * 원래 이 Provider는 온보딩 전용이라 키가 고정돼 있었는데, 마이페이지의 지역 수정/WBTI
   * 재검사가 같은 Context를 재사용하면서 실제 온보딩과 세션스토리지 키가 겹쳐버렸다
   * (온보딩을 하다 만 사용자의 답변이 재검사 화면에 그대로 프리필되거나, 재검사 완료 시
   * resetOnboarding()이 진행 중이던 온보딩 답변까지 지워버리는 문제). namespace로 완전히
   * 분리해서 이 문제를 없앤다.
   */
  storageNamespace?: string;
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
export function OnboardingProvider({
  children,
  storageNamespace,
}: OnboardingProviderProps) {
  const regionStorageKey = storageNamespace
    ? `${storageNamespace}:${DEFAULT_REGION_STORAGE_KEY}`
    : DEFAULT_REGION_STORAGE_KEY;
  const wbtiStorageKey = storageNamespace
    ? `${storageNamespace}:${DEFAULT_WBTI_STORAGE_KEY}`
    : DEFAULT_WBTI_STORAGE_KEY;

  const [region, setRegionState] = useState<OnboardingRegion>(() =>
    readStoredRegion(regionStorageKey),
  );
  const [wbtiAnswers, setWbtiAnswers] = useState<WbtiAnswerMap>(() =>
    readStoredWbtiAnswers(wbtiStorageKey),
  );

  const setRegion = useCallback(
    (nextRegion: OnboardingRegion) => {
      setRegionState(nextRegion);
      sessionStorage.setItem(regionStorageKey, JSON.stringify(nextRegion));
    },
    [regionStorageKey],
  );

  const selectWbtiAnswer = useCallback(
    (questionId: number, code: WbtiAxisCode) => {
      setWbtiAnswers((prev) => {
        const next = { ...prev, [questionId]: code };
        sessionStorage.setItem(wbtiStorageKey, JSON.stringify(next));
        return next;
      });
    },
    [wbtiStorageKey],
  );

  const isWbtiPageComplete = useCallback(
    (questionIds: number[]) =>
      questionIds.every((id) => Boolean(wbtiAnswers[id])),
    [wbtiAnswers],
  );

  const resetOnboarding = useCallback(() => {
    setRegionState(EMPTY_REGION);
    setWbtiAnswers({});
    sessionStorage.removeItem(regionStorageKey);
    sessionStorage.removeItem(wbtiStorageKey);
  }, [regionStorageKey, wbtiStorageKey]);

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
