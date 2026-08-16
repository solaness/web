import type { WbtiAnswerMap, WbtiAxisCode, WbtiTypeId, WbtiTypeInfo } from "../types/wbti";
import { TEST_PAGE_QUESTION_IDS } from "./wbtiQuestions";

/**
 * 결과 화면에서 유형명(title)과 힐링 스타일명(healingStyle) 사이에 공통으로 붙는 고정 문구.
 * 8종 모두 동일한 문구라 타입별로 중복 저장하지 않고 상수 하나로 분리했다.
 */
export const WBTI_RESULT_TAGLINE = "힐링이 필요해 보여요.";

/**
 * WBTI 8종 매핑 데이터. (출처: "W-BTI 성향 분류 기준 (3대 축)" 공식 문서)
 */
export const WBTI_TYPES: Record<WbtiTypeId, WbtiTypeInfo> = {
  SEF: {
    typeId: "SEF",
    title: "셀러브리티형",
    healingStyle: "소셜 핫플형",
    emoji: "🌟",
    catchphrase: "트렌디한 공간에서 에너지를 얻는",
    suggestion: "활기찬 브런치 카페나 피크닉 명소에서 햇살을 충전해 보세요!",
    placeCategories: ["브런치 카페", "피크닉 명소"],
  },
  PEF: {
    typeId: "PEF",
    title: "럽마이셀프형",
    healingStyle: "마이웨이 활력형",
    emoji: "🌟",
    catchphrase: "온전히 나만의 즐거움을 채우는",
    suggestion: "이색적인 농장 체험이나 숨은 브런치 맛집으로 떠나볼까요?",
    placeCategories: ["체험 농장", "브런치 카페"],
  },
  SIR: {
    typeId: "SIR",
    title: "하모니스트형",
    healingStyle: "따뜻한 공감형",
    emoji: "🌟",
    catchphrase: "소중한 사람들과 마음을 나누는",
    suggestion: "지인들과 함께 걷기 좋은 공원 산책로나 야외 요가를 추천해요",
    placeCategories: ["공원·산책로", "야외 요가"],
  },
  PIR: {
    typeId: "PIR",
    title: "평화추구자형",
    healingStyle: "비움과 사색형",
    emoji: "🌟",
    catchphrase: "자극을 줄이고 내면을 다스리는",
    suggestion: "고요한 깊은 숲속 산림원이나 고즈넉한 전통 찻집을 방문해 보세요.",
    placeCategories: ["전통 찻집", "산림원"],
  },
  SER: {
    typeId: "SER",
    title: "프로규칙러형",
    healingStyle: "건강 루틴형",
    emoji: "🌟",
    catchphrase: "규칙적인 신체 활동으로 활력을 주는",
    suggestion: "공원 트랙에서의 가벼운 조깅이나 트래킹 코스를 추천합니다",
    placeCategories: ["공원·산책로(러닝 코스 등)"],
  },
  PER: {
    typeId: "PER",
    title: "나는자연인형",
    healingStyle: "자연 치유형",
    emoji: "🌟",
    catchphrase: "대자연 속에서 몸과 마음을 돌보는",
    suggestion: "피톤치드가 가득한 국립 수목원이나 산림욕장에서 휴식을 취해 보세요.",
    placeCategories: ["수목원·산림원"],
  },
  SIF: {
    typeId: "SIF",
    title: "내적탐구자형",
    healingStyle: "내면 탐구형",
    emoji: "🌟",
    catchphrase: "깊이 있는 멘탈 케어에 집중하는",
    suggestion: "숲속 야외 명상 프로그램이나 조용한 찻집에서 사색을 즐겨보세요.",
    placeCategories: ["야외 명상", "전통 찻집"],
  },
  PIF: {
    typeId: "PIF",
    title: "보헤미안형",
    healingStyle: "발길 닿는 대로형",
    emoji: "🌟",
    catchphrase: "계획 없이 자유롭게 떠나는",
    suggestion: "돗자리 하나 들고 언제든 쉴 수 있는 탁 트인 피크닉 명소로 떠나보세요.",
    placeCategories: ["피크닉 명소", "공원·산책로"],
  },
};

function pickMajorityCode(
  codes: (WbtiAxisCode | undefined)[],
  poleA: WbtiAxisCode,
  poleB: WbtiAxisCode,
): WbtiAxisCode {
  const countA = codes.filter((code) => code === poleA).length;
  return countA >= 2 ? poleA : poleB;
}

/**
 * 9문항 답변을 3축(purpose/direction/action) 다수결(2/3)로 판정해 8종 유형 중 하나로 계산한다.
 * 답변이 하나라도 비어 있으면 null을 반환한다 (미완료 상태).
 */
export function calculateWbtiType(answers: WbtiAnswerMap): WbtiTypeId | null {
  const purposeCodes = TEST_PAGE_QUESTION_IDS[1].map((id) => answers[id]);
  const directionCodes = TEST_PAGE_QUESTION_IDS[2].map((id) => answers[id]);
  const actionCodes = TEST_PAGE_QUESTION_IDS[3].map((id) => answers[id]);

  const hasIncompleteAnswer = [...purposeCodes, ...directionCodes, ...actionCodes].some(
    (code) => !code,
  );

  if (hasIncompleteAnswer) {
    return null;
  }

  const purpose = pickMajorityCode(purposeCodes, "S", "P");
  const direction = pickMajorityCode(directionCodes, "E", "I");
  const action = pickMajorityCode(actionCodes, "F", "R");

  return `${purpose}${direction}${action}` as WbtiTypeId;
}
