import type { FunctionComponent, SVGProps } from "react";
import IconChevronRight from "../../assets/icons/icon-chevron-right.svg?react";

interface EditProfileNavRowProps {
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}

/**
 * 프로필 수정 화면의 "프로필 사진 변경" / "WBTI 유형 재검사" / "지역 수정" 행.
 * 마이페이지의 `MyMenuRow`와 색/여백 톤은 맞추되, 오른쪽이 평범한 화살표가 아니라
 * 원형 배경의 버튼이라 별도 컴포넌트로 분리했다.
 */
function EditProfileNavRow({ icon: Icon, label, onClick }: EditProfileNavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[42px] w-full items-center gap-3 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-4 text-left"
    >
      <Icon className="h-5 w-5 shrink-0 text-[#FFAC27]" />
      <span className="flex-1 text-sm font-medium text-[#4F4F4F]">{label}</span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFEDD0] text-[#FFAC27]">
        <IconChevronRight className="h-3 w-3" />
      </span>
    </button>
  );
}

export default EditProfileNavRow;
