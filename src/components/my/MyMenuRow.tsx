import type { FunctionComponent, SVGProps } from "react";
import IconChevronRight from "../../assets/icons/icon-chevron-right.svg?react";

interface MyMenuRowProps {
  /**
   * 행 위에 붙는 작은 섹션 라벨 (예: "앱 설정", "프로필 수정"). 여러 행이 라벨 하나를
   * 같이 쓰는 경우(예: "기타" 아래 행 여러 개)엔 생략하고 호출부에서 라벨을 한 번만
   * 따로 그린다.
   */
  sectionLabel?: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  /**
   * 오른쪽 화살표 스타일. "chevron"(기본, 마이페이지 메인) | "circle"(프로필 수정 화면,
   * 원형 배경 버튼). 프로필 수정 화면에서 이 컴포넌트와 거의 동일한 EditProfileNavRow를
   * 따로 만들었었는데, sectionLabel까지 중복 구현하게 돼서 이 컴포넌트에 옵션으로 합쳤다.
   */
  arrowVariant?: "chevron" | "circle";
}

/**
 * 마이페이지의 "즐겨찾기" / "프로필 수정" / "지역 수정" 등에서 공용으로 쓰는 메뉴 행.
 * 섹션 라벨 + (아이콘 · 라벨 · 화살표) 행 한 세트를 그린다. 행 높이는 42px로 고정
 * (피그마 기준 — 닉네임 입력 행과 동일해야 함).
 */
function MyMenuRow({
  sectionLabel,
  icon: Icon,
  label,
  onClick,
  arrowVariant = "chevron",
}: MyMenuRowProps) {
  return (
    <div>
      {sectionLabel && (
        <p className="mb-2 text-sm font-semibold text-[#754308]">{sectionLabel}</p>
      )}
      <button
        type="button"
        onClick={onClick}
        className="flex h-[42px] w-full items-center gap-3 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-4 text-left"
      >
        <Icon className="h-5 w-5 shrink-0 text-[#FFAC27]" />
        <span className="flex-1 text-sm font-medium text-[#4F4F4F]">{label}</span>
        {arrowVariant === "circle" ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFEDD0] text-[#FFAC27]">
            <IconChevronRight className="h-3 w-3" />
          </span>
        ) : (
          <IconChevronRight className="h-4 w-4 shrink-0 text-[#FFAC27]" />
        )}
      </button>
    </div>
  );
}

export default MyMenuRow;
