interface RecordMiniCalendarProps {
  year: number;
  month: number;
  activityDates: string[];
  onOpenCalendar: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateKey(
  year: number,
  month: number,
  day: number,
) {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function RecordMiniCalendar({
  year,
  month,
  activityDates,
  onOpenCalendar,
}: RecordMiniCalendarProps) {
  const firstWeekday = new Date(year, month, 1).getDay();

  const numberOfDays = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const cellCount =
    Math.ceil((firstWeekday + numberOfDays) / 7) * 7;

  const activityDateSet = new Set(activityDates);

  return (
    <section
      className="h-[302px] w-[339px] rounded-[20px] border border-[#FFAC27] bg-[#FFFEF8] px-[14px] py-[13px]"
      style={{
        boxShadow: "4px 4px 4px 0 #FFE2B2",
      }}
      aria-label="월간 기록 미니 캘린더"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-[#754308]"
        onClick={onOpenCalendar}
        aria-label={`${year}년 ${month + 1}월 기록 캘린더 열기`}
      >
        <strong className="text-[18px] font-bold leading-[22px]">
          {year}년 {month + 1}월
        </strong>

        <span className="text-[30px] font-normal leading-none">
          ›
        </span>
      </button>

      <div className="mt-[33px] grid grid-cols-7">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="flex h-[24px] items-center justify-center text-[15px] font-medium text-[#754308]"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="mt-[5px] grid grid-cols-7 gap-y-[7px]">
        {Array.from({ length: cellCount }).map((_, index) => {
          const day = index - firstWeekday + 1;

          if (day < 1 || day > numberOfDays) {
            return (
              <span
                key={`empty-${index}`}
                className="h-[29px]"
                aria-hidden="true"
              />
            );
          }

          const dateKey = formatDateKey(year, month, day);
          const hasActivity = activityDateSet.has(dateKey);

          return (
            <span
              key={dateKey}
              className="flex h-[29px] items-center justify-center"
            >
              <span
                className={`flex mt-[4px] h-[29px] w-[29px] items-center justify-center rounded-full text-[14px] font-medium ${
                  hasActivity
                    ? "border-2 border-[#FFAC27] bg-white text-[#F78903]"
                    : "text-[#754308]"
                }`}
              >
                {day}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default RecordMiniCalendar;