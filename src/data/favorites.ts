import type { DailyActivity } from "./historyCalendar";

/**
 * 즐겨찾기 백엔드/데이터 모델이 아직 없어서(북마크 저장은 MapDetail의 로컬 state뿐),
 * 방문 기록과 동일한 티켓 컴포넌트(VisitRecordCard)를 그대로 재사용할 수 있게
 * DailyActivity 타입 그대로 목업 데이터를 둔다.
 */
export const SAMPLE_FAVORITES: DailyActivity[] = [
  {
    id: "favorite-1",
    date: "2026-07-03",
    placeId: "place-3",
    placeName: "대흥사",
    address: "전라남도 해남군",
    category: "산림",
    sunshineScore: 5,
    sunshineMinutes: 0,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "favorite-2",
    date: "2026-07-03",
    placeId: "place-4",
    placeName: "약석원",
    address: "인천광역시 강화군",
    category: "온천",
    sunshineScore: 4,
    sunshineMinutes: 0,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "favorite-3",
    date: "2026-07-03",
    placeId: "place-2",
    placeName: "교래자연휴양림",
    address: "제주특별자치도 제주시",
    category: "산림",
    sunshineScore: 5,
    sunshineMinutes: 0,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-88270788b888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "favorite-4",
    date: "2026-07-03",
    placeId: "place-5",
    placeName: "한라수목원",
    address: "제주특별자치도 제주시",
    category: "수목원",
    sunshineScore: 5,
    sunshineMinutes: 0,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80",
  },
];
