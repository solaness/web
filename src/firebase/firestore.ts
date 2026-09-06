import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";
import { isWbtiTypeId } from "../data/wbtiTypes";
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
 * 마이페이지 "WBTI 유형 재검사"에서, 지역 정보는 건드리지 않고 WBTI 답변/유형만 갱신한다.
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

export interface UserProfile {
  nickname?: string;
  regionProvinceCode?: string;
  regionDistrictCode?: string;
  wbtiTypeId?: WbtiTypeId;
}

/**
 * 마이페이지/프로필 수정 화면에서 쓰는 단일 조회 (닉네임/지역/유형을 문서 한 번 읽기로 다 가져온다
 * — 예전엔 wbtiTypeId만 따로 getUserWbtiTypeId로 또 읽었는데, 어차피 같은 문서라 합쳤다).
 * 문서가 없으면 null.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as UserProfile & { wbtiTypeId?: string };

  return {
    nickname: data.nickname,
    regionProvinceCode: data.regionProvinceCode,
    regionDistrictCode: data.regionDistrictCode,
    wbtiTypeId: data.wbtiTypeId && isWbtiTypeId(data.wbtiTypeId) ? data.wbtiTypeId : undefined,
  };
}

/**
 * 프로필 수정 화면의 "닉네임 변경"에서 사용. nickname 필드만 갱신한다.
 */
export async function updateNickname(uid: string, nickname: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { nickname }, { merge: true });
}

/**
 * 마이페이지 "지역 수정"에서 사용. 온보딩 때와 달리 WBTI/onboardingCompleted는 건드리지 않고
 * 지역 필드만 갱신한다.
 */
export async function updateRegion(
  uid: string,
  region: OnboardingRegionInput,
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      regionProvinceCode: region.provinceCode,
      regionDistrictCode: region.districtCode,
    },
    { merge: true },
  );
}
