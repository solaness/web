import {
  addDoc,
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
  where,
} from "firebase/firestore";
import { db } from "./config";
import { isWbtiTypeId } from "../data/wbtiTypes";
import type { WbtiAnswerMap, WbtiTypeId } from "../types/wbti";
import type { PlaceCategoryCode } from "../types/place";
import type { DailyActivity } from "../data/historyCalendar";
import {
  isAvatarId,
  type AvatarId,
} from "../data/avatarOptions";

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
  avatarId?: AvatarId;
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
    avatarId: data.avatarId && isAvatarId(data.avatarId) ? data.avatarId : undefined,
  };
}

/**
 * 프로필 수정 화면의 "닉네임 변경"에서 사용. nickname 필드만 갱신한다.
 */
export async function updateNickname(uid: string, nickname: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { nickname }, { merge: true });
}

/** 마이페이지에서 선택한 쏠냥이 프로필 ID를 사용자 문서에 저장한다. */
export async function updateAvatarId(uid: string, avatarId: AvatarId): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { avatarId }, { merge: true });
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

function visitRecordsCollection(uid: string) {
  return collection(db, "users", uid, "visitRecords");
}

/** 숫자 필드가 없거나(오래된/수동 편집된 문서) 잘못된 타입이면 0으로 취급해, 합계 계산에서 NaN이 퍼지는 걸 막는다. */
function toSafeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toDailyActivity(id: string, data: Record<string, unknown>): DailyActivity {
  return {
    id,
    date: data.date as string,
    placeId: data.placeId as string,
    placeName: data.placeName as string,
    address: data.address as string,
    category: data.category as string,
    sunshineScore: toSafeNumber(data.sunshineScore),
    sunshineMinutes: toSafeNumber(data.sunshineMinutes),
    scorePerMinute: toSafeNumber(data.scorePerMinute),
    imageUrl: data.imageUrl as string | undefined,
    visitStatus: data.visitStatus as string | undefined,
    visitStartTime: data.visitStartTime as string | undefined,
    visitEndTime: data.visitEndTime as string | undefined,
    activityNote: data.activityNote as string | undefined,
  };
}

/**
 * 기록 - 방문 기록 추가하기(VisitRecordForm)에서 사용. users/{uid}/visitRecords에
 * 자동 생성 id로 새 문서를 만들고, 생성된 id를 반환한다(상세 화면으로 바로 이동하기 위해).
 * createdAt은 보안 규칙에서 request.time과 비교해 클라이언트가 임의 값을 못 넣게 막는다.
 * activityNote 등 선택 필드가 비어 undefined로 넘어오면 Firestore가 필드 값으로
 * undefined를 거부하므로, 그런 키는 아예 문서에서 뺀다(null이 아니라 "필드 없음"으로 저장됨).
 */
export async function addVisitRecord(
  uid: string,
  input: Omit<DailyActivity, "id">,
): Promise<string> {
  const definedEntries = Object.entries(input).filter(
    ([, value]) => value !== undefined,
  );

  const docRef = await addDoc(visitRecordsCollection(uid), {
    ...Object.fromEntries(definedEntries),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/** 캘린더/기록 메인/이 달의 기록 목록에서 사용. 방문일 최신순으로 전부 가져온 뒤 화면에서 월별로 거른다. */
export async function getVisitRecords(uid: string): Promise<DailyActivity[]> {
  const visitRecordsQuery = query(
    visitRecordsCollection(uid),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(visitRecordsQuery);

  return snapshot.docs.map((visitDoc) => toDailyActivity(visitDoc.id, visitDoc.data()));
}

/**
 * 홈의 오늘의 햇빛 점수/권장 충전 시간 카드에서 사용. 특정 날짜(date === dateKey)의
 * 기록만 가져와서, 전체 방문 기록을 다 읽는 getVisitRecords보다 훨씬 가볍다.
 */
export async function getVisitRecordsByDate(
  uid: string,
  dateKey: string,
): Promise<DailyActivity[]> {
  const visitRecordsQuery = query(
    visitRecordsCollection(uid),
    where("date", "==", dateKey),
  );
  const snapshot = await getDocs(visitRecordsQuery);

  return snapshot.docs.map((visitDoc) => toDailyActivity(visitDoc.id, visitDoc.data()));
}

/** 기록 상세 화면에서 단건 조회. 새로고침해도 전체 목록을 안 거치고 바로 조회할 수 있다. */
export async function getVisitRecord(
  uid: string,
  recordId: string,
): Promise<DailyActivity | null> {
  const snapshot = await getDoc(doc(db, "users", uid, "visitRecords", recordId));

  if (!snapshot.exists()) {
    return null;
  }

  return toDailyActivity(snapshot.id, snapshot.data());
}

/** 방문 기록 삭제*/
export async function removeVisitRecord(
  uid: string,
  recordId: string,
): Promise<void> {
  await deleteDoc(
    doc(db, "users", uid, "visitRecords", recordId),
  );
}
