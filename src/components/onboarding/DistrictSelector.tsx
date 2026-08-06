interface DistrictSelectorProps {
  districts: string[];
  value: string;
  onChange: (district: string) => void;
}

function DistrictSelector({
  districts,
  value,
  onChange,
}: DistrictSelectorProps) {
  if (districts.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        구·군을 선택해주세요
      </h2>

      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="구·군 선택"
      >
        {districts.map((district) => {
          const isSelected = value === district;

          return (
            <button
              key={district}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
              }`}
              onClick={() => onChange(district)}
            >
              {district}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DistrictSelector;