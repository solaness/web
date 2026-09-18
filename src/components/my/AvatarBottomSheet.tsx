import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AVATAR_OPTIONS,
  type AvatarId,
} from "../../data/avatarOptions";

interface AvatarBottomSheetProps {
  open: boolean;
  selectedAvatarId: AvatarId;
  isGuest: boolean;
  onSelect: (avatarId: AvatarId) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const CLOSE_DRAG_DISTANCE = 80;

function AvatarBottomSheet({
  open,
  selectedAvatarId,
  isGuest,
  onSelect,
  onConfirm,
  onClose,
}: AvatarBottomSheetProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setDragOffset(0);
      dragStartYRef.current = null;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (dragStartYRef.current === null) {
      return;
    }

    const distance =
      event.clientY - dragStartYRef.current;

    setDragOffset(Math.max(0, distance));
  };

  const finishDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const dragStartY = dragStartYRef.current;

    if (dragStartY === null) {
      return;
    }

    const finalDragDistance = Math.max(
      0,
      event.clientY - dragStartY,
    );

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    dragStartYRef.current = null;

    if (
      event.type === "pointerup" &&
      finalDragDistance >= CLOSE_DRAG_DISTANCE
    ) {
      onClose();
    }

    setDragOffset(0);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-black/35"
      onClick={onClose}
      role="presentation"
    >
      <div className="relative h-full w-full max-w-md">
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-sheet-title"
          className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-[30px] bg-[#FFFDF6] px-[24px] pb-[calc(28px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_24px_rgba(117,67,8,0.18)]"
          style={{
            transform: `translateY(${dragOffset}px)`,
            transition:
              dragStartYRef.current === null
                ? "transform 200ms ease-out"
                : "none",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex cursor-grab touch-none justify-center pb-4 pt-1 active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            aria-hidden="true"
          >
            <div className="h-[5px] w-[48px] rounded-full bg-[#D9D9D9]" />
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="쏠냥이 선택 창 닫기"
            className="absolute right-[20px] top-[28px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#FFF3DD] text-[24px] leading-none text-[#A88455]"
          >
            ×
          </button>

          <div className="max-h-[calc(82dvh-48px)] overflow-y-auto">
            <header className="mb-5 text-center">
              <h2
                id="avatar-sheet-title"
                className="text-[22px] font-bold text-[#754308]"
              >
                쏠냥이 선택하기
              </h2>

              <p className="mt-1 text-[13px] text-[#939393]">
                마음에 드는 쏠냥이를 골라주세요
              </p>
            </header>

            <div
              className="grid grid-cols-4 gap-x-3 gap-y-5"
              role="radiogroup"
              aria-label="프로필 쏠냥이 목록"
            >
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected =
                  avatar.id === selectedAvatarId;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={avatar.label}
                    onClick={() =>
                      onSelect(avatar.id)
                    }
                    className="relative flex aspect-square items-center justify-center rounded-full bg-white p-1 shadow-[0_3px_8px_rgba(255,172,39,0.22)] transition-transform active:scale-95"
                  >
                    <img
                      src={avatar.imageUrl}
                      alt=""
                      className={`h-full w-full rounded-full object-contain transition ${
                        isSelected
                          ? "ring-inset ring-[4px] ring-[#FFAC27]"
                          : "ring-1 ring-[#FFE2B2]"
                      }`}
                    />

                    {isSelected && (
                      <span
                        className="absolute bottom-0 right-0 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-white bg-[#FFAC27] text-[14px] font-bold text-white"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isGuest && (
              <p className="mt-6 text-center text-[13px] font-medium text-[#939393]">
                로그인하면 선택한 쏠냥이를 계정에
                저장할 수 있다냥
              </p>
            )}

            <button
              type="button"
              onClick={onConfirm}
              className="mt-6 h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-[16px] font-bold text-white shadow-[4px_4px_4px_rgba(138,62,15,0.25)] transition-transform active:scale-[0.98]"
            >
              이 쏠냥이로 바꾸기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AvatarBottomSheet;
