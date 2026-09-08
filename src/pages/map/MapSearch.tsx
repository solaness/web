import { useEffect, useState } from "react";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import PlaceThumbCard from "../../components/shared/PlaceThumbCard";
import PlaceThumbCardSkeleton from "../../components/shared/PlaceThumbCardSkeleton";
import CategoryFilterTabs from "../../components/shared/CategoryFilterTabs";
import SearchBar from "../../components/map/SearchBar";
import RecentSearchChips from "../../components/map/RecentSearchChips";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { useUserLocation } from "../../hooks/useUserLocation";
import { CATEGORIES, DEFAULT_CATEGORY } from "../../constants/categories";
import { areaBasedList, locationBasedList, searchKeyword } from "../../api/tourApi";
import { getDailyPageNo, getTodaySeed, seededShuffle } from "../../utils/dailyVariety";
import type { Place, PlaceCategoryCode } from "../../types/place";

const NEARBY_LIMIT = 4;
// 검색된 장소와 겹쳐서 제외될 여유분까지 감안해 조금 더 받아온다.
const NEARBY_FETCH_SIZE = NEARBY_LIMIT + 1;
// "근처"의 기준 반경(미터). 도보~짧은 이동 거리로 갈 만한 범위로 잡는다.
const NEARBY_RADIUS_METERS = 10_000;
// GeolocationPositionError.PERMISSION_DENIED (브라우저 표준값, 매직넘버 대신 이름으로 남긴다)
const GEOLOCATION_PERMISSION_DENIED_CODE = 1;
// 카테고리 목록 한 번에 보여줄 개수. cat3(소분류)로 클라이언트에서 한 번 더 걸러내는
// 카테고리(카페 등)는 표본이 작으면 이 20개 안에 하나도 안 걸려 결과가 빌 수 있는데,
// 아래 CATEGORY_DAILY_PAGE_POOL_SIZE로 날짜마다 다른 pageNo를 도니 특정 날에 한해서만
// 비어 보이는 정도로 완화된다.
const CATEGORY_LIST_FETCH_SIZE = 20;
// "카테고리 추천 장소"가 매일 완전히 똑같지 않도록, 인기순 TOP (이 값 * CATEGORY_LIST_FETCH_SIZE)위
// 안에서 날짜 기준으로 pageNo를 순환시킨다 (dailyVariety.ts 참고).
const CATEGORY_DAILY_PAGE_POOL_SIZE = 5;
// 로딩 중 보여줄 스켈레톤 카드 개수. 실제로 몇 개가 올지 모르니, 화면에 바로 보이는
// 정도로만 적당히 잡는다(전체 개수와 맞출 필요 없음).
const CATEGORY_SKELETON_COUNT = 4;

