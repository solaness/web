import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconChevronLeft from "../../assets/icons/icon-chevron-left.svg?react";
import IconBookmark from "../../assets/icons/icon-bookmark.svg?react";
import IconSun from "../../assets/icons/icon-sun.svg?react";
import DetailHeroImage from "../../components/map/DetailHeroImage";
import PlaceInfoHeader from "../../components/map/PlaceInfoHeader";
import ActionButtonBar from "../../components/map/ActionButtonBar";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import { getPlaceDetail } from "../../api/tourApi";
import { getSunScore } from "../../constants/sunScore";
import type { PlaceDetail } from "../../types/place";

// 피그마 실측값(스크롤 전 이미지 영역 높이) — 카드가 이 높이만큼 아래에서 시작해서
// 스크롤에 따라 이미지를 덮어 올라온다.
const HERO_HEIGHT = 357;
// 이 정도 스크롤되면 소개글을 두 줄 요약에서 전체 텍스트로 펼친다.
const SCROLL_EXPAND_THRESHOLD = 40;

/** 카카오맵 길찾기 딥링크 — 별도 API 키 없이 쓸 수 있는 공개 URL 스킴. */
function buildDirectionsUrl(place: PlaceDetail): string {
  const encodedName = encodeURIComponent(place.name);

  if (place.lat != null && place.lng != null) {
    return `https://map.kakao.com/link/to/${encodedName},${place.lat},${place.lng}`;
  }

  return `https://map.kakao.com/link/search/${encodedName}`;
}

function MapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [retryToken, setRetryToken] = useState(0);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    getPlaceDetail({ id, signal: controller.signal })
      .then((detail) => {
        setPlace(detail);
        setStatus("success");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("장소 상세 조회 실패:", error);
        setStatus("error");
      });

    return () => controller.abort();
  }, [id, retryToken]);

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: place?.name, url: shareUrl });
      } catch {
        // 사용자가 공유를 취소한 경우 등 — 별도 처리 없음
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 — 별도 처리 없음
    }
  };

  if (status === "loading") {
    return (
      <main className="mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col bg-[#FFFDF6]">
        <LoadingScreen message="장소 정보를 불러오는 중..." />
      </main>
    );
  }

  if (status === "error" || !place) {
    return (
      <main className="mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col bg-[#FFFDF6]">
        <ErrorScreen
          message="장소 정보를 불러오지 못했어요."
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      </main>
    );
  }

  const sunScore = getSunScore(place.categories, place.name);
  const directionsUrl = buildDirectionsUrl(place);
  // 스크롤해서 카드가 올라오면(isScrolled) "더보기"를 누른 것과 같은 효과로 전체 텍스트를 펼친다.
  const showFullOverview = overviewExpanded || isScrolled;

  return (
    <main className="relative mx-auto h-[100dvh] min-h-[600px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6]">
      <DetailHeroImage imageUrl={place.thumbnailUrl} placeName={place.name} />

      <div className="absolute inset-0 flex flex-col">
        <div
          className="flex-1 overflow-y-auto"
          onScroll={(event) =>
            setIsScrolled(event.currentTarget.scrollTop > SCROLL_EXPAND_THRESHOLD)
          }
        >
          <div style={{ height: HERO_HEIGHT }} />

          <div
            className="relative flex flex-col gap-4 rounded-t-[32px] bg-[#FFFDF6] px-[22px] pb-6 pt-3"
            style={{ minHeight: `calc(100dvh - ${HERO_HEIGHT}px)` }}
          >
            <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-[#D9D9D9]" />

            <PlaceInfoHeader place={place} rating={null} onShare={handleShare} />

            {linkCopied && (
              <p className="text-xs text-[#B3B3B3]">링크를 복사했어요</p>
            )}

            <span className="flex items-center gap-1 text-[15px] font-semibold text-[#FFAC27]">
              <IconSun className="h-4 w-4" />
              햇빛 점수 {sunScore}점
            </span>

            <section className="flex flex-col items-start gap-1">
              <h2 className="text-lg font-bold text-[#F78903]">
                Wellness Program...
              </h2>
              <p
                className={`text-sm leading-relaxed text-[#754308] ${
                  showFullOverview ? "" : "line-clamp-2"
                }`}
              >
                {place.overview || "등록된 소개글이 없어요."}
              </p>
              {place.overview && !showFullOverview && (
                <button
                  type="button"
                  onClick={() => setOverviewExpanded(true)}
                  className="self-end text-sm font-semibold text-[#F78903]"
                >
                  더보기
                </button>
              )}
            </section>
          </div>
        </div>

        <ActionButtonBar reserveUrl={place.homepageUrl || null} directionsUrl={directionsUrl} />
      </div>

      {/* 스크롤 오버레이(위 div)가 히어로 이미지 영역까지 투명하게 덮고 있어서, 그 위의
          버튼은 오버레이보다 뒤에(DOM 순서상 이전에) 두면 클릭을 못 받는다 — 항상 맨 위에 그린다. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="이전 화면으로 이동"
        className="absolute left-2 top-[54px] flex h-11 w-12 items-center justify-center text-white"
      >
        <IconChevronLeft className="text-white" />
      </button>

      <button
        type="button"
        onClick={() => setIsBookmarked((prev) => !prev)}
        aria-label={isBookmarked ? "북마크 해제" : "북마크"}
        aria-pressed={isBookmarked}
        className="absolute right-4 top-[54px] flex h-9 w-9 items-center justify-center text-white"
      >
        <IconBookmark
          className="h-[22px] w-[18px]"
          fill={isBookmarked ? "currentColor" : "none"}
        />
      </button>
    </main>
  );
}

export default MapDetail;
