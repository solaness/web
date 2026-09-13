import IconRecentSearch from "../../assets/icons/icon-recent-search.svg?react";

interface RecentSearchChipsProps {
  searches: string[];
  onSelect: (term: string) => void;
  className?: string;
}

// TODO: 최근 검색 삭제 기능은 일단 제외 — 필요해지면 useRecentSearches의 removeSearch를 다시 연결
function RecentSearchChips({
  searches,
  onSelect,
  className = "",
}: RecentSearchChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {searches.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onSelect(term)}
          className="flex items-center gap-1 rounded-full border border-[#B3B3B3] bg-white px-2.5 py-1 text-[13px] leading-none text-[#B3B3B3] font-medium"
        >
          <IconRecentSearch width={14} height={14} className="shrink-0" />
          {term}
        </button>
      ))}
    </div>
  );
}

export default RecentSearchChips;
