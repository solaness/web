import type { PlaceCategoryCode } from "../types/place";

/**
 * 화면의 CATEGORIES(전체/산림/체험/카페/쇼핑/바다)를
 * 관광공사 TourAPI(KorService2)의 contentTypeId/cat1(대분류)/cat2(중분류)/cat3(소분류) 필터로 매핑한다.
 *
 * `npm run tour:categories`(cat1=A01/A03/A04/A05)로 중분류를,
 * categoryCode2에 cat1+cat2를 넘겨 소분류(cat3)까지 조회해 아래 값을 확정했다.
 *
 * TourAPI 목록 조회 엔드포인트는 cat3를 단일 값 하나만 받기 때문에
 * (산림/바다처럼 cat3가 여러 개로 나뉘는 경우) 서버 요청에는 cat1(+cat2)까지만 싣고,
 * 응답을 받은 뒤 클라이언트에서 cat3In 목록으로 한 번 더 걸러낸다.
 * (재필터링 로직은 src/api/tourApi.ts의 matchesCategoryFilter 참고)
 */
export interface CategoryFilterSpec {
  contentTypeId?: string;
  cat1?: string;
  cat2?: string;
  /** cat1(+cat2)만으로 안 걸러지는 카테고리에서, item.cat3이 이 목록에 있어야 통과시킨다(클라이언트 재필터용). */
  cat3In?: readonly string[];
}

// cat1=A01(자연) > cat2=A0101(자연관광지)의 cat3 중 "바다" 성격
const SEA_CAT3 = [
  "A01011100", // 해안절경
  "A01011200", // 해수욕장
  "A01011300", // 섬
  "A01011400", // 항구/포구
  "A01011600", // 등대
] as const;

// cat1=A01(자연) > cat2=A0101(자연관광지)의 cat3 중 "산림/내륙 자연" 성격
const FOREST_CAT3 = [
  "A01010100", // 국립공원
  "A01010200", // 도립공원
  "A01010300", // 군립공원
  "A01010400", // 산
  "A01010500", // 자연생태관광지
  "A01010600", // 자연휴양림
  "A01010700", // 수목원
  "A01010800", // 폭포
  "A01010900", // 계곡
  "A01011000", // 약수터
  "A01011700", // 호수
  "A01011800", // 강
  "A01011900", // 동굴
] as const;

// cat1=A05(음식) > cat2=A0502(음식점)의 cat3 중 "카페"만 (한식/양식/일식/중식/이색음식점/클럽 제외)
const CAFE_CAT3 = [
  "A05020900", // 카페/전통찻집
] as const;

export const CATEGORY_FILTERS: Record<PlaceCategoryCode, CategoryFilterSpec> =
  {
    all: {},
    forest: {
      contentTypeId: "12",
      cat1: "A01",
      cat2: "A0101",
      cat3In: FOREST_CAT3,
    }, // 관광지 + 자연관광지 중 산/숲/계곡 등
    experience: { contentTypeId: "28", cat1: "A03" }, // 레포츠
    cafe: {
      contentTypeId: "39",
      cat1: "A05",
      cat2: "A0502",
      cat3In: CAFE_CAT3,
    }, // 음식점 중 카페/전통찻집만
    shopping: { contentTypeId: "38", cat1: "A04" }, // 쇼핑
    sea: {
      contentTypeId: "12",
      cat1: "A01",
      cat2: "A0101",
      cat3In: SEA_CAT3,
    }, // 관광지 + 자연관광지 중 해안/해수욕장/섬 등
  };
