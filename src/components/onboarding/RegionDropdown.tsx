import { useEffect, useRef, useState } from "react";

interface RegionDropdownProps {
  regions: string[];
  value: string;
  onChange: (region: string) => void;
}

function RegionDropdown({
  regions,
  value,
  onChange,
}: RegionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (region: string) => {
    onChange(region);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left transition ${
          isOpen
            ? "border-orange-400"
            : "border-gray-200"
        }`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={
            value
              ? "font-medium text-gray-900"
              : "text-gray-400"
          }
        >
          {value || "시/도를 선택해주세요"}
        </span>

        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-2 shadow-lg"
          role="listbox"
          aria-label="시·도 목록"
        >
          {regions.map((region) => {
            const isSelected = value === region;

            return (
              <li key={region}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full px-5 py-3 text-left transition ${
                    isSelected
                      ? "bg-orange-50 font-semibold text-orange-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(region)}
                >
                  {region}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RegionDropdown;