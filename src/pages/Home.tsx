import { useEffect, useState } from "react";
import RecommendList from "../components/home/RecommendList";
import RecommendListSkeleton from "../components/home/RecommendListSkeleton";
import SunshineCardSlider from "../components/home/SunshineCardSlider";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";
import ErrorScreen from "../components/shared/ErrorScreen";
import { areaBasedList } from "../api/tourApi";
import { toTourApiAreaCode } from "../constants/tourApiAreaCodes";
import { useUserProfile } from "../hooks/useUserProfile";
import type { Place } from "../types/place";
import AppTitle from "../components/shared/AppTitle";

const RECOMMENDATION_COUNT = 10;

function Home() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [retryToken, setRetryToken] = useState(0);

  // 로그인 사용자는 온보딩에서 고른 지역, 게스트/지역 미설정이면 서울을 기본값으로 쓴다
  // (toTourApiAreaCode가 그 폴백을 담당).
  useEffect(() => {
    if (isProfileLoading) {
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    areaBasedList({
      category: "all",
      areaCode: toTourApiAreaCode(profile?.regionProvinceCode),
      numOfRows: RECOMMENDATION_COUNT,
      signal: controller.signal,
    })
      .then((result) => {
        setPlaces(result.places);
        setStatus("success");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("추천 장소를 불러오지 못했어요:", error);
        setStatus("error");
      });

    return () => controller.abort();
  }, [isProfileLoading, profile?.regionProvinceCode, retryToken]);

  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-md overflow-hidden bg-[#FFFDF6] px-[11px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 mb-5 ml-[8px] mt-[4px]">
        <AppTitle
          titleClassName="text-[32px] font-bold text-[#F78903]"
        />
      </header>

      <SunshineCardSlider />

      {status === "loading" && <RecommendListSkeleton />}

      {status === "error" && (
        <ErrorScreen
          message="추천 장소를 불러오지 못했어요."
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      )}

      {status === "success" &&
        (places.length > 0 ? (
          <RecommendList places={places} />
        ) : (
          <p className="mt-7 text-center text-sm text-[#B3B3B3]">
            주변에 추천할 장소가 없어요.
          </p>
        ))}
    </main>
  );
}

export default Home;
