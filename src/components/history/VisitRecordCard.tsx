import { useState } from "react";
import solnyangHello from "../../assets/images/solnyang-hello.svg";
import sunIcon from "../../assets/images/sun.svg";
import ticketBackground from "../../assets/images/ticket-background.svg";
import type { DailyActivity } from "../../data/historyCalendar";

interface VisitRecordCardProps {
  activity: DailyActivity;
  onClick: (activity: DailyActivity) => void;
  isSelected?: boolean;
}

function getWeekday(date: string) {
  const weekdays = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
  ];

  const [year, month, day] = date
    .split("-")
    .map(Number);

  return weekdays[
    new Date(year, month - 1, day).getDay()
  ];
}

function formatVisitDate(date: string) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  return `${String(year).slice(2)}.${String(
    month,
  ).padStart(2, "0")}.${String(day).padStart(
    2,
    "0",
  )} (${getWeekday(date)})`;
}

function VisitRecordCard({
  activity,
  onClick,
  isSelected = false,
}: VisitRecordCardProps) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const showPlaceholder =
    !activity.imageUrl || imageFailed;

  return (
    <div
      className="relative h-[127px] w-full max-w-[345px]"
      style={{
        filter:
          "drop-shadow(4px 4px 4px rgba(255, 226, 178, 1))",
      }}
    >
      <button
        type="button"
        className="relative h-full w-full bg-transparent text-left transition-transform active:scale-[0.99]"
        onClick={() => onClick(activity)}
        aria-label={`${activity.placeName} 방문 기록 상세 보기`}
        aria-current={
          isSelected ? "true" : undefined
        }
      >
        {/* 티켓 배경 */}
        <img
          src={ticketBackground}
          alt=""
          className="pointer-events-none absolute inset-0 h-[127px] w-[345px]"
          aria-hidden="true"
        />

        {/* 방문 정보 */}
        <div className="absolute bottom-0 left-[22px] right-[115px] top-0 z-10 py-[11px]">
          <div className="flex min-w-0 items-center gap-[6px]">
            <span
              className="shrink-0 text-[15px]"
              aria-hidden="true"
            >
              📍
            </span>

            <h2 className="truncate text-[23px] font-bold leading-[33px] text-[#754308]">
              {activity.placeName}
            </h2>

            {activity.visitStatus && (
              <span className="ml-auto shrink-0 rounded-full border border-[#FFAC27] bg-[#FFF8E8] px-[7px] py-[2px] text-[11px] font-medium leading-[12px] text-[#FFAC27]">
                {activity.visitStatus}
              </span>
            )}
          </div>

          <p className="mt-[3px] truncate pl-[22px] text-[11px] leading-[14px] text-[#6B6B6B]">
            {activity.address}
          </p>

          <time
            dateTime={activity.date}
            className="mt-[2px] block pl-[22px] text-[11px] leading-[14px] text-[#6B6B6B]"
          >
            {formatVisitDate(activity.date)}
          </time>

          <div className="mt-[4px] flex items-center gap-[2px] pl-[22px]">
            <img
              src={sunIcon}
              alt=""
              className="h-[21.198px] w-[21.245px] shrink-0 object-contain"
              aria-hidden="true"
            />

            <p className="text-[11px] font-medium leading-[14px] text-[#FFAC27]">
              햇빛 점수{activity.sunshineScore}점
            </p>
          </div>
        </div>

        {/* 솔냥이 상체 */}
        <div className="pointer-events-none absolute bottom-[7px] right-[100px] z-20 h-[62px] w-[90px] overflow-hidden">
          <img
            src={solnyangHello}
            alt=""
            className="h-[86px] w-[90px] object-contain object-top"
          />
        </div>

        {/* 방문 장소 이미지 */}
        {showPlaceholder ? (
          <div className="absolute right-[15px] top-[7px] z-10 flex h-[105px] w-[82px] items-center justify-center rounded-[6px] bg-[#FFF3DD] text-[25px]">
            <span aria-hidden="true">
              📍
            </span>
          </div>
        ) : (
          <img
            src={activity.imageUrl}
            alt=""
            loading="lazy"
            onError={() =>
              setImageFailed(true)
            }
            className="absolute right-[15px] top-[7px] z-10 h-[105px] w-[82px] rounded-[6px] object-cover"
          />
        )}
      </button>
    </div>
  );
}

export default VisitRecordCard;