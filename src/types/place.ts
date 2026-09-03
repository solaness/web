/**
 * 지도 검색 / 홈 추천 / 방문 기록 등에서 공용으로 쓰는 장소(Place) 타입.
 * 관광공사 TourAPI(KorService2) 응답을 이 타입으로 매핑해서 화면에서 사용한다
 * (원본 API 필드는 src/api/tourApi.types.ts 참고).
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
  /** 위경도 — 카카오맵 연동(다음 이슈) 전까지는 미사용 */
  lat?: number;
  lng?: number;
}
