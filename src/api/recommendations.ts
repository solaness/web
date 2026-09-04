//관광공사 api 연결 -> 홈 화면에 추천장소 뜨는거, 백엔드에서 firebase function 받아오기
import type {
  RecommendedPlace,
} from "../data/homeRecommendations";

export async function fetchRecommendations():
  Promise<RecommendedPlace[]> {
  const response = await fetch(
    "/api/recommendations",
  );

  if (!response.ok) {
    throw new Error(
      "추천 장소를 불러오지 못했습니다.",
    );
  }

  return response.json() as Promise<
    RecommendedPlace[]
  >;
}