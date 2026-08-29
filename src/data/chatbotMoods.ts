import type { Place } from "../types/place";

/**
 * 챗봇 UI(목데이터) 단계에서 쓰는 기분 선택지.
 * 감정→카테고리 매핑/추천 이유 로직은 별도 이슈(감정 기반 추천 데이터 연동)에서
 * TourAPI 실데이터로 교체한다 — 여기 recommendations는 화면 확인용 목데이터.
 */
export interface ChatbotMood {
  id: string;
  emoji: string;
  label: string;
  replyLines: string[];
  recommendations: Place[];
}

export const CHATBOT_MOODS: ChatbotMood[] = [
  {
    id: "blank",
    emoji: "🤯",
    label: "뇌가 멍하고 아무것도 집중이 안 돼요",
    replyLines: [
      "그럴땐 스마트폰을 넣고,",
      "수평선이나 나뭇잎의 움직임을 멍하니 바라보는게 좋다냥!",
    ],
    recommendations: [
      {
        id: "mock-forest-1",
        name: "치악산 자연휴양림",
        address: "강원 원주시",
        category: "forest",
        thumbnailUrl: "",
      },
      {
        id: "mock-forest-2",
        name: "월정사 전나무숲길",
        address: "강원 평창군",
        category: "forest",
        thumbnailUrl: "",
      },
    ],
  },
  {
    id: "suffocated",
    emoji: "📱",
    label: "답답해서 숨이 턱턱 막혀요",
    replyLines: [
      "그런 날엔 탁 트인 곳으로 가보는 게 어떠냥?",
      "짠내 나는 바닷바람을 크게 들이마셔봐!",
    ],
    recommendations: [
      {
        id: "mock-sea-1",
        name: "경포해변",
        address: "강원 강릉시",
        category: "sea",
        thumbnailUrl: "",
      },
      {
        id: "mock-sea-2",
        name: "주문진 방파제",
        address: "강원 강릉시",
        category: "sea",
        thumbnailUrl: "",
      },
    ],
  },
  {
    id: "irritated",
    emoji: "⚡",
    label: "작은 일에도 자꾸 짜증이 나요",
    replyLines: [
      "예민해진 날엔 달달한 게 최고다냥.",
      "조용한 카페에 앉아서 좋아하는 음료 한 잔 어때?",
    ],
    recommendations: [
      {
        id: "mock-cafe-1",
        name: "테라로사 커피공장",
        address: "강원 강릉시",
        category: "cafe",
        thumbnailUrl: "",
      },
      {
        id: "mock-cafe-2",
        name: "툇마루 카페",
        address: "강원 강릉시",
        category: "cafe",
        thumbnailUrl: "",
      },
    ],
  },
  {
    id: "lost",
    emoji: "🌀",
    label: "내가 지금 뭘 하고 있는지 모르겠어요",
    replyLines: [
      "그럴 땐 몸을 움직여보는 것도 방법이다냥!",
      "새로운 체험을 하다 보면 머릿속이 저절로 정리될지도 몰라.",
    ],
    recommendations: [
      {
        id: "mock-exp-1",
        name: "경포 서핑스쿨",
        address: "강원 강릉시",
        category: "experience",
        thumbnailUrl: "",
      },
      {
        id: "mock-exp-2",
        name: "오죽헌 한복 체험",
        address: "강원 강릉시",
        category: "experience",
        thumbnailUrl: "",
      },
    ],
  },
];
