interface ConfirmModalProps {
  title: string;
  description?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

/**
 * 온보딩 Region.tsx의 "정말 나가실건가요?" 팝업에서 처음 쓰였던 확인 모달을
 * 다른 화면(마이페이지 회원 탈퇴 등)에서도 재사용할 수 있게 공용 컴포넌트로 뽑았다.
 * 버튼 배치는 Region.tsx와 동일하게 왼쪽이 강조(주황 배경) 버튼, 오른쪽이 보조(테두리만)
 * 버튼이다 — "위험한 선택"이 항상 오른쪽에 오게 하려는 의도라기보다는, 호출부가 상황에 맞게
 * primary/secondary에 원하는 동작을 넣도록 열어둔다.
 */
function ConfirmModal({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: ConfirmModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 px-6"
      role="presentation"
    >
      <section
        className="w-full max-w-[310px] rounded-[20px] bg-white px-5 pb-4 pt-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={description ? "confirm-modal-description" : undefined}
      >
        <h2 id="confirm-modal-title" className="text-center text-xl font-bold text-black">
          {title}
        </h2>

        {description && (
          <p
            id="confirm-modal-description"
            className="mt-1 text-center text-sm text-[#B3B3B3]"
          >
            {description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-[46px] rounded-[23px] bg-[#FFAC27] text-sm font-bold text-white shadow-[2px_3px_4px_rgba(138,62,15,0.2)]"
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>

          <button
            type="button"
            className="h-[46px] rounded-[23px] border border-[#FFAC27] bg-white text-sm font-bold text-[#FFAC27] shadow-[2px_3px_4px_rgba(138,62,15,0.12)]"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
