import IconChevronLeft from "../../assets/icons/icon-chevron-left.svg?react";

interface AppTitleProps {
  /** 지정하면 타이틀 앞에 뒤로가기 버튼을 함께 렌더링한다. */
  onBack?: () => void;
  titleClassName?: string;
}

/**
 * 헤더의 "Solaness" 타이틀(+선택적 뒤로가기 버튼). Calendar/VisitRecordForm/MapSearch가
 * 각자 복붙해 쓰던 동일한 버튼 마크업을 여기로 모았다.
 */
function AppTitle({
  onBack,
  titleClassName = "text-[32px] font-bold text-[#F78903]",
}: AppTitleProps) {
  const title = <h1 className={titleClassName}>Solaness</h1>;

  if (!onBack) {
    return title;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onBack}
        aria-label="이전 화면으로 이동"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-[#F78903]"
      >
        <IconChevronLeft />
      </button>

      {title}
    </div>
  );
}

export default AppTitle;
