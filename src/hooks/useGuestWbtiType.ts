import { useCallback, useState } from "react";
import { WBTI_TYPES } from "../data/wbtiTypes";
import type { WbtiTypeId } from "../types/wbti";

const STORAGE_KEY = "solaness_guest_wbti_type_id";

function isWbtiTypeId(value: string): value is WbtiTypeId {
  return value in WBTI_TYPES;
}

function readStoredTypeId(): WbtiTypeId | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw && isWbtiTypeId(raw) ? raw : null;
}

/**
 * 게스트의 WBTI 검사 결과(typeId)를 세션 동안 유지하기 위한 훅.
 * 로그인 사용자는 Firestore(users/{uid}.wbtiTypeId)에 저장되지만, 게스트는 개인 데이터
 * 저장 기능을 못 쓰기 때문에(CLAUDE.md 게스트 모드 제한) 저장이 안 된다.
 * 그런데 기획상 게스트도 마이페이지에서 자기 유형은 볼 수 있어야 해서, OnboardingContext의
 * resetOnboarding()이 지우는 onboardingWbtiAnswers 키와는 별도로 typeId만 여기 남겨둔다.
 */
export function useGuestWbtiType() {
  const [guestTypeId, setGuestTypeIdState] = useState<WbtiTypeId | null>(
    readStoredTypeId,
  );

  const setGuestTypeId = useCallback((typeId: WbtiTypeId) => {
    setGuestTypeIdState(typeId);
    sessionStorage.setItem(STORAGE_KEY, typeId);
  }, []);

  return { guestTypeId, setGuestTypeId };
}
