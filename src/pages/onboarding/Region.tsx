import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DistrictSelector from "../../components/onboarding/DistrictSelector";
import RegionDropdown from "../../components/onboarding/RegionDropdown";
import { REGIONS } from "../../data/regions";

interface StoredRegion {
  region: string;
  district: string;
}

const STORAGE_KEY = "onboardingRegion";

function getStoredRegion(): StoredRegion {
  const storedValue = sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return {
      region: "",
      district: "",
    };
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<StoredRegion>;

    return {
      region: parsedValue.region ?? "",
      district: parsedValue.district ?? "",
    };
  } catch {
    return {
      region: "",
      district: "",
    };
  }
}

function Region() {
  const navigate = useNavigate();
  const storedRegion = useMemo(() => getStoredRegion(), []);

  const [selectedRegion, setSelectedRegion] = useState(
    storedRegion.region,
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    storedRegion.district,
  );

  const regionNames = useMemo(
    () => REGIONS.map((region) => region.name),
    [],
  );

  const districts = useMemo(() => {
    return (
      REGIONS.find(
        (region) => region.name === selectedRegion,
      )?.districts ?? []
    );
  }, [selectedRegion]);

  const canProceed =
    selectedRegion.length > 0 &&
    selectedDistrict.length > 0;

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict("");
  };

  const handlePrevious = () => {
    navigate("/onboarding/login");
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        region: selectedRegion,
        district: selectedDistrict,
      }),
    );

    navigate("/onboarding/test/1");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-5 pb-6 pt-5">
      <header className="mb-10">
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
            onClick={handlePrevious}
            aria-label="이전 화면으로 이동"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex-1">
            <div className="mb-2 flex justify-end">
              <span className="text-sm font-medium text-gray-500">
                1/4
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-orange-100"
              role="progressbar"
              aria-label="온보딩 진행률"
              aria-valuemin={1}
              aria-valuemax={4}
              aria-valuenow={1}
            >
              <div className="h-full w-1/4 rounded-full bg-orange-500" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold leading-snug text-gray-900">
          거주 지역을 알려주세요!
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          선택한 지역을 바탕으로 가까운 힐링 스팟을 추천해드려요.
        </p>
      </header>

      <section className="flex-1">
        <label className="mb-3 block text-base font-semibold text-gray-900">
          시·도
        </label>

        <RegionDropdown
          regions={regionNames}
          value={selectedRegion}
          onChange={handleRegionChange}
        />

        <DistrictSelector
          districts={districts}
          value={selectedDistrict}
          onChange={setSelectedDistrict}
        />
      </section>

      <button
        type="button"
        className={`mt-8 w-full rounded-2xl py-4 text-base font-semibold transition ${
          canProceed
            ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
            : "cursor-not-allowed bg-gray-200 text-gray-400"
        }`}
        disabled={!canProceed}
        onClick={handleNext}
      >
        다음
      </button>
    </main>
  );
}

export default Region;