import type { CategoryOption } from "../../constants/categories";
import type { PlaceCategoryCode } from "../../types/place";

interface CategoryFilterTabsProps {
  categories: CategoryOption[];
  selectedCode: PlaceCategoryCode;
  onChange: (code: PlaceCategoryCode) => void;
  className?: string;
}

/**
 * 지도 검색 / 방문 기록 / 기록 메인 화면이 공용으로 쓰는 카테고리 필터 탭.
 * `DistrictSelector`의 선택/미선택 pill 스타일을 그대로 따른다.
 */
function CategoryFilterTabs({
  categories,
  selectedCode,
  onChange,
  className = "",
}: CategoryFilterTabsProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden ${className}`}
      role="radiogroup"
      aria-label="카테고리 필터"
    >
      {categories.map((category) => {
        const isSelected = selectedCode === category.code;

        return (
          <button
            key={category.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-6 py-1.5 text-[15px] font-semibold leading-none transition-colors ${
              isSelected
                ? "bg-[#FFAC27] text-white"
                : "border border-[#FFAC27] bg-[#FFFAEB] text-[#FFAC27]"
            }`}
            onClick={() => onChange(category.code)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilterTabs;
