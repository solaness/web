export interface DailyActivity {
  id: string;
  date: string;
  placeId: string;
  placeName: string;
  address: string;
  category: string;
  sunshineScore: number;
  sunshineMinutes: number;
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
  },
  {
    id: "activity-3",
    date: "2026-07-10",
    placeId: "place-3",
    placeName: "대흥사",
    address: "전라남도 해남군",
    category: "산림",
    sunshineScore: 62,
    sunshineMinutes: 42,
  },
  {
    id: "activity-4",
    date: "2026-07-12",
    placeId: "place-4",
    placeName: "약석원",
    address: "인천광역시",
    category: "온천",
    sunshineScore: 55,
    sunshineMinutes: 36,
  },
  {
    id: "activity-5",
    date: "2026-07-15",
    placeId: "place-5",
    placeName: "한라수목원",
    address: "제주특별자치도 제주시",
    category: "수목원",
    sunshineScore: 70,
    sunshineMinutes: 47,
  },
];

export const SAMPLE_TRAVEL_SCHEDULES: TravelSchedule[] = [
  {
    id: "travel-1",
    title: "제주 웰니스 여행",
    startDate: "2026-07-12",
    endDate: "2026-07-15",
  },
];