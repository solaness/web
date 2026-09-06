interface ResultActionButtonsProps {
  onStart: () => void;
  startLabel?: string;
  isSubmitting?: boolean;
  onShare?: () => void;
  onSave?: () => void;
}

/**
 * 유형 결과 화면의 시작하기/공유하기/저장하기 버튼 그룹.
 * Firestore 호출이나 네비게이션을 직접 하지 않는 순수 controlled 컴포넌트로 두어
 * 온보딩 Result.tsx뿐 아니라 추후 마이페이지 "WBTI 재검사" 화면에서도 onStart/onShare/onSave
 * 콜백만 바꿔 끼워 재사용할 수 있게 설계했다.
 */
function ResultActionButtons({
  onStart,
  startLabel = "시작하기",
  isSubmitting = false,
  onShare,
  onSave,
}: ResultActionButtonsProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onStart}
        className={`h-[53px] w-full rounded-[25px] text-[16px] font-bold leading-[22px] text-white transition-colors ${
          isSubmitting
            ? "cursor-not-allowed bg-[#D9D9D9]"
            : "bg-[#FFAC27] shadow-[4px_4px_4px_0px_#8A3E0F40] hover:bg-[#FF9D00] active:bg-[#F28F00]"
        }`}
      >
        {isSubmitting ? "저장 중..." : startLabel}
      </button>

      {(onShare || onSave) && (
        <div className="flex w-full gap-3">
          {/* TODO: 공유하기 기능 구현 예정 (우선순위 낮음) */}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="h-[53px] flex-1 rounded-[25px] border border-[#FFAC27] text-[16px] font-bold text-[#FFAC27] shadow-[4px_4px_4px_0px_#FAC775]"
            >
              공유하기
            </button>
          )}
          {/* TODO: 저장하기 기능 구현 예정 (우선순위 낮음) */}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="h-[53px] flex-1 rounded-[25px] border border-[#FFAC27] text-[16px] font-bold text-[#FFAC27] shadow-[4px_4px_4px_0px_#FAC775]"
            >
              저장하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultActionButtons;
