//import timerGraphic from "../../assets/images/sunshine-timer.png";
//이미지를 src/assets/images/sunshine-timer.png에 넣기
import { MAX_SUNSHINE_MINUTES } from "../../constants/sunshineTimer";

interface SunshineTimerCardProps {
  maxMinutes?: number;
  /** 오늘 충전한 시간. 아직 안 불러온 상태면 null — "다 채웠다"고 잘못 단정하지 않기 위해 구분한다. */
  todayMinutes?: number | null;
}

function SunshineTimerCard({
  maxMinutes = MAX_SUNSHINE_MINUTES,
  todayMinutes = null,
}: SunshineTimerCardProps) {
  const isReady = todayMinutes !== null;

  const safeMaxMinutes = Math.max(maxMinutes, 1);
  const cappedTodayMinutes = Math.min(Math.max(todayMinutes ?? 0, 0), safeMaxMinutes);

  const chargeProgress = isReady ? cappedTodayMinutes / safeMaxMinutes : 0;

  const circleRadius = 79;
  const circleLength = 2 * Math.PI * circleRadius;
  const progressLength = circleLength * chargeProgress;

  return (
    <article
      className="mx-auto flex h-[383px] w-full max-w-[370px] flex-col rounded-[8px] border border-[#FFF1D6] bg-white px-4 pb-4 pt-4"
      style={{
        boxShadow:
          "0 0 5px 4px rgba(250, 199, 117, 0.45), 0 4px 8px rgba(138, 62, 15, 0.12)",
      }}
    >
      <h2 className="text-[21px] font-bold leading-[22px] text-[#754308]">
        오늘의 햇빛 충전 시간
      </h2>

        <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="relative h-[224.374px] w-[224.374px]"
          role="progressbar"
          aria-label="오늘 충전한 햇빛 시간"
          aria-valuemin={0}
          aria-valuemax={safeMaxMinutes}
          aria-valuenow={isReady ? cappedTodayMinutes : undefined}
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

            {/* 오늘 충전한 시간 진행 막대 */}
            {chargeProgress > 0 && (
              <circle
                cx="90.7775"
                cy="90.7775"
                r={circleRadius}
                fill="none"
                stroke="#FD9D2D"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${progressLength} ${circleLength}`}
                className="transition-[stroke-dasharray] duration-500 ease-out"
              />
            )}
          </svg>

          <strong
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[64px] font-bold leading-none tracking-[-3px] text-[#FD9D2D] ${
              isReady ? "" : "opacity-40"
            }`}
          >
            {isReady ? cappedTodayMinutes : "–"}
          </strong>
        </div>

        <div className="mt-4 text-[19px] font-bold leading-[22px] text-[#754308]">
          {isReady ? cappedTodayMinutes : "–"}/{safeMaxMinutes}분
        </div>
      </div>
    </article>
  );
}

export default SunshineTimerCard;
