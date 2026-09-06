import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";
import type { WbtiAnswerMap, WbtiTypeId } from "../types/wbti";

export interface OnboardingRegionInput {
  provinceCode: string;
  districtCode: string;
}

export interface OnboardingWbtiInput {
  answers: WbtiAnswerMap;
  typeId: WbtiTypeId;
}

/**
 * 온보딩 완료 시 지역+WBTI 결과를 users/{uid} 문서에 한 번에 저장한다.
 * 기존 문서(uid, email, displayName, photoURL, createdAt 등)는 merge로 보존한다.
 */
export async function saveOnboardingResult(
  uid: string,
  input: { region: OnboardingRegionInput; wbti: OnboardingWbtiInput },
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      regionProvinceCode: input.region.provinceCode,
      regionDistrictCode: input.region.districtCode,
      wbtiAnswers: input.wbti.answers,
      wbtiTypeId: input.wbti.typeId,
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * 마이페이지에서 로그인 사용자의 유형 카드를 그리기 위해 users/{uid}.wbtiTypeId만 읽어온다.
 * 문서가 없거나(가입 직후 등) 아직 온보딩을 안 마쳐 필드가 없으면 null.
 */
export async function getUserWbtiTypeId(uid: string): Promise<WbtiTypeId | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const { wbtiTypeId } = snapshot.data() as { wbtiTypeId?: WbtiTypeId };
  return wbtiTypeId ?? null;
}

/**
 * 마이페이지 "WBTI 재검사" 등 온보딩 이후 시점에 지역 정보는 건드리지 않고
 * WBTI 답변/유형만 갱신할 때 사용하기 위한 함수.
 * 이번 이슈에서는 호출부가 없고, 향후 마이페이지 연동 이슈에서 사용할 수 있도록 미리 준비해 둔다.
 */
export async function updateWbtiResult(
  uid: string,
  wbti: OnboardingWbtiInput,
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      wbtiAnswers: wbti.answers,
      wbtiTypeId: wbti.typeId,
      wbtiUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
