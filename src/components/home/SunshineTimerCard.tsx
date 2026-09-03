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
  const safeRecommendedMinutes = Math.max(recommendedMinutes, 1);

  const remainingProgress = Math.min(
    Math.max(remainingMinutes / safeRecommendedMinutes, 0),
    1,
  );

  const circleRadius = 79;
  const circleLength = 2 * Math.PI * circleRadius;
  const progressLength = circleLength * remainingProgress;

  return (
    <article
      className="mx-auto flex h-[383px] w-full max-w-[370px] flex-col rounded-[8px] border border-[#FFF1D6] bg-white px-4 pb-4 pt-4"
      style={{
        boxShadow:
          "0 0 5px 4px rgba(250, 199, 117, 0.45), 0 4px 8px rgba(138, 62, 15, 0.12)",
      }}
    >
      <h2 className="text-[21px] font-bold leading-[22px] text-[#754308]">
        권장 햇빛 충전 시간
      </h2>

        <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="relative h-[224.374px] w-[224.374px]"
          role="progressbar"
          aria-label="남은 햇빛 충전 시간"
          aria-valuemin={0}
          aria-valuemax={safeRecommendedMinutes}
          aria-valuenow={remainingMinutes}
        >
          <svg
            viewBox="0 0 181.555 181.555"
            className="h-full w-full -rotate-90"
            aria-hidden="true"
          >
            {/* 연한 배경 원 */}
            <circle
              cx="90.7775"
              cy="90.7775"
              r={circleRadius}
              fill="none"
              stroke="#FFF4D9"
              strokeWidth="20"
            />

            {/* 남은 시간 진행 막대 */}
            {remainingProgress > 0 && (
              <circle
                cx="90.7775"
                cy="90.7775"
                r={circleRadius}
                fill="none"
                stroke="#FFDE96"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${progressLength} ${circleLength}`}
                className="transition-[stroke-dasharray] duration-500 ease-out"
              />
            )}
          </svg>

          <strong
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[64px] font-bold leading-[22px] tracking-[-3px] text-[#FD9D2D]"
  
>
  {remainingMinutes}
</strong>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[19px] font-bold leading-[22px] text-[#754308]">
          <span>UV {uvIndex}</span>
          <span aria-hidden="true">·</span>
          <span>{temperature}°C</span>
        </div>

        <div
          className="mt-3 flex items-center justify-center gap-2"
          aria-hidden="true"
        >
          <span className="h-[6px] w-[6px] rounded-full bg-[#FFAC27]" />
          <span className="h-[6px] w-[6px] rounded-full border border-[#FFAC27] bg-white" />
        </div>
      </div>
    </article>
  );
}

export default SunshineTimerCard;