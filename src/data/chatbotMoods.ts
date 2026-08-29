import type { PlaceCategoryCode } from "../types/place";

/**
 * 챗봇의 기분 선택지 → 추천 카테고리 매핑.
 * AI 없이도 "감정 기반 추천"이 동작하도록, 감정별로 TourAPI 카테고리 하나와
 * 고정 추천 이유 문구(replyLines)를 미리 정해둔다.
 * 실제 장소 데이터는 Chatbot.tsx에서 이 category로 areaBasedList()를 호출해 받아온다.
 */
export interface ChatbotMood {
  id: string;
  emoji: string;
  label: string;
  replyLines: string[];
  category: PlaceCategoryCode;
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
    category: "forest",
  },
  {
    id: "suffocated",
    emoji: "📱",
    label: "답답해서 숨이 턱턱 막혀요",
    replyLines: [
      "그런 날엔 탁 트인 곳으로 가보는 게 어떠냥?",
      "짠내 나는 바닷바람을 크게 들이마셔봐!",
    ],
    category: "sea",
  },
  {
    id: "irritated",
    emoji: "⚡",
    label: "작은 일에도 자꾸 짜증이 나요",
    replyLines: [
      "예민해진 날엔 달달한 게 최고다냥.",
      "조용한 카페에 앉아서 좋아하는 음료 한 잔 어때?",
    ],
    category: "cafe",
  },
  {
    id: "lost",
    emoji: "🌀",
    label: "내가 지금 뭘 하고 있는지 모르겠어요",
    replyLines: [
      "그럴 땐 몸을 움직여보는 것도 방법이다냥!",
      "새로운 체험을 하다 보면 머릿속이 저절로 정리될지도 몰라.",
    ],
    category: "experience",
  },
];
