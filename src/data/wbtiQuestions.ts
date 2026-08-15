import type { WbtiQuestion } from "../types/wbti";

/**
 * WBTI 9문항 = 3축(purpose/direction/action) × 3문항.
 * 온보딩 test/1~3 페이지가 3문항씩 나눠서 사용한다 (TEST_PAGE_QUESTION_IDS 참고).
 */
export const WBTI_QUESTIONS: WbtiQuestion[] = [
  {
    id: 1,
    axis: "purpose",
    emoji: "🌿",
    prompt: "힐링 스팟이 마음에 들었을 때 나는?",
    options: [
      { code: "S", label: "SNS에 업로드하거나 친구들에게 공유한다" },
      { code: "P", label: "조용히 나만의 아지트로 저장한다" },
    ],
  },
  {
    id: 2,
    axis: "purpose",
    emoji: "🛏️",
    prompt: "가장 이상적인 주말의 휴식은?",
    options: [
      { code: "S", label: "사람들과 좋은 공간에서 수다 떨기" },
      { code: "P", label: "방해받지 않는 혼자만의 시간" },
    ],
  },
  {
    id: 3,
    axis: "purpose",
    emoji: "🕶️",
    prompt: "새로운 웰니스 트렌드를 접했을 때 나는?",
    options: [
      { code: "S", label: "지인/크루원에게 같이 가자고 제안" },
      { code: "P", label: "혼자 또는 친한 한 명과 조용히" },
    ],
  },
  {
    id: 4,
    axis: "direction",
    emoji: "⛹️",
    prompt: "최근 더 신경 쓰는 건강 영역은?",
    options: [
      { code: "E", label: "체중·피부·체력 등 신체적 건강" },
      { code: "I", label: "스트레스·멘탈·감정 등 정신적 건강" },
    ],
  },
  {
    id: 5,
    axis: "direction",
    emoji: "☕",
    prompt: "지친 하루 끝에 가장 먼저 찾는 것은?",
    options: [
      { code: "E", label: "운동, 브런치, 영양 가득한 식사" },
      { code: "I", label: "명상, 따뜻한 차, 조용한 음악" },
    ],
  },
  {
    id: 6,
    axis: "direction",
    emoji: "💭",
    prompt: "특정 장소 방문 시 기대하는 가장 큰 효과는?",
    options: [
      { code: "E", label: "몸이 가벼워지고 생기 도는 기분" },
      { code: "I", label: "머릿속이 맑아지고 마음이 평온해지는 기분" },
    ],
  },
  {
    id: 7,
    axis: "action",
    emoji: "🤩",
    prompt: "평소 나의 힐링/여가 스타일은?",
    options: [
      { code: "F", label: "핫한 팝업·이색 장소를 찾아다니는 유행 스타일" },
      { code: "R", label: "익숙한 장소·정해진 루틴을 반복하는 규칙적 스타일" },
    ],
  },
  {
    id: 8,
    axis: "action",
    emoji: "🧺",
    prompt: "야외 피크닉/산책을 가기로 했을 때 나의 계획은?",
    options: [
      { code: "F", label: "날씨·기분에 따라 즉흥적으로 결정" },
      { code: "R", label: "시간·경로·장소를 미리 계획" },
    ],
  },
  {
    id: 9,
    axis: "action",
    emoji: "📍",
    prompt: "웰니스 활동 지속의 원동력은?",
    options: [
      { code: "F", label: "그때그때 감정에 맞춘 자유로운 선택" },
      { code: "R", label: "일정하게 지켜내는 규칙과 습관" },
    ],
  },
];

/** test/1~3 페이지가 각각 담당하는 문항 id 목록 */
export const TEST_PAGE_QUESTION_IDS: Record<1 | 2 | 3, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
};

export function getQuestionsByIds(ids: number[]): WbtiQuestion[] {
  return ids
    .map((id) => WBTI_QUESTIONS.find((question) => question.id === id))
    .filter((question): question is WbtiQuestion => Boolean(question));
}
