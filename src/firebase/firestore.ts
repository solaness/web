import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { isWbtiTypeId } from "../data/wbtiTypes";
import type { WbtiAnswerMap, WbtiTypeId } from "../types/wbti";
import type { PlaceCategoryCode } from "../types/place";

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

export interface BookmarkInput {
  placeId: string;
  name: string;
  address: string;
  thumbnailUrl: string;
  /** MapDetail의 PlaceDetail.categories 그대로 — 즐겨찾기 카드 뱃지/햇빛 점수 계산에 쓴다. */
  categories: PlaceCategoryCode[];
  isIndoorExperience: boolean;
}

export interface BookmarkRecord extends BookmarkInput {
  savedAt: Date | null;
}

function bookmarkDocRef(uid: string, placeId: string) {
  return doc(db, "users", uid, "bookmarks", placeId);
}

/** MapDetail 북마크 버튼을 켤 때 users/{uid}/bookmarks/{placeId}에 스냅샷을 저장한다. */
export async function saveBookmark(uid: string, bookmark: BookmarkInput): Promise<void> {
  await setDoc(bookmarkDocRef(uid, bookmark.placeId), {
    ...bookmark,
    savedAt: serverTimestamp(),
  });
}

/** MapDetail 북마크 버튼을 끄거나, 즐겨찾기 목록에서 삭제할 때 사용. */
export async function removeBookmark(uid: string, placeId: string): Promise<void> {
  await deleteDoc(bookmarkDocRef(uid, placeId));
}

/** MapDetail 진입 시 이 장소가 이미 즐겨찾기돼 있는지 확인한다. */
export async function isPlaceBookmarked(uid: string, placeId: string): Promise<boolean> {
  const snapshot = await getDoc(bookmarkDocRef(uid, placeId));
  return snapshot.exists();
}

/** 마이페이지 - 즐겨찾기 목록. 최근에 저장한 순서대로 정렬한다. */
export async function getBookmarks(uid: string): Promise<BookmarkRecord[]> {
  const bookmarksQuery = query(
    collection(db, "users", uid, "bookmarks"),
    orderBy("savedAt", "desc"),
  );
  const snapshot = await getDocs(bookmarksQuery);

  return snapshot.docs.map((bookmarkDoc) => {
    const data = bookmarkDoc.data();

    return {
      placeId: bookmarkDoc.id,
      name: data.name,
      address: data.address,
      thumbnailUrl: data.thumbnailUrl,
      categories: data.categories ?? [],
      isIndoorExperience: data.isIndoorExperience ?? false,
      savedAt: data.savedAt instanceof Timestamp ? data.savedAt.toDate() : null,
    };
  });
}
