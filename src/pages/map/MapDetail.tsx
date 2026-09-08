import { useEffect, useRef, useState } from "react";
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

// 이 정도 위로 스와이프하면 소개글을 펼친다(아래로 다시 스와이프하면 되돌아간다).
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

  // 카드가 항상 화면 아래에 붙어있어야 해서(스크롤 가능한 긴 콘텐츠가 아니라 카드 자체가 짧다),
  // 네이티브 overflow 스크롤 대신 위/아래 스와이프·휠 제스처를 직접 누적해서 isScrolled를 전환한다.
  // 이렇게 하면 사진 영역이든 카드 위든 화면 어디를 터치해도 동일하게 반응한다.
  const gestureOffsetRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  const applyGestureDelta = (deltaY: number) => {
    const next = Math.min(
      Math.max(gestureOffsetRef.current + deltaY, 0),
      SCROLL_EXPAND_THRESHOLD * 2,
    );
    gestureOffsetRef.current = next;
    setIsScrolled(next > SCROLL_EXPAND_THRESHOLD);
  };

  const handleWheel = (event: React.WheelEvent) => applyGestureDelta(event.deltaY);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const currentY = event.touches[0]?.clientY;
    if (touchStartYRef.current == null || currentY == null) {
      return;
    }

    // 위로 스와이프(손가락이 위로 이동)할수록 deltaY가 양수가 되도록 부호를 맞춘다.
    applyGestureDelta(touchStartYRef.current - currentY);
    touchStartYRef.current = currentY;
  };

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setIsScrolled(false);
    setIsBookmarked(false);
    setOverviewExpanded(false);
    setLinkCopied(false);
    gestureOffsetRef.current = 0;

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

  return (
    <main className="relative mx-auto h-[100dvh] min-h-[600px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6]">
      <DetailHeroImage imageUrl={place.thumbnailUrl} placeName={place.name} />

      {/*
        카드는 항상 화면 맨 아래(ActionButtonBar 바로 위)에 붙어있고, 그 위 남는 공간엔 히어로
        사진이 그대로 비쳐 보인다(justify-end로 두 요소를 바닥에 고정) — 실제 스크롤 가능한
        콘텐츠가 아니라 카드 자체가 짧아서, 네이티브 overflow 스크롤 대신 이 wrapper 전체에서
        휠/터치 제스처를 직접 감지한다(handleWheel/handleTouchMove) — 그래야 사진이든 카드든
        화면 어디를 스와이프해도 똑같이 반응한다.
      */}
      <div
        className="absolute inset-0 flex flex-col justify-end"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="relative flex flex-col gap-4 rounded-t-[32px] bg-[#FFFDF6] px-[22px] pb-6 pt-3">
          <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-[#D9D9D9]" />

          <PlaceInfoHeader place={place} rating={null} onShare={handleShare} />

          {linkCopied && (
            <p className="text-xs text-[#B3B3B3]">링크를 복사했어요</p>
          )}

          {/* 스크롤 전엔 햇빛 점수만, 스크롤 후엔 그 자리에 소개글 섹션이 나타난다(둘이 동시에 보이지 않음). */}
          {isScrolled ? (
            <section className="flex flex-col items-start gap-1">
              <h2 className="text-lg font-bold text-[#F78903]">
                Wellness Program...
              </h2>
              <p
                className={`text-sm leading-relaxed text-[#754308] ${
                  overviewExpanded ? "" : "line-clamp-5"
                }`}
              >
                {place.overview || "등록된 소개글이 없어요."}
              </p>
              {place.overview && !overviewExpanded && (
                <button
                  type="button"
                  onClick={() => setOverviewExpanded(true)}
                  className="self-end text-sm font-semibold text-[#F78903]"
                >
                  더보기
                </button>
              )}
            </section>
          ) : (
            <span className="flex items-center gap-1 text-[15px] font-semibold text-[#FFAC27]">
              <IconSun className="h-4 w-4" />
              햇빛 점수 {sunScore}점
            </span>
          )}
        </div>

        <ActionButtonBar reserveUrl={place.homepageUrl || null} directionsUrl={directionsUrl} />
      </div>

      {/* 제스처 감지 wrapper(위 div)가 히어로 이미지 영역까지 투명하게 덮고 있어서, 그 위의
          버튼은 wrapper보다 뒤에(DOM 순서상 이전에) 두면 클릭을 못 받는다 — 항상 맨 위에 그린다. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="이전 화면으로 이동"
        className="absolute left-2 top-[54px] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-black/40 text-white"
      >
        <IconChevronLeft className="text-white" />
      </button>

      <button
        type="button"
        onClick={() => setIsBookmarked((prev) => !prev)}
        aria-label={isBookmarked ? "북마크 해제" : "북마크"}
        aria-pressed={isBookmarked}
        className="absolute right-4 top-[54px] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-black/40 text-white"
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
