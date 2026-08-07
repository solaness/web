import type {
  DistrictData,
} from "../../data/regions";

interface DistrictSelectorProps {
  districts: DistrictData[];
  selectedDistrictCode: string;
  onChange: (districtCode: string) => void;
}

function DistrictSelector({
  districts,
  selectedDistrictCode,
  onChange,
}: DistrictSelectorProps) {
  if (districts.length === 0) {
    return null;
  }

  return (
    <div
      className="grid grid-cols-3 gap-2 px-3 pb-4"
      role="radiogroup"
      aria-label="구·군 선택"
    >
      {districts.map((district) => {
        const isSelected =
          selectedDistrictCode === district.code;

        return (
          <button
            key={district.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`min-h-10 rounded-[20px] px-2 py-2 text-base font-bold leading-[22px] transition-colors ${
              isSelected
                ? "bg-[#FFAC27] text-white"
                : "border border-[#FFAC27] bg-white text-[#FFAC27]"
            }`}
            onClick={() =>
              onChange(district.code)
            }
          >
            {district.name}
          </button>
        );
      })}
    </div>
  );
}

export default DistrictSelector;