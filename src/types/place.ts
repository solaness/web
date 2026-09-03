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

/** 지도 상세 페이지(src/pages/map/MapDetail.tsx)용 상세 정보. */
export interface PlaceDetail extends Place {
  /** 매칭되는 카테고리 전부(뱃지 표시용). 매칭이 안 되면 빈 배열. */
  categories: PlaceCategoryCode[];
  overview: string;
  homepageUrl: string;
  tel?: string;
}
