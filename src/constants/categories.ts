import type { PlaceCategoryCode } from "../types/place";

export interface CategoryOption {
  code: PlaceCategoryCode;
  label: string;
}

/** 지도 검색 / 방문 기록 / 기록 메인 화면이 공용으로 쓰는 카테고리 필터 목록 (CLAUDE.md 참고) */
export const CATEGORIES: CategoryOption[] = [
  { code: "all", label: "전체" },
  { code: "forest", label: "산림" },
  { code: "experience", label: "체험" },
  { code: "cafe", label: "카페" },
  { code: "shopping", label: "쇼핑" },
  { code: "sea", label: "바다" },
];

export const DEFAULT_CATEGORY: PlaceCategoryCode = "all";
