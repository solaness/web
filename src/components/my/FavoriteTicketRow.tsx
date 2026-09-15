import { useEffect, useRef, useState } from "react";
import IconTrash from "../../assets/icons/icon-trash.svg?react";
import VisitRecordCard from "../history/VisitRecordCard";
import type { DailyActivity } from "../../data/historyCalendar";

// 티켓 오른쪽에 숨어있는 삭제 버튼 너비(피그마 마이페이지-즐겨찾기(편집) 기준) — 이 값만큼
// 왼쪽으로 스와이프하면 카드 너비 안에서 정확히 버튼과 맞물린다.
const REVEAL_WIDTH = 60;
const DRAG_OPEN_THRESHOLD = REVEAL_WIDTH / 2;
// 실제 터치/트랙패드 탭은 손가락이 몇 px씩 흔들리기 마련이라, 너무 낮게 잡으면
// 평범한 탭까지 "드래그"로 오판해서 클릭(상세 이동)이 씹혀버린다.
const DRAG_MOVE_THRESHOLD = 10;

interface FavoriteTicketRowProps {
  activity: DailyActivity;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (activity: DailyActivity) => void;
  onRequestDelete: (activity: DailyActivity) => void;
}

/**
 * 방문 기록 티켓(VisitRecordCard)을 그대로 감싸서 왼쪽 스와이프 시 삭제 버튼이
 * 드러나게 하는 즐겨찾기 전용 래퍼 — 티켓 자체의 마크업/스타일은 건드리지 않는다.
 * 열림 상태는 부모(Favorites)가 소유한다 — 한 번에 하나의 티켓만 열려있게 하기 위해서다.
 */
function FavoriteTicketRow({
  activity,
  isOpen,
  onOpenChange,
  onSelect,
  onRequestDelete,
}: FavoriteTicketRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartOffsetRef = useRef(0);
  const draggedRef = useRef(false);

  // 다른 티켓이 열려서 부모가 이 티켓을 닫으라고 내려주면(isOpen=false) 스스로 접는다.
  useEffect(() => {
    if (!isOpen) {
      setOffset(0);
    }
  }, [isOpen]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offset;
    draggedRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current == null) {
      return;
    }

    const delta = event.clientX - dragStartXRef.current;
    if (Math.abs(delta) > DRAG_MOVE_THRESHOLD) {
      draggedRef.current = true;
    }

    setOffset(Math.min(0, Math.max(-REVEAL_WIDTH, dragStartOffsetRef.current + delta)));
  };

  const handlePointerUp = () => {
    if (dragStartXRef.current == null) {
      return;
    }

    dragStartXRef.current = null;
    setIsDragging(false);

    const next = offset <= -DRAG_OPEN_THRESHOLD ? -REVEAL_WIDTH : 0;
    setOffset(next);
    onOpenChange(next !== 0);
  };

  const handleCardClick = (clickedActivity: DailyActivity) => {
    if (draggedRef.current) {
      return;
    }

    if (offset !== 0) {
      setOffset(0);
      onOpenChange(false);
      return;
    }

    onSelect(clickedActivity);
  };

  const isRevealed = offset !== 0;

  return (
    <div className="relative mx-auto w-full max-w-[345px]">
      {/* 삭제 버튼은 자기 자신의 60px 폭 안에서만 클리핑한다 — 티켓 전체를 감싸는
          컨테이너에 overflow-hidden을 걸면 스와이프로 카드가 왼쪽으로 밀릴 때
          왼쪽 내용(핀 아이콘 등)까지 잘려나가 버리기 때문. */}
      <div className="absolute inset-y-0 right-0 z-0 w-[60px] overflow-hidden rounded-[12px]">
        <button
          type="button"
          onClick={() => {
            setOffset(0);
            onOpenChange(false);
            onRequestDelete(activity);
          }}
          aria-label={`${activity.placeName} 즐겨찾기 삭제`}
          // 스와이프로 드러나지 않은 상태에선 화면 밖으로 translate돼 시각적으로 안 보이므로,
          // 키보드 탭/스크린리더 탐색에서도 걸리지 않게 접근성 트리에서 제외한다.
          tabIndex={isRevealed ? 0 : -1}
          aria-hidden={!isRevealed}
          className={`flex h-full w-[60px] items-center justify-center bg-[#FF544E] text-white ${
            isDragging ? "" : "transition-transform duration-200 ease-out"
          }`}
          style={{ transform: `translateX(${REVEAL_WIDTH + offset}px)` }}
        >
          <IconTrash className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`relative z-10 touch-pan-y ${isDragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <VisitRecordCard activity={activity} onClick={handleCardClick} />
      </div>
    </div>
  );
}

export default FavoriteTicketRow;
