import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionDropdown from "../../../components/onboarding/RegionDropdown";
import BackgroundBlobs from "../../../components/shared/BackgroundBlobs";
import GuestNotice from "../../../components/shared/GuestNotice";
import { useAuth } from "../../../contexts/AuthContext";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { REGIONS } from "../../../data/regions";
import { updateRegion } from "../../../firebase/firestore";

const MY_PATH = "/my";

/**
 * 마이페이지 "지역 수정" 화면. 온보딩 Region.tsx와 지역 선택 UI(RegionDropdown/REGIONS
 * 데이터)는 재사용하지만, 진행바·나가기 확인모달 같은 온보딩 마법사 전용 흐름이 없는
 * 단일 화면이라 Region.tsx에 mode 분기를 넣는 대신 WBTI 재검사(EditWbtiStep/
 * EditWbtiResult)와 같은 방식으로 별도 페이지로 뺐다 — Region.tsx는 다시 온보딩 전용으로
 * 남긴다.
 */
function EditRegion() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { profile } = useUserProfile();

  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Firestore 프리필이 늦게 도착했을 때, 그 사이 사용자가 이미 고른 선택을 덮어쓰지
  // 않기 위한 플래그.
  const hasUserEditedRef = useRef(false);

  const canProceed =
    selectedRegionCode.length > 0 && selectedDistrictCode.length > 0;

  useEffect(() => {
    if (
      hasUserEditedRef.current ||
      !profile?.regionProvinceCode ||
      !profile?.regionDistrictCode
    ) {
      return;
    }

    setSelectedRegionCode(profile.regionProvinceCode);
    setSelectedDistrictCode(profile.regionDistrictCode);
  }, [profile]);

  const handleRegionChange = (regionCode: string) => {
    hasUserEditedRef.current = true;

    if (regionCode === selectedRegionCode) {
      return;
    }

    setSelectedRegionCode(regionCode);
    setSelectedDistrictCode("");
  };

  const handleDistrictChange = (districtCode: string) => {
    hasUserEditedRef.current = true;
    setSelectedDistrictCode(districtCode);
  };

  const handleSave = async () => {
    if (!canProceed || !user) {
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
  };

  if (isGuest) {
    return (
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF6]">
        <GuestNotice message="지역 수정은 로그인 후 이용할 수 있어요" />
      </main>
    );
  }

  return (
    <main
      className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 shrink-0 px-[19px] pt-6">
        <button
          type="button"
          className="shrink-0 text-sm font-semibold leading-[22px] text-[#FFAC27]"
          onClick={() => navigate(MY_PATH)}
          aria-label="이전 화면으로 이동"
        >
          이전
        </button>

        <h1 className="mt-7 px-1 text-xl font-bold [word-spacing:0] text-[#754308]">
          지역을 수정해 주세요
        </h1>
      </header>

      <section className="relative z-10 mt-6 min-h-0 flex-1 overflow-y-auto px-[19px] pb-4">
        <RegionDropdown
          regions={REGIONS}
          selectedRegionCode={selectedRegionCode}
          selectedDistrictCode={selectedDistrictCode}
          onRegionChange={handleRegionChange}
          onDistrictChange={handleDistrictChange}
        />
      </section>

      <footer className="relative z-20 shrink-0 bg-gradient-to-t from-[#FFFDF6] via-[#FFFDF6] to-transparent px-16 pb-11 pt-5">
        {saveError && (
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
          onClick={handleSave}
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </footer>
    </main>
  );
}

export default EditRegion;
