//import timerGraphic from "../../assets/images/sunshine-timer.png";
//이미지를 src/assets/images/sunshine-timer.png에 넣기
interface SunshineTimerCardProps {
  recommendedMinutes?: number;
  remainingMinutes?: number;
  uvIndex?: number;
  temperature?: number;
}

function SunshineTimerCard({
  recommendedMinutes = 40,
  remainingMinutes = 32,
  uvIndex = 3,
  temperature = 24,
}: SunshineTimerCardProps) {
  const completedMinutes = Math.max(
    recommendedMinutes - remainingMinutes,
    0,
  );

  const progress = Math.min(
    Math.max(
      (completedMinutes /
        recommendedMinutes) *
        100,
      0,
    ),
    100,
  );

  return (
    <article className="mx-auto flex h-[383px] w-full max-w-[370px] flex-col rounded-[8px] border border-white bg-white px-4 pb-5 pt-4 shadow-[0_0_4px_5px_rgba(250,199,117,0.25)]">
      <h2 className="text-[20px] font-bold leading-[22px] text-[#754308]">
        권장 햇빛 충전 시간
      </h2>

      {/*
        <div className="mt-4 flex flex-1 items-center justify-center">
        <img
            src={timerGraphic}
            alt=""
            className="h-[153px] w-[253px] object-contain"
        />
        </div>
      */ }

      <div className="mt-4 flex flex-1 items-center justify-center">
        <div
          className="h-[153px] w-[253px] bg-[#D9D9D9]"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-end">
        <strong className="text-[80px] font-bold leading-none text-[#FFAC27]">
          {remainingMinutes}
        </strong>

        <span className="mb-[7px] ml-1 text-[16px] font-semibold leading-[22px] text-[#754308]">
          분 남음
        </span>

        <div className="mb-[7px] ml-auto flex items-center gap-2 text-[20px] font-medium leading-[22px] text-[#754308]">
          <span>UV {uvIndex}</span>
          <span aria-hidden="true">·</span>
          <span>{temperature}°C</span>
        </div>
      </div>

      <div
        className="relative mt-3 h-[20px] w-full overflow-hidden rounded-[10px] border-[3px] border-[#FFAC27] bg-white shadow-[2px_2px_4px_rgba(138,62,15,0.25)]"
        role="progressbar"
        aria-label="햇빛 충전 진행률"
        aria-valuemin={0}
        aria-valuemax={recommendedMinutes}
        aria-valuenow={completedMinutes}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-r-[10px] bg-[#FAC775] transition-[width] duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </article>
  );
}

export default SunshineTimerCard;