import type { FormEvent } from "react";
import IconSearch from "../../assets/icons/icon-search.svg?react";
import IconClose from "../../assets/icons/icon-close.svg?react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (submittedValue: string) => void;
  /** 입력값과 별개로 "검색 후" 상태 자체를 되돌려야 할 때(예: 제출된 검색어 초기화) 호출한다. */
  onClear?: () => void;
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = "장소 검색...";

function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = DEFAULT_PLACEHOLDER,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value);
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full border border-[#FFAC27] bg-white px-4 py-3"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-[#754308] outline-none placeholder:text-[#B3B3B3]"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="검색어 지우기"
          className="shrink-0 text-[#B3B3B3]"
        >
          <IconClose />
        </button>
      )}
      <button
        type="submit"
        aria-label="검색"
        className="shrink-0 text-[#FFAC27]"
      >
        <IconSearch />
      </button>
    </form>
  );
}

export default SearchBar;
