export interface DailyActivity {
  id: string;
  date: string;
  placeId: string;
  placeName: string;
  address: string;
  category: string;
  sunshineScore: number;
  sunshineMinutes: number;
  imageUrl?: string;
  visitStatus?: string;
  visitStartTime?: string;
  visitEndTime?: string;
  activityNote?: string;
  scorePerMinute: number;
}

export interface TravelSchedule {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export const SAMPLE_ACTIVITIES: DailyActivity[] = [
  {
    id: "activity-1",
    date: "2026-07-01",
    placeId: "place-1",
    placeName: "서울숲",
    address: "서울특별시 성동구",
    category: "공원",
    sunshineScore: 67,
    sunshineMinutes: 34,
    scorePerMinute: 3,
    visitStatus: "산책",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "activity-2",
    date: "2026-07-09",
    placeId: "place-2",
    placeName: "교래자연휴양림",
    address: "제주특별자치도 제주시",
    category: "산림",
    sunshineScore: 74,
    sunshineMinutes: 58,
    scorePerMinute: 3,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-88270788b888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "activity-3",
    date: "2026-09-10",
    placeId: "place-3",
    placeName: "대흥사",
    address: "전라남도 해남군",
    category: "산림",
    sunshineScore: 240,
    sunshineMinutes: 80,
    scorePerMinute: 3,
    visitStatus: "산림",
    visitStartTime: "14:00",
    visitEndTime: "15:20",
    activityNote:
      "대흥사 경내를 천천히 둘러보며 산책했다. 조용한 풍경 속에서 여유롭게 시간을 보냈다.",
    imageUrl:
      "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "activity-4",
    date: "2026-07-12",
    placeId: "place-4",
    placeName: "약석원",
    address: "인천광역시 강화군",
    category: "온천",
    sunshineScore: 55,
    sunshineMinutes: 36,
    scorePerMinute: 3,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "activity-5",
    date: "2026-09-15",
    placeId: "place-5",
    placeName: "한라수목원",
    address: "제주특별자치도 제주시",
    category: "수목원",
    sunshineScore: 70,
    sunshineMinutes: 47,
    scorePerMinute: 3,
    visitStatus: "산림",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80",
  },
];

/**
 * Firestore 연동 전까지, 새로 기록한 방문을 목업 배열에 추가하는 유일한 창구.
 * 컴포넌트가 SAMPLE_ACTIVITIES를 직접 push하지 않고 이 함수를 거치게 한다.
 */
export function addActivity(activity: DailyActivity): void {
  SAMPLE_ACTIVITIES.push(activity);
}

export const SAMPLE_TRAVEL_SCHEDULES: TravelSchedule[] = [
  {
    id: "travel-1",
    title: "제주 웰니스 여행",
    startDate: "2026-07-12",
    endDate: "2026-07-15",
  },
];