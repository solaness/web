import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import RegionDropdown from "../../components/onboarding/RegionDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { REGIONS } from "../../data/regions";

interface StoredRegion {
  provinceCode: string;
  districtCode: string;
}

const STORAGE_KEY = "onboardingRegion";

const EMPTY_REGION: StoredRegion = {
  provinceCode: "",
  districtCode: "",
};

function getStoredRegion(): StoredRegion {
  const storedValue =
    sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return EMPTY_REGION;
  }

  try {
    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<StoredRegion>;

    const provinceCode =
      parsedValue.provinceCode ?? "";

    const districtCode =
      parsedValue.districtCode ?? "";

    const matchedRegion = REGIONS.find(
      (region) =>
        region.code === provinceCode,
    );

    if (!matchedRegion) {
      return EMPTY_REGION;
    }

    const isValidDistrict =
      matchedRegion.districts.some(
        (district) =>
          district.code === districtCode,
      );

    return {
      provinceCode,
      districtCode: isValidDistrict
        ? districtCode
        : "",
    };
  } catch {
    return EMPTY_REGION;
  }
}

function Region() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isExitModalOpen, setIsExitModalOpen] =
    useState(false);

  const allowNavigationRef = useRef(false);

  const storedRegion = useMemo(
    () => getStoredRegion(),
    [],
  );

  const [
    selectedRegionCode,
    setSelectedRegionCode,
  ] = useState(storedRegion.provinceCode);

  const [
    selectedDistrictCode,
    setSelectedDistrictCode,
  ] = useState(storedRegion.districtCode);

  const displayName =
    user?.displayName?.trim() || "김솜솜";

  const canProceed =
    selectedRegionCode.length > 0 &&
    selectedDistrictCode.length > 0;

  const handleRegionChange = (
    regionCode: string,
  ) => {
    if (regionCode === selectedRegionCode) {
      return;
    }

    setSelectedRegionCode(regionCode);
    setSelectedDistrictCode("");
  };

  const handlePrevious = () => {
    setIsExitModalOpen(true);
  };

  const handleContinue = () => {
    setIsExitModalOpen(false);
  };

  const handleExit = () => {
    allowNavigationRef.current = true;

    sessionStorage.removeItem(STORAGE_KEY);
    setIsExitModalOpen(false);

    navigate("/onboarding/login", {
      replace: true,
    });
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    const selectedRegion = REGIONS.find(
      (region) =>
        region.code === selectedRegionCode,
    );

    const selectedDistrict =
      selectedRegion?.districts.find(
        (district) =>
          district.code ===
          selectedDistrictCode,
      );

    if (!selectedRegion || !selectedDistrict) {
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        provinceCode: selectedRegion.code,
        districtCode: selectedDistrict.code,
      }),
    );

    useEffect(() => {
      const guardKey = "regionExitGuard";

      if (!window.history.state?.[guardKey]) {
        window.history.pushState(
          {
            ...window.history.state,
            [guardKey]: true,
          },
          "",
          window.location.href,
        );
      }

      const handlePopState = () => {
      if (allowNavigationRef.current) {
        return;
      }

      setIsExitModalOpen(true);

      window.history.pushState(
        {
          ...window.history.state,
          [guardKey]: true,
        },
        "",
        window.location.href,
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, []);

  navigate("/onboarding/test/1");
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      {/* 왼쪽 위 배경 장식 */}
      <div
        className="pointer-events-none absolute -left-[72px] -top-[45px] h-[195px] w-[216px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,174,176,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      {/* 오른쪽 위 배경 장식 */}
      <div
        className="pointer-events-none absolute right-[-45px] top-[52px] h-[225px] w-[219px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,183,67,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      {/* 오른쪽 가운데 배경 장식 */}
      <div
        className="pointer-events-none absolute right-[-64px] top-[319px] h-[217px] w-[222px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(201,235,156,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      {/* 왼쪽 아래 배경 장식 */}
      <div
        className="pointer-events-none absolute -left-[72px] bottom-[-81px] h-[372px] w-[386px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,157,0,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      {/* 상단 영역 */}
      <header className="relative z-10 shrink-0 px-[19px] pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="shrink-0 text-sm font-semibold leading-[22px] text-[#FFAC27]"
            onClick={handlePrevious}
            aria-label="이전 화면으로 이동"
          >
            이전
          </button>

          <div className="flex flex-1 items-center gap-[11px]">
            <div
              className="relative h-[7px] flex-1 overflow-hidden rounded-lg border-2 border-[#FFAC27]"
              role="progressbar"
              aria-label="온보딩 진행률"
              aria-valuemin={1}
              aria-valuemax={4}
              aria-valuenow={1}
            >
              <div className="absolute inset-y-0 left-0 w-1/4 bg-[#FFAC27]" />
            </div>

            <span className="shrink-0 text-sm font-semibold leading-[22px] text-[#FFAC27]">
              1 / 4
            </span>
          </div>
        </div>

        <h1 className="mt-7 px-1 text-xl font-bold [word-spacing:0] text-[#754308]">
          {`${displayName}님의 거주 지역을 알려주세요!`}
        </h1>
      </header>

      {/* 지역 목록 */}
      <section className="relative z-10 mt-6 min-h-0 flex-1 overflow-y-auto px-[19px] pb-4">
        <RegionDropdown
          regions={REGIONS}
          selectedRegionCode={
            selectedRegionCode
          }
          selectedDistrictCode={
            selectedDistrictCode
          }
          onRegionChange={
            handleRegionChange
          }
          onDistrictChange={
            setSelectedDistrictCode
          }
        />
      </section>

      {/* 하단 다음 버튼 */}
      <footer className="relative z-20 shrink-0 bg-gradient-to-t from-[#FFFDF6] via-[#FFFDF6] to-transparent px-16 pb-11 pt-5">
        <button
          type="button"
          className={`h-[53px] w-full rounded-[25px] text-base font-bold leading-[22px] text-white transition-colors ${
            canProceed
              ? "bg-[#FFAC27] shadow-[4px_4px_4px_rgba(138,62,15,0.25)] hover:bg-[#FF9D00] active:bg-[#F28F00]"
              : "cursor-not-allowed bg-[#D9D9D9]"
          }`}
          disabled={!canProceed}
          onClick={handleNext}
        >
          다음
        </button>
      </footer>
          {isExitModalOpen && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 px-6"
            role="presentation"
            >
              <section
                className="w-full max-w-[310px] rounded-[20px] bg-white px-5 pb-4 pt-5 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="exit-modal-title"
                aria-describedby="exit-modal-description"
              >
              <h2
                id="exit-modal-title"
                className="text-center text-xl font-bold text-black"
              >
                정말 나가실건가요? 😢
              </h2>

              <p
                id="exit-modal-description"
                className="mt-1 text-center text-sm text-[#B3B3B3]"
              >
                결과는 저장되지 않아요
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-[46px] rounded-[23px] bg-[#FFAC27] text-sm font-bold text-white shadow-[2px_3px_4px_rgba(138,62,15,0.2)]"
                  onClick={handleContinue}
                >
                  계속하기
              </button>

              <button
                type="button"
                className="h-[46px] rounded-[23px] border border-[#FFAC27] bg-white text-sm font-bold text-[#FFAC27] shadow-[2px_3px_4px_rgba(138,62,15,0.12)]"
                onClick={handleExit}
              >
                나가기
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Region;