import { useState } from "react";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import PlaceThumbCard from "../../components/shared/PlaceThumbCard";
import CategoryFilterTabs from "../../components/shared/CategoryFilterTabs";
import SearchBar from "../../components/map/SearchBar";
import RecentSearchChips from "../../components/map/RecentSearchChips";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { CATEGORIES, DEFAULT_CATEGORY } from "../../constants/categories";
import {
  getNearbyPlaces,
  getPlacesByCategory,
  searchPlaces,
} from "../../data/mockPlaces";
import type { PlaceCategoryCode } from "../../types/place";

function MapSearch() {
  const [searchInput, setSearchInput] = useState("");
  // "" = 기본 상태, 값이 있으면 검색 후 상태 (스크린샷의 두 화면 상태 전환 기준)
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategoryCode>(DEFAULT_CATEGORY);
  const { searches: recentSearches, addSearch } = useRecentSearches();

  const handleSearchSubmit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    setSearchInput(trimmed);
    setSubmittedTerm(trimmed);
    addSearch(trimmed);
  };

  const isSearching = submittedTerm !== "";
  const matchedPlace = isSearching ? searchPlaces(submittedTerm)[0] : undefined;
  const nearbyPlaces = isSearching
    ? getNearbyPlaces(matchedPlace?.id ?? "", selectedCategory)
    : [];

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
              {matchedPlace ? (
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
              <div className="flex flex-col gap-4">
                {nearbyPlaces.map((place) => (
                  <PlaceThumbCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="mb-3 text-[20px] font-semibold text-[#754308]">
              카테고리 추천 장소
            </h2>
            <div className="flex flex-col gap-4">
              {getPlacesByCategory(selectedCategory).map((place) => (
                <PlaceThumbCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default MapSearch;
