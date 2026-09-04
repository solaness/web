export interface RecommendedPlace {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const HOME_RECOMMENDATIONS: RecommendedPlace[] = [
  {
    id: "place-1",
    name: "대흥사",
    description: "천년의 숲길에서 만나는 고요한 휴식",
    imageUrl:
      "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "place-2",
    name: "교래자연휴양림",
    description: "제주 곶자왈 속 싱그러운 산책",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "place-3",
    name: "약천원",
    description: "편안하게 쉬어 가는 웰니스 공간",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "place-4",
    name: "서울숲",
    description: "도심에서 즐기는 햇빛 산책",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
];