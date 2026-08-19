import type { Place, PlaceCategoryCode } from "../types/place";

/**
 * 지도 검색 UI 우선 구현(mock 데이터) 단계에서 쓰는 임시 장소 데이터.
 * 관광공사 API 연동(다음 이슈) 시 실제 데이터로 교체 예정.
 * 썸네일은 임시 placeholder 이미지(picsum.photos)를 사용한다.
 */
export const MOCK_PLACES: Place[] = [
  {
    id: "daeheungsa",
    name: "대흥사",
    address: "전남 해남군 삼산면 대흥사길 400",
    category: "forest",
    thumbnailUrl: "https://picsum.photos/seed/daeheungsa/600/400",
    lat: 34.516,
    lng: 126.607,
    searchKeywords: ["대흥사", "두륜산"],
  },
  {
    id: "gyorae-forest",
    name: "교래자연휴양림",
    address: "제주 제주시 조천읍 교래로 133-1",
    category: "forest",
    thumbnailUrl: "https://picsum.photos/seed/gyorae/600/400",
  },
  {
    id: "sanrimwon",
    name: "국립산림치유원",
    address: "경북 영주시 문수면 조제로 501",
    category: "forest",
    thumbnailUrl: "https://picsum.photos/seed/sanrimwon/600/400",
  },
  {
    id: "yakseokwon",
    name: "약석원",
    address: "인천 강화군 불은면 약석로 12",
    category: "experience",
    thumbnailUrl: "https://picsum.photos/seed/yakseokwon/600/400",
  },
  {
    id: "gyorae-farm",
    name: "교래 체험 농장",
    address: "제주 제주시 조천읍 남조로 1717",
    category: "experience",
    thumbnailUrl: "https://picsum.photos/seed/gyoraefarm/600/400",
  },
  {
    id: "tea-garden",
    name: "보성 녹차밭 체험장",
    address: "전남 보성군 보성읍 녹차로 763-64",
    category: "experience",
    thumbnailUrl: "https://picsum.photos/seed/teagarden/600/400",
  },
  {
    id: "brunch-cafe",
    name: "브런치 카페 소라",
    address: "서울 마포구 연남로 34",
    category: "cafe",
    thumbnailUrl: "https://picsum.photos/seed/brunchcafe/600/400",
  },
  {
    id: "traditional-tea-house",
    name: "고즈넉한 전통 찻집",
    address: "서울 종로구 계동길 27",
    category: "cafe",
    thumbnailUrl: "https://picsum.photos/seed/teahouse/600/400",
  },
  {
    id: "hangang-market",
    name: "여의도 한강 마켓",
    address: "서울 영등포구 여의동로 330",
    category: "shopping",
    thumbnailUrl: "https://picsum.photos/seed/hangangmarket/600/400",
  },
  {
    id: "traditional-market",
    name: "제주 동문 전통시장",
    address: "제주 제주시 관덕로14길 20",
    category: "shopping",
    thumbnailUrl: "https://picsum.photos/seed/dongmunmarket/600/400",
  },
  {
    id: "haeundae-beach",
    name: "해운대 해수욕장",
    address: "부산 해운대구 해운대해변로 264",
    category: "sea",
    thumbnailUrl: "https://picsum.photos/seed/haeundae/600/400",
  },
  {
    id: "hyeopjae-beach",
    name: "협재 해수욕장",
    address: "제주 제주시 한림읍 협재리 2497-1",
    category: "sea",
    thumbnailUrl: "https://picsum.photos/seed/hyeopjae/600/400",
  },
];

export function getPlacesByCategory(
  category: PlaceCategoryCode,
): Place[] {
  if (category === "all") {
    return MOCK_PLACES;
  }

  return MOCK_PLACES.filter((place) => place.category === category);
}

export function searchPlaces(term: string): Place[] {
  const query = term.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return MOCK_PLACES.filter(
    (place) =>
      place.name.toLowerCase().includes(query) ||
      place.searchKeywords?.some((keyword) =>
        keyword.toLowerCase().includes(query),
      ),
  );
}

const DEFAULT_NEARBY_LIMIT = 4;

export function getNearbyPlaces(
  excludeId: string,
  category?: PlaceCategoryCode,
  limit: number = DEFAULT_NEARBY_LIMIT,
): Place[] {
  return MOCK_PLACES.filter(
    (place) =>
      place.id !== excludeId &&
      (!category || category === "all" || place.category === category),
  ).slice(0, limit);
}
