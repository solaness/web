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
  /**
   * "체험"(레포츠) 카테고리에서 TourAPI cat3(소분류) 기준으로 실내 활동인지 판별한 값
   * (src/api/tourPlaceMapper.ts에서 계산). 그 외 카테고리에서는 항상 false — 햇빛 점수
   * 계산(src/constants/sunScore.ts)에서만 쓰인다.
   */
  isIndoorExperience?: boolean;
}

/** 지도 상세 페이지(src/pages/map/MapDetail.tsx)용 상세 정보. */
export interface PlaceDetail extends Place {
  /** 매칭되는 카테고리 전부(뱃지 표시용). 매칭이 안 되면 빈 배열. */
  categories: PlaceCategoryCode[];
  overview: string;
  homepageUrl: string;
  tel?: string;
}
