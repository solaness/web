import {
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import SunshineScoreCard from "./SunshineScoreCard";
import SunshineTimerCard from "./SunshineTimerCard";
import { useVisitRecords } from "../../hooks/useVisitRecords";
import { getTodayDateKey } from "../../utils/date";
import { RECOMMENDED_SUNSHINE_MINUTES } from "../../constants/sunshineTimer";

const CARD_COUNT = 2;
const AUTO_SLIDE_DELAY = 15_000;

function SunshineCardSlider() {
  const sliderRef =
    useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const { activities } = useVisitRecords();

  const todayKey = getTodayDateKey();

  const todayMinutes = activities
    .filter((activity) => activity.date === todayKey)
    .reduce((sum, activity) => sum + activity.sunshineMinutes, 0);

  const remainingMinutes = Math.max(
    RECOMMENDED_SUNSHINE_MINUTES - todayMinutes,
    0,
  );

  const moveToCard = (
    index: number,
  ) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    slider.scrollTo({
      left:
        slider.clientWidth * index,
      behavior: "smooth",
    });

    setCurrentIndex(index);
  };

  /*
   * 현재 카드가 선택된 후 15초가 지나면
   * 다음 카드로 자동 이동합니다.
   *
   * 두 번째 카드에서는 다시 첫 번째 카드로 돌아갑니다.
   */
  useEffect(() => {
    const timerId = window.setTimeout(
      () => {
        const nextIndex =
          (currentIndex + 1) %
          CARD_COUNT;

        moveToCard(nextIndex);
      },
      AUTO_SLIDE_DELAY,
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [currentIndex]);

  const handleScroll = (
    event: UIEvent<HTMLDivElement>,
  ) => {
    const slider = event.currentTarget;

    if (slider.clientWidth === 0) {
      return;
    }

    const index = Math.round(
      slider.scrollLeft /
        slider.clientWidth,
    );

    const safeIndex = Math.min(
      Math.max(index, 0),
      CARD_COUNT - 1,
    );

    setCurrentIndex(safeIndex);
  };

  return (
    <section
      className="w-full"
      aria-label="햇빛 정보 카드"
    >
      <div
        ref={sliderRef}
       className="relative left-1/2 flex w-[393px] max-w-[100vw] -translate-x-1/2 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {/* 첫 번째 카드 */}
        <div className="flex w-full shrink-0 snap-center items-center justify-center px-[16px] py-[8px] min-[393px]:px-[11px]">
          <SunshineTimerCard remainingMinutes={remainingMinutes} />
        </div>

        {/* 두 번째 카드 */}
        <div className="flex w-full shrink-0 snap-center items-center justify-center px-[16px] py-[8px] min-[393px]:px-[11px]">
          <SunshineScoreCard />
        </div>
      </div>

      {/* 카드 위치 인디케이터 */}
      <div
        className="mt-4 flex justify-center gap-2"
        aria-label={`현재 ${currentIndex + 1}번째 카드`}
      >
        {Array.from({
          length: CARD_COUNT,
        }).map((_, index) => {
          const isActive =
            currentIndex === index;

          return (
            <button
              key={index}
              type="button"
              className={`h-[9px] w-[9px] rounded-full transition-colors ${
                isActive
                  ? "bg-[#FFAC27]"
                  : "border border-[#FFAC27] bg-white"
              }`}
              onClick={() =>
                moveToCard(index)
              }
              aria-label={`${index + 1}번째 카드 보기`}
              aria-current={
                isActive
                  ? "true"
                  : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}

export default SunshineCardSlider;