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
