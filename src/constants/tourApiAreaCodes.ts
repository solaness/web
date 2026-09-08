/**
 * 온보딩에서 쓰는 지역 코드(src/data/regions.json, 법정동코드 시/도 단위)를
 * 관광공사 TourAPI 고유의 지역코드(areaCode)로 바꾼다 — 두 체계가 서로 다른 코드라
 * 이름 기준으로 직접 매핑해뒀다(TourAPI「지역코드조회」서비스 기준 고정값).
 * 시/군/구(sigunguCode) 단위는 TourAPI 쪽 코드가 법정동코드와 전혀 다른 체계라
 * 이번 범위에서는 시/도 단위까지만 지원한다.
 */
export const AREA_CODE_BY_REGION_PROVINCE_CODE: Record<string, string> = {
  "1100000000": "1", // 서울특별시
  "1200000000": "38", // 전남광주통합특별시 — 광주/전남 중 전라남도 쪽으로 임의 지정
  "2600000000": "6", // 부산광역시
  "2700000000": "4", // 대구광역시
  "2800000000": "2", // 인천광역시
  "3000000000": "3", // 대전광역시
  "3100000000": "7", // 울산광역시
  "3611000000": "8", // 세종특별자치시
  "4100000000": "31", // 경기도
  "4300000000": "33", // 충청북도
  "4400000000": "34", // 충청남도
  "4700000000": "35", // 경상북도
  "4800000000": "36", // 경상남도
  "5000000000": "39", // 제주특별자치도
  "5100000000": "32", // 강원특별자치도
  "5200000000": "37", // 전북특별자치도
};

/** 비회원이거나 지역 정보가 없을 때 쓰는 기본 지역(서울). */
export const DEFAULT_AREA_CODE = "1";

/** regionProvinceCode를 TourAPI areaCode로 바꾼다. 매핑에 없으면 기본 지역으로 대체한다. */
export function toTourApiAreaCode(regionProvinceCode?: string | null): string {
  if (!regionProvinceCode) {
    return DEFAULT_AREA_CODE;
  }

  return AREA_CODE_BY_REGION_PROVINCE_CODE[regionProvinceCode] ?? DEFAULT_AREA_CODE;
}
