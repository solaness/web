import type { PlaceCategoryCode } from "../types/place";

/**
 * TourAPI엔 실내/실외 여부 필드가 없어서, 카테고리 기준 고정값으로 "햇빛 점수"를 매긴다
 * (관련 이슈 #18 참고 — 정적 정보, 방문/예약 트리거 로직 없음).
 * "체험"만 실내/실외가 갈려서 장소명에 "실내"가 들어있는지로 대략 구분한다.
 */
const FIXED_SCORES: Partial<Record<PlaceCategoryCode, number>> = {
  forest: 5,
  sea: 5,
  cafe: 2,
  shopping: 1,
};

const INDOOR_EXPERIENCE_SCORE = 3;
const OUTDOOR_EXPERIENCE_SCORE = 4;
const DEFAULT_SCORE = 3;

function scoreForCategory(category: PlaceCategoryCode, placeName: string): number {
  if (category === "experience") {
    return placeName.includes("실내")
      ? INDOOR_EXPERIENCE_SCORE
      : OUTDOOR_EXPERIENCE_SCORE;
  }

  return FIXED_SCORES[category] ?? DEFAULT_SCORE;
}

/** 여러 카테고리에 매칭되면 더 야외에 가까운(높은) 점수를 채택한다. */
export function getSunScore(
  categories: PlaceCategoryCode[],
  placeName: string,
): number {
  if (categories.length === 0) {
    return DEFAULT_SCORE;
  }

  return Math.max(...categories.map((category) => scoreForCategory(category, placeName)));
}
