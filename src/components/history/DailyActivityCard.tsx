import mascotImage from "../../assets/images/solnyang-hello-sun.png";
import type {
  DailyActivity,
} from "../../data/historyCalendar";

interface DailyActivityCardProps {
  day: number;
  activity: DailyActivity;
}

function DailyActivityCard({
  day,
  activity,
}: DailyActivityCardProps) {
  return (
    <article
      className="relative h-[187px] w-full overflow-hidden rounded-[20px] border border-[#FFAC27] bg-white px-5 py-5"
      style={{
        boxShadow:
          "4px 4px 6px 0 rgba(255, 172, 39, 0.5)",
      }}
    >
      <h2 className="relative z-10 flex items-center gap-1 text-[19px] font-bold leading-[26.4px] text-[#754308]">
        <span>
          {day}일의 활동 기록
        </span>

        <span
          role="img"
          aria-label="책"
          className="text-[19px] leading-[26.4px]"
        >
          📚
        </span>
      </h2>

      <div className="relative z-10 mt-4 max-w-[175px]">
        <h3 className="truncate text-[19px] font-semibold leading-[22px] text-[#FFAC27]">
          · {activity.placeName}
        </h3>

        <p className="mt-3 text-[14px] font-normal leading-[22px] text-[#A1A1A1]">
          햇빛 점수{" "}
          {activity.sunshineScore}점
        </p>

        <p className="text-[14px] font-normal leading-[22px] text-[#A1A1A1]">
          햇빛 충전 시간{" "}
          {activity.sunshineMinutes}분
        </p>
      </div>

      <img
        src={mascotImage}
        alt=""
        className="absolute bottom-[4px] right-[2px] z-0 h-[139.083px] w-[164px] object-contain"
      />
    </article>
  );
}

export default DailyActivityCard;