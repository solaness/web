/**
 * 지도 검색 / 홈 추천 / 방문 기록 등에서 공용으로 쓰는 장소(Place) 타입.
 * 현재는 UI 우선 구현(mock 데이터) 단계라 최소 필드만 정의하고,
 * 관광공사 API 연동 시 필요한 필드(위경도, 검색 키워드 등)는 optional로 미리 확보해둔다.
 */
export type PlaceCategoryCode =
  | "all"
  | "forest"
  | "experience"
  | "cafe"
  | "shopping"
  | "sea";

export interface Place {
  id: string;
  name: string;
  address: string;
  category: PlaceCategoryCode;
  thumbnailUrl: string;
  /** 위경도 — 카카오맵 연동(다음 이슈) 전까지는 미사용, 목데이터엔 채워둠 */
  lat?: number;
  lng?: number;
  /** 검색 매칭용 별칭 키워드 (예: "대흥사" 검색 시 "두륜산"도 매칭되도록) */
  searchKeywords?: string[];
}
