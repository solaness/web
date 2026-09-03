import type { PlaceCategoryCode } from "../types/place";

/**
 * 화면의 CATEGORIES(전체/산림/체험/카페/쇼핑/바다)를
 * 관광공사 TourAPI(KorService2)의 contentTypeId/cat1(대분류)/cat2(중분류) 필터로 매핑한다.
 *
 * ⚠️ cat2(중분류) 실제 코드값은 공식 문서에서 확인하지 못했다.
 * 1차는 contentTypeId + cat1(대분류)까지만 필터링하므로 아래 두 쌍이 겹쳐서 나올 수 있다:
 * - 산림 / 바다: 둘 다 cat1=A01(자연)
 * - 카페 / 일반 음식점: 둘 다 cat1=A05(음식)
 * 실 서비스키 발급 후 `npm run tour:categories`를 실행해 cat2 코드를 확인하고
 * 아래 TODO를 채우면 더 정확하게 분리할 수 있다.
 */
export interface CategoryFilterSpec {
  contentTypeId?: string;
  cat1?: string;
  cat2?: string;
}

export const CATEGORY_FILTERS: Record<PlaceCategoryCode, CategoryFilterSpec> =
  {
    all: {},
    forest: { contentTypeId: "12", cat1: "A01" }, // 관광지 + 자연 — TODO: cat2로 바다와 분리
    experience: { contentTypeId: "28", cat1: "A03" }, // 레포츠
    cafe: { contentTypeId: "39", cat1: "A05" }, // 음식점 + 음식 — TODO: cat2로 일반 음식점과 분리
    shopping: { contentTypeId: "38", cat1: "A04" }, // 쇼핑
    sea: { contentTypeId: "12", cat1: "A01" }, // 관광지 + 자연 — TODO: cat2로 산림과 분리
  };