function MapSearch() {
  const [searchInput, setSearchInput] = useState("");
  // "" = 기본 상태, 값이 있으면 검색 후 상태 (스크린샷의 두 화면 상태 전환 기준)
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategoryCode>(DEFAULT_CATEGORY);
  const { searches: recentSearches, addSearch } = useRecentSearches();
  const userLocation = useUserLocation();

  const [categoryPlaces, setCategoryPlaces] = useState<Place[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);

  const [matchedPlace, setMatchedPlace] = useState<Place | undefined>();
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const isSearching = submittedTerm !== "";

  const handleSearchSubmit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    setSearchInput(trimmed);
    setSubmittedTerm(trimmed);
    addSearch(trimmed);
  };

  // 카테고리가 바뀔 때마다(초기 진입 포함) 해당 카테고리 목록을 조회한다.
  useEffect(() => {
    const controller = new AbortController();
    // StrictMode 등으로 effect가 두 번 실행되면 먼저 취소된(aborted) 호출의 뒤늦은
    // then/catch/finally가 나중에 시작된 진짜 요청의 상태(로딩/에러)를 덮어쓸 수 있다 —
    // 이 요청이 취소됐는지를 이 플래그로 직접 확인해서 막는다.
    let cancelled = false;

    setIsBrowseLoading(true);
    setBrowseError(null);

    const today = new Date();

    areaBasedList({
      category: selectedCategory,
      numOfRows: CATEGORY_LIST_FETCH_SIZE,
      pageNo: getDailyPageNo(CATEGORY_DAILY_PAGE_POOL_SIZE, today),
      signal: controller.signal,
    })
      .then((result) => {
        if (cancelled) return;
        setCategoryPlaces(seededShuffle(result.places, getTodaySeed(today)));
      })
      .catch((error) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("장소 목록 조회 실패:", error);
        setBrowseError("장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsBrowseLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedCategory]);

  // 검색어가 제출됐을 때만 검색을 실행한다.
  useEffect(() => {
    if (!isSearching) {
      setMatchedPlace(undefined);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setIsSearchLoading(true);
    setSearchError(null);

    searchKeyword({
      keyword: submittedTerm,
      category: selectedCategory,
      signal: controller.signal,
    })
      .then((result) => {
        if (cancelled) return;
        setMatchedPlace(result.places[0]);
      })
      .catch((error) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("장소 검색 실패:", error);
        setSearchError("검색에 실패했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsSearchLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [submittedTerm, selectedCategory, isSearching]);

  // 검색 결과를 봤을 때만 "근처에서 가볼만한 곳"이 보이니, 검색 중이고 위치를 확보했을 때만 조회한다.
  useEffect(() => {
    if (!isSearching) {
      setNearbyPlaces([]);
      setNearbyError(null);
      return;
    }

    if (userLocation.status === "loading") {
      return;
    }

    if (userLocation.status === "error" || !userLocation.coords) {
      setNearbyPlaces([]);
      setNearbyError(
        userLocation.errorCode === GEOLOCATION_PERMISSION_DENIED_CODE
          ? "위치 권한을 허용하면 근처 장소를 보여드릴 수 있어요."
          : "위치를 확인하지 못했어요.",
      );
      return;
    }

    const { latitude, longitude } = userLocation.coords;
    const controller = new AbortController();
    let cancelled = false;

    setIsNearbyLoading(true);
    setNearbyError(null);

    locationBasedList({
      category: selectedCategory,
      latitude,
      longitude,
      radiusMeters: NEARBY_RADIUS_METERS,
      numOfRows: NEARBY_FETCH_SIZE,
      signal: controller.signal,
    })
      .then((result) => {
        if (cancelled) return;
        setNearbyPlaces(
          result.places
            .filter((place) => place.id !== matchedPlace?.id)
            .slice(0, NEARBY_LIMIT),
        );
      })
      .catch((error) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        console.error("근처 장소 조회 실패:", error);
        setNearbyError("근처 장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsNearbyLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    isSearching,
    selectedCategory,
    userLocation.status,
    userLocation.coords,
    userLocation.errorCode,
    matchedPlace?.id,
  ]);

  return (
    <main
      className="relative mx-auto min-h-screen w-full max-w-[393px] overflow-x-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 px-[19px] pt-6">
        <h1 className="text-[32px] font-bold text-[#F78903]">Solaness</h1>

        <div className="mt-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <div className="mt-4">
          <CategoryFilterTabs
            categories={CATEGORIES}
            selectedCode={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </header>

      <section className="relative z-10 px-[19px] pb-8 pt-6">
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-[13px] font-semibold text-[#4F4F4F]">
              최근 검색
            </h2>
            <RecentSearchChips
              searches={recentSearches}
              onSelect={handleSearchSubmit}
            />
          </div>
        )}

        {isSearching ? (
          <>
            <div className="mb-6">
              <h2 className="mb-3 text-[20px] font-semibold text-[#754308]">
                {`"${submittedTerm}" 검색 결과`}
              </h2>
              {isSearchLoading ? (
                <PlaceThumbCardSkeleton />
              ) : searchError ? (
                <p className="text-sm font-bold text-red-500">{searchError}</p>
              ) : matchedPlace ? (
                <PlaceThumbCard place={matchedPlace} />
              ) : (
                <p className="text-sm text-[#B3B3B3]">
                  검색 결과가 없어요
                </p>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-[20px] font-semibold text-[#754308]">
                근처에서 가볼만한 곳
              </h2>
              {userLocation.status === "loading" || isNearbyLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: NEARBY_LIMIT }).map((_, index) => (
                    <PlaceThumbCardSkeleton key={index} />
                  ))}
                </div>
              ) : nearbyError ? (
                <p className="text-sm font-bold text-[#B3B3B3]">{nearbyError}</p>
              ) : nearbyPlaces.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {nearbyPlaces.map((place) => (
                    <PlaceThumbCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#B3B3B3]">
                  근처에 가볼만한 곳이 없어요
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="mb-3 text-[20px] font-semibold text-[#754308]">
              카테고리 추천 장소
            </h2>
            {isBrowseLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: CATEGORY_SKELETON_COUNT }).map((_, index) => (
                  <PlaceThumbCardSkeleton key={index} />
                ))}
              </div>
            ) : browseError ? (
              <p className="text-sm font-bold text-red-500">{browseError}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {categoryPlaces.map((place) => (
                  <PlaceThumbCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default MapSearch;
