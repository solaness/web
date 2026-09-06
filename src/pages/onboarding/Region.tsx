import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionDropdown from "../../components/onboarding/RegionDropdown";
import ConfirmModal from "../../components/shared/ConfirmModal";
import GuestNotice from "../../components/shared/GuestNotice";
import { useAuth } from "../../contexts/AuthContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { REGIONS } from "../../data/regions";
import { getUserProfile, updateRegion } from "../../firebase/firestore";

const MY_PATH = "/my";

interface RegionProps {
  /**
   * "onboarding"(기본값): 지역 선택 -> WBTI 검사로 이어지는 온보딩 마법사의 1단계.
   * "edit": 마이페이지 "지역 수정"에서 단일 화면으로 재사용할 때. 진행바/나가기 확인모달이
   * 없고, 저장은 바로 Firestore에 반영한 뒤 /my로 돌아간다.
   */
  mode?: "onboarding" | "edit";
}

function Region({ mode = "onboarding" }: RegionProps) {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { region, setRegion } = useOnboarding();

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allowNavigationRef = useRef(false);
  // edit 모드에서 Firestore 프리필이 늦게 도착했을 때, 그 사이 사용자가 이미 직접 고른
  // 선택값을 덮어쓰지 않기 위한 플래그.
  const hasUserEditedRegionRef = useRef(false);

  const [selectedRegionCode, setSelectedRegionCode] = useState(
    region.provinceCode,
  );

  const [selectedDistrictCode, setSelectedDistrictCode] = useState(
    region.districtCode,
  );

  const displayName = user?.displayName?.trim() || "김솜솜";

  const canProceed =
    selectedRegionCode.length > 0 && selectedDistrictCode.length > 0;

  // edit 모드 진입 시: OnboardingContext는 세션스토리지 기반이라 (온보딩 도중 이탈 등으로)
  // 이 사용자의 실제 저장된 지역과 다를 수 있다. Firestore에서 현재 값을 읽어와 덮어쓴다.
  useEffect(() => {
    if (!isEditMode || !user) {
      return;
    }

    let cancelled = false;

    getUserProfile(user.uid)
      .then((profile) => {
        if (
          cancelled ||
          hasUserEditedRegionRef.current ||
          !profile?.regionProvinceCode ||
          !profile?.regionDistrictCode
        ) {
          return;
        }

        setSelectedRegionCode(profile.regionProvinceCode);
        setSelectedDistrictCode(profile.regionDistrictCode);
      })
      .catch((error) => {
        console.error("지역 정보를 불러오지 못했어요:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, user]);

  const handleRegionChange = (regionCode: string) => {
    hasUserEditedRegionRef.current = true;

    if (regionCode === selectedRegionCode) {
      return;
    }

    setSelectedRegionCode(regionCode);
    setSelectedDistrictCode("");
  };

  const handleDistrictChange = (districtCode: string) => {
    hasUserEditedRegionRef.current = true;
    setSelectedDistrictCode(districtCode);
  };

  const handlePrevious = () => {
    if (isEditMode) {
      navigate(MY_PATH);
      return;
    }

    setIsExitModalOpen(true);
  };

  const handleContinue = () => {
    setIsExitModalOpen(false);
  };

  const handleExit = () => {
    allowNavigationRef.current = true;

    setRegion({ provinceCode: "", districtCode: "" });
    setIsExitModalOpen(false);

    navigate("/onboarding/login", {
      replace: true,
    });
  };

  useEffect(() => {
    // edit 모드는 나가기 확인 모달 자체가 없으니 뒤로가기 가로챌 필요도 없다.
    if (isEditMode) {
      return;
    }

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

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isEditMode]);

  const handleNext = async () => {
    if (!canProceed) {
      return;
    }

    const selectedRegion = REGIONS.find(
      (regionItem) => regionItem.code === selectedRegionCode,
    );

    const selectedDistrict = selectedRegion?.districts.find(
      (district) => district.code === selectedDistrictCode,
    );

    if (!selectedRegion || !selectedDistrict) {
      return;
    }

    if (isEditMode) {
      if (!user) {
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        await updateRegion(user.uid, {
          provinceCode: selectedRegion.code,
          districtCode: selectedDistrict.code,
        });
        navigate(MY_PATH);
      } catch (error) {
        console.error("지역 저장 실패:", error);
        setSaveError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setIsSaving(false);
      }

      return;
    }

    setRegion({
      provinceCode: selectedRegion.code,
      districtCode: selectedDistrict.code,
    });

    allowNavigationRef.current = true;
    navigate("/onboarding/test/1");
  };

  if (isEditMode && isGuest) {
    return (
      <main className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]">
        <GuestNotice message="지역 수정은 로그인 후 이용할 수 있어요" />
      </main>
    );
  }

  return (
    <main
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
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

          {!isEditMode && (
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
          )}
        </div>

        <h1 className="mt-7 px-1 text-xl font-bold [word-spacing:0] text-[#754308]">
          {isEditMode ? "지역을 수정해 주세요" : `${displayName}님의 거주 지역을 알려주세요!`}
        </h1>
      </header>

      {/* 지역 목록 */}
      <section className="relative z-10 mt-6 min-h-0 flex-1 overflow-y-auto px-[19px] pb-4">
        <RegionDropdown
          regions={REGIONS}
          selectedRegionCode={selectedRegionCode}
          selectedDistrictCode={selectedDistrictCode}
          onRegionChange={handleRegionChange}
          onDistrictChange={handleDistrictChange}
        />
      </section>

      {/* 하단 다음/저장 버튼 */}
      <footer className="relative z-20 shrink-0 bg-gradient-to-t from-[#FFFDF6] via-[#FFFDF6] to-transparent px-16 pb-11 pt-5">
        {isEditMode && saveError && (
          <p role="alert" className="mb-3 text-center text-sm font-bold text-red-500">
            {saveError}
          </p>
        )}

        <button
          type="button"
          className={`h-[53px] w-full rounded-[25px] text-base font-bold leading-[22px] text-white transition-colors ${
            canProceed && !isSaving
              ? "bg-[#FFAC27] shadow-[4px_4px_4px_rgba(138,62,15,0.25)] hover:bg-[#FF9D00] active:bg-[#F28F00]"
              : "cursor-not-allowed bg-[#D9D9D9]"
          }`}
          disabled={!canProceed || isSaving}
          onClick={handleNext}
        >
          {isEditMode ? (isSaving ? "저장 중..." : "저장") : "다음"}
        </button>
      </footer>

      {isExitModalOpen && (
        <ConfirmModal
          title="정말 나가실건가요? 😢"
          description="결과는 저장되지 않아요"
          primaryLabel="계속하기"
          onPrimary={handleContinue}
          secondaryLabel="나가기"
          onSecondary={handleExit}
        />
      )}
    </main>
  );
}

export default Region;
