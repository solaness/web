import { useEffect, useState } from "react";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import PlaceThumbCard from "../../components/shared/PlaceThumbCard";
import CategoryFilterTabs from "../../components/shared/CategoryFilterTabs";
import SearchBar from "../../components/map/SearchBar";
import RecentSearchChips from "../../components/map/RecentSearchChips";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { CATEGORIES, DEFAULT_CATEGORY } from "../../constants/categories";
import { areaBasedList, searchKeyword } from "../../api/tourApi";
import type { Place, PlaceCategoryCode } from "../../types/place";

const NEARBY_LIMIT = 4;
// 카페처럼 cat3(소분류)로 클라이언트에서 한 번 더 걸러내는 카테고리는 표본이 작으면
// 인기순 상위권에 아예 안 걸려 결과가 자주 비므로, numOfRows를 넉넉히 잡는다.
const CATEGORY_LIST_FETCH_SIZE = 50;

function MapSearch() {
  const [searchInput, setSearchInput] = useState("");
  // "" = 기본 상태, 값이 있으면 검색 후 상태 (스크린샷의 두 화면 상태 전환 기준)
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategoryCode>(DEFAULT_CATEGORY);
  const { searches: recentSearches, addSearch } = useRecentSearches();

  const [categoryPlaces, setCategoryPlaces] = useState<Place[]>([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);

  const [matchedPlace, setMatchedPlace] = useState<Place | undefined>();
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

    setIsBrowseLoading(true);
    setBrowseError(null);

    areaBasedList({
      category: selectedCategory,
      numOfRows: CATEGORY_LIST_FETCH_SIZE,
      signal: controller.signal,
    })
      .then((result) => setCategoryPlaces(result.places))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("장소 목록 조회 실패:", error);
        setBrowseError("장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsBrowseLoading(false));

    return () => controller.abort();
  }, [selectedCategory]);

  // 검색어가 제출됐을 때만 검색을 실행한다.
  useEffect(() => {
    if (!isSearching) {
      setMatchedPlace(undefined);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();

    setIsSearchLoading(true);
    setSearchError(null);

    searchKeyword({
      keyword: submittedTerm,
      category: selectedCategory,
      signal: controller.signal,
    })
      .then((result) => setMatchedPlace(result.places[0]))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("장소 검색 실패:", error);
        setSearchError("검색에 실패했어요. 잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsSearchLoading(false));

    return () => controller.abort();
  }, [submittedTerm, selectedCategory, isSearching]);

  // 위치 기반 "근처" 개념이 아직 없어서, 같은 카테고리 목록에서 검색된 장소만 제외한 나머지를 보여준다.
  const nearbyPlaces = categoryPlaces
    .filter((place) => place.id !== matchedPlace?.id)
    .slice(0, NEARBY_LIMIT);

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
                <p className="text-sm text-[#B3B3B3]">불러오는 중...</p>
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
              {isBrowseLoading ? (
                <p className="text-sm text-[#B3B3B3]">불러오는 중...</p>
              ) : browseError ? (
                <p className="text-sm font-bold text-red-500">{browseError}</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {nearbyPlaces.map((place) => (
                    <PlaceThumbCard key={place.id} place={place} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="mb-3 text-[20px] font-semibold text-[#754308]">
              카테고리 추천 장소
            </h2>
            {isBrowseLoading ? (
              <p className="text-sm text-[#B3B3B3]">불러오는 중...</p>
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
