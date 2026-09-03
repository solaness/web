interface ActionButtonBarProps {
  /** 예약 페이지(장소 홈페이지) 링크. 없으면 버튼을 비활성화한다. */
  reserveUrl: string | null;
  /** 길찾기(카카오맵) 링크. */
  directionsUrl: string;
}

/** 하단 고정 [예약하기]/[길찾기] 버튼 — 둘 다 외부 링크로 연결한다(확정된 결정사항, 이슈 #18). */
function ActionButtonBar({ reserveUrl, directionsUrl }: ActionButtonBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-[15px] bg-[#FFFDF6] px-[26px] py-4">
      {reserveUrl ? (
        <a
          href={reserveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[53px] flex-1 items-center justify-center rounded-[25px] bg-[#FFAC27] text-base font-bold text-white shadow-[4px_4px_4px_0px_#8A3E0F40]"
        >
          예약하기
        </a>
      ) : (
        <span className="flex h-[53px] flex-1 cursor-not-allowed items-center justify-center rounded-[25px] bg-[#EFE6D8] text-base font-bold text-[#B3B3B3]">
          예약하기
        </span>
      )}

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[53px] flex-1 items-center justify-center rounded-[25px] border-[0.5px] border-[#FFAC27] bg-white text-base font-bold text-[#FFAC27] shadow-[4px_4px_4px_0px_#8A3E0F40]"
      >
        길찾기
      </a>
    </div>
  );
}

export default ActionButtonBar;
