import type { DailyActivity } from "../../data/historyCalendar";

interface RecordMonthlyPlacesProps {
  activities: DailyActivity[];
  onOpenAll: () => void;
  onSelectActivity: (activityId: string) => void;
}

function formatVisitedDate(date: string) {
  const [, month, day] = date.split("-").map(Number);

  return `${month}월 ${day}일`;
}

function RecordMonthlyPlaces({
  activities,
  onOpenAll,
  onSelectActivity,
}: RecordMonthlyPlacesProps) {
  return (
    <section
      className="h-[186px] w-[334px] rounded-[20px] border border-[#FFAC27] bg-[#FFFEF8] px-[13px] py-[11px]"
      style={{
        boxShadow: "4px 4px 4px 0 #FFE2B2",
      }}
      aria-labelledby="monthly-places-title"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-[#754308]"
        onClick={onOpenAll}
      >
        <h2
          id="monthly-places-title"
          className="text-[18px] font-bold leading-[22px]"
        >
          이 달의 기록 📚
        </h2>

        <span className="text-[30px] leading-none">
          ›
        </span>
      </button>

      <div className="mt-[8px] grid grid-cols-3 gap-[7px]">
        {activities.slice(0, 3).map((activity) => (
          <button
            key={activity.id}
            type="button"
            className="min-w-0 text-left"
            onClick={() => onSelectActivity(activity.id)}
            aria-label={`${activity.placeName}, ${formatVisitedDate(
              activity.date,
            )} 방문 기록 보기`}
          >
            {activity.imageUrl ? (
              <img
                src={activity.imageUrl}
                alt=""
                loading="lazy"
                className="h-[80px] w-[95px] rounded-[6px] object-cover"
                style={{
                  boxShadow:
                    "4px 4px 4px 0 rgba(0, 0, 0, 0.25)",
                }}
              />
            ) : (
              <div
                className="flex h-[80px] w-[95px] items-center justify-center rounded-[6px] bg-[#FFF3DD] text-[24px]"
                style={{
                  boxShadow:
                    "4px 4px 4px 0 rgba(0, 0, 0, 0.25)",
                }}
                aria-hidden="true"
              >
                📍
              </div>
            )}

            <strong className="mt-[4px] block truncate pl-[6px] text-[16px] font-bold leading-[20px] text-[#754308]">
              {activity.placeName}
            </strong>

            <time
              dateTime={activity.date}
              className="mt-[1px] block pl-[7px] text-[9px] leading-[14px] text-[#939393]"
            >
              {formatVisitedDate(activity.date)}
            </time>
          </button>
        ))}
      </div>
    </section>
  );
}

export default RecordMonthlyPlaces;