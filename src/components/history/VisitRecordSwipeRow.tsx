import {
  useEffect,
  useRef,
  useState,
} from "react";
import IconTrash from "../../assets/icons/icon-trash.svg?react";
import type { DailyActivity } from "../../data/historyCalendar";
import VisitRecordCard from "./VisitRecordCard";

const REVEAL_WIDTH = 60;
const OPEN_THRESHOLD = REVEAL_WIDTH / 2;
const DRAG_THRESHOLD = 10;

interface VisitRecordSwipeRowProps {
  activity: DailyActivity;
  isOpen: boolean;
  isSelected?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (activity: DailyActivity) => void;
  onRequestDelete: (
    activity: DailyActivity,
  ) => void;
}

function VisitRecordSwipeRow({
  activity,
  isOpen,
  isSelected = false,
  onOpenChange,
  onSelect,
  onRequestDelete,
}: VisitRecordSwipeRowProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] =
    useState(false);

  const startXRef = useRef<number | null>(
    null,
  );

  const startOffsetRef = useRef(0);
  const movedRef = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      offsetRef.current = 0;
      setOffsetX(0);
    }
  }, [isOpen]);

  const updateOffset = (nextOffset: number) => {
    offsetRef.current = nextOffset;
    setOffsetX(nextOffset);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    startXRef.current = event.clientX;
    startOffsetRef.current =
      offsetRef.current;
    movedRef.current = false;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (startXRef.current === null) {
      return;
    }

    const movedDistance =
      event.clientX - startXRef.current;

    if (
      Math.abs(movedDistance) >
      DRAG_THRESHOLD
    ) {
      movedRef.current = true;
    }

    const nextOffset = Math.min(
      0,
      Math.max(
        -REVEAL_WIDTH,
        startOffsetRef.current +
          movedDistance,
      ),
    );

    updateOffset(nextOffset);
  };

  const finishDragging = () => {
    if (startXRef.current === null) {
      return;
    }

    startXRef.current = null;
    setIsDragging(false);

    const shouldOpen =
      offsetRef.current <= -OPEN_THRESHOLD;

    const nextOffset = shouldOpen
      ? -REVEAL_WIDTH
      : 0;

    updateOffset(nextOffset);
    onOpenChange(shouldOpen);
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    finishDragging();
  };

  const handlePointerCancel = () => {
    finishDragging();
  };

  const handleCardClick = (
    selectedActivity: DailyActivity,
  ) => {
    if (movedRef.current) {
      return;
    }

    if (offsetRef.current !== 0) {
      updateOffset(0);
      onOpenChange(false);
      return;
    }

    onSelect(selectedActivity);
  };

  const handleDeleteClick = () => {
    updateOffset(0);
    onOpenChange(false);
    onRequestDelete(activity);
  };

  const isDeleteVisible = offsetX !== 0;

  return (
    <div className="relative w-full max-w-[345px]">
      {/* 오른쪽 삭제 버튼 */}
      <div className="absolute inset-y-0 right-0 z-0 w-[60px] overflow-hidden rounded-[12px]">
        <button
          type="button"
          aria-label={`${activity.placeName} 방문 기록 삭제`}
          aria-hidden={!isDeleteVisible}
          tabIndex={
            isDeleteVisible ? 0 : -1
          }
          onClick={handleDeleteClick}
          className={`flex h-full w-[60px] items-center justify-center bg-[#FF544E] text-white ${
            isDragging
              ? ""
              : "transition-transform duration-200 ease-out"
          }`}
          style={{
            transform: `translateX(${
              REVEAL_WIDTH + offsetX
            }px)`,
          }}
        >
          <IconTrash className="h-5 w-5" />
        </button>
      </div>

      {/* 스와이프되는 방문 기록 카드 */}
      <div
        className={`relative z-10 touch-pan-y ${
          isDragging
            ? ""
            : "transition-transform duration-200 ease-out"
        }`}
        style={{
          transform: `translateX(${offsetX}px)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={
          handlePointerCancel
        }
      >
        <VisitRecordCard
          activity={activity}
          isSelected={isSelected}
          onClick={handleCardClick}
        />
      </div>
    </div>
  );
}

export default VisitRecordSwipeRow;