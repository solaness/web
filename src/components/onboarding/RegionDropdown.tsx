import type {
  RegionData,
} from "../../data/regions";
import DistrictSelector from "./DistrictSelector";

interface RegionDropdownProps {
  regions: RegionData[];
  selectedRegionCode: string;
  selectedDistrictCode: string;
  onRegionChange: (
    regionCode: string,
  ) => void;
  onDistrictChange: (
    districtCode: string,
  ) => void;
}

function RegionDropdown({
  regions,
  selectedRegionCode,
  selectedDistrictCode,
  onRegionChange,
  onDistrictChange,
}: RegionDropdownProps) {
  return (
    <div
      className="space-y-[14px]"
      role="list"
      aria-label="시·도 목록"
    >
      {regions.map((region) => {
        const isExpanded =
          selectedRegionCode === region.code;

        const regionPanelId =
          `districts-${region.code}`;

        return (
          <section
            key={region.code}
            className={`w-full overflow-hidden rounded-[20px] border-2 transition-colors ${
              isExpanded
                ? "border-[#FAC775] bg-[#FFE9C6]"
                : "border-[#D9D9D9] bg-white"
            }`}
            role="listitem"
          >
            <button
              type="button"
              className="flex h-[46px] w-full items-center justify-between px-[15px] text-left"
              onClick={() =>
                onRegionChange(region.code)
              }
              aria-expanded={isExpanded}
              aria-controls={regionPanelId}
            >
              <span
                className={`text-lg font-bold leading-[22px] ${
                  isExpanded
                    ? "text-[#FF9D00]"
                    : "text-[#B3B3B3]"
                }`}
              >
                {region.name}
              </span>

              <svg
                className={`h-5 w-5 transition-transform ${
                  isExpanded
                    ? "rotate-180 text-[#FFAC27]"
                    : "text-[#B3B3B3]"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isExpanded && (
              <div id={regionPanelId}>
                <DistrictSelector
                  districts={region.districts}
                  selectedDistrictCode={
                    selectedDistrictCode
                  }
                  onChange={onDistrictChange}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default RegionDropdown;