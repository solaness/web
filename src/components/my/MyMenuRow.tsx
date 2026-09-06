import type { FunctionComponent, SVGProps } from "react";
import IconChevronRight from "../../assets/icons/icon-chevron-right.svg?react";

interface MyMenuRowProps {
  /** 행 위에 붙는 작은 섹션 라벨 (예: "앱 설정", "프로필 수정") */
  sectionLabel: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}

/**
 * 마이페이지의 "즐겨찾기" / "프로필 수정" 행 등에서 공용으로 쓰는 메뉴 행.
 * 섹션 라벨 + (아이콘 · 라벨 · 화살표) 행 한 세트를 그린다.
 */
function MyMenuRow({ sectionLabel, icon: Icon, label, onClick }: MyMenuRowProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#754308]">{sectionLabel}</p>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-4 py-3 text-left"
      >
        <Icon className="h-5 w-5 shrink-0 text-[#FFAC27]" />
        <span className="flex-1 text-sm font-medium text-[#4F4F4F]">{label}</span>
        <IconChevronRight className="h-4 w-4 shrink-0 text-[#FFAC27]" />
      </button>
    </div>
  );
}

export default MyMenuRow;
