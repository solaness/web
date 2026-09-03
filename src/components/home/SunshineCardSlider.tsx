import {
  useRef,
  useState,
  type UIEvent,
} from "react";
import SunshineScoreCard from "./SunshineScoreCard";
import SunshineTimerCard from "./SunshineTimerCard";

const CARD_COUNT = 2;

function SunshineCardSlider() {
  const sliderRef =
    useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

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

    setCurrentIndex(
      Math.min(
        Math.max(index, 0),
        CARD_COUNT - 1,
      ),
    );
  };

  const moveToCard = (index: number) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    slider.scrollTo({
      left: slider.clientWidth * index,
      behavior: "smooth",
    });

    setCurrentIndex(index);
  };

  return (
    <section
      className="w-full"
      aria-label="햇빛 정보 카드"
    >
      <div
        ref={sliderRef}
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]"
        onScroll={handleScroll}
      >
        {/* 첫 번째 카드 */}
        <div className="w-full shrink-0 snap-center py-[8px]">
          <SunshineTimerCard />
        </div>

        {/* 두 번째 카드 */}
        <div className="w-full shrink-0 snap-center py-[8px]">
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