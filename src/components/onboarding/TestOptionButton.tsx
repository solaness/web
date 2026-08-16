interface TestOptionButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function TestOptionButton({
  label,
  isSelected,
  onClick,
}: TestOptionButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={`w-full rounded-[20px] px-4 py-3 text-center text-sm font-bold leading-[22px] transition-colors ${
        isSelected
          ? "bg-[#FAC775] text-white"
          : "border border-[#B3B3B3] bg-white text-[#B3B3B3]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default TestOptionButton;
