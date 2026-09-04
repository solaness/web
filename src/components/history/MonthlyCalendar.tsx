import type {
  TravelSchedule,
} from "../../data/historyCalendar";

interface MonthlyCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  activityDates: string[];
  travelSchedules: TravelSchedule[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
];

function formatDateKey(
  year: number,
  month: number,
  day: number,
): string {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function addDays(
  dateKey: string,
  amount: number,
): string {
  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day + amount,
  );

  return formatDateKey(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function findSchedule(
  dateKey: string,
  schedules: TravelSchedule[],
): TravelSchedule | undefined {
  return schedules.find(
    (schedule) =>
      dateKey >= schedule.startDate &&
      dateKey <= schedule.endDate,
  );
}

function MonthlyCalendar({
  year,
  month,
  selectedDate,
  activityDates,
  travelSchedules,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: MonthlyCalendarProps) {
  const firstWeekday = new Date(
    year,
    month,
    1,
  ).getDay();

  const numberOfDays = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const cellCount =
    Math.ceil(
      (firstWeekday + numberOfDays) / 7,
    ) * 7;

  const activityDateSet = new Set(
    activityDates,
  );

  const today = new Date();

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <section
      className="w-full"
      aria-label="월간 활동 캘린더"
    >
      {/* 연도·월과 이동 버튼 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-xl text-[#6B6B6B]"
          onClick={onPreviousMonth}
          aria-label="이전 달"
        >
          ‹
        </button>

        <h2 className="text-[16px] font-bold text-[#1A1A2E]">
          {year}년 {month + 1}월
        </h2>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-xl text-[#6B6B6B]"
          onClick={onNextMonth}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* 요일 */}
      <div className="mt-3 grid grid-cols-7">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="flex h-8 items-center justify-center text-[12px] font-medium text-[#6B6B6B]"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({
          length: cellCount,
        }).map((_, index) => {
          const day =
            index - firstWeekday + 1;

          if (
            day < 1 ||
            day > numberOfDays
          ) {
            return (
              <div
                key={`empty-${index}`}
                className="h-[35px]"
                aria-hidden="true"
              />
            );
          }

          const dateKey = formatDateKey(
            year,
            month,
            day,
          );

          const weekday = new Date(
            year,
            month,
            day,
          ).getDay();

          const schedule = findSchedule(
            dateKey,
            travelSchedules,
          );

          const previousDateKey =
            addDays(dateKey, -1);

          const nextDateKey =
            addDays(dateKey, 1);

          const previousSchedule =
            findSchedule(
              previousDateKey,
              travelSchedules,
            );

          const nextSchedule =
            findSchedule(
              nextDateKey,
              travelSchedules,
            );

          const isScheduleStart =
            schedule?.startDate ===
            dateKey;

          const isScheduleEnd =
            schedule?.endDate ===
            dateKey;

          const isScheduleEndpoint =
            isScheduleStart ||
            isScheduleEnd;

          const isSingleDaySchedule =
            Boolean(schedule) &&
            isScheduleStart &&
            isScheduleEnd;

          /*
           * 일요일은 이전 캘린더 줄과 연결하지 않고,
           * 토요일은 다음 캘린더 줄과 연결하지 않습니다.
           */
          const connectsToPrevious =
            Boolean(schedule) &&
            previousSchedule?.id ===
              schedule?.id &&
            weekday !== 0;

          const connectsToNext =
            Boolean(schedule) &&
            nextSchedule?.id ===
              schedule?.id &&
            weekday !== 6;

          const hasActivity =
            activityDateSet.has(dateKey);

          const isSelected =
            selectedDate === dateKey;

          const isToday =
            todayKey === dateKey;

          let dateClassName =
            "text-[#6B6B6B] hover:bg-[#FFF0D8]";

          if (isToday) {
            dateClassName =
              "bg-[#FFF0D8] font-semibold text-[#F78903]";
          }

          /*
           * 연속 일정에 포함되지 않은
           * 일반 활동 날짜
           */
          if (
            hasActivity &&
            !schedule
          ) {
            dateClassName =
              "border-2 border-[#FFAC27] bg-white font-medium text-[#F78903]";
          }

          /*
           * 여행 일정 중간 날짜
           */
          if (
            schedule &&
            !isScheduleEndpoint
          ) {
            dateClassName =
              "font-medium text-[#F78903]";
          }

          /*
           * 여행 시작일과 종료일은
           * 기존 단일 활동과 동일한 원으로 표시
           */
          if (isScheduleEndpoint) {
            dateClassName =
              "border-2 border-[#FFAC27] bg-white font-semibold text-[#F78903]";
          }

          /*
           * 선택된 날짜의 스타일을
           * 가장 우선 적용
           */
          if (isSelected) {
            dateClassName =
              "border-2 border-[#FFAC27] bg-[#FFE2B2] font-semibold text-[#F78903]";
          }

          /*
           * 연속 일정 배경 위치
           *
           * 실제 시작일: 날짜 원 중앙에서 오른쪽으로 시작
           * 실제 종료일: 왼쪽에서 날짜 원 중앙까지 표시
           * 중간 날짜: 셀 전체를 채움
           * 주가 바뀌면 현재 줄 끝에서 끊고 다음 줄에서 재시작
           */
          let rangeLeft = "-1px";
          let rangeRight = "-1px";

          if (!connectsToPrevious) {
            rangeLeft = isScheduleStart
              ? "50%"
              : "0px";
          }

          if (!connectsToNext) {
            rangeRight = isScheduleEnd
              ? "50%"
              : "0px";
          }

          const rangeBorderClass = [
            !connectsToPrevious
              ? "rounded-l-full border-l"
              : "",
            !connectsToNext
              ? "rounded-r-full border-r"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          const scheduleLabel = schedule
            ? `, ${schedule.title}`
            : "";

          return (
            <div
              key={dateKey}
              className="relative flex h-[35px] items-center justify-center overflow-visible"
            >
              {schedule &&
                !isSingleDaySchedule && (
                  <div
                    className={`pointer-events-none absolute top-[3px] z-0 h-[29px] border-y border-[#FFE2B2] bg-[rgba(255,226,178,0.5)] ${rangeBorderClass}`}
                    style={{
                      left: rangeLeft,
                      right: rangeRight,
                    }}
                    aria-hidden="true"
                  />
                )}

              <button
                type="button"
                className={`relative z-10 flex h-[29px] w-[29px] items-center justify-center rounded-full text-[12px] transition-colors ${dateClassName}`}
                onClick={() =>
                  onSelectDate(dateKey)
                }
                aria-label={`${year}년 ${month + 1}월 ${day}일${
                  hasActivity
                    ? ", 활동 기록 있음"
                    : ""
                }${scheduleLabel}`}
                aria-pressed={isSelected}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MonthlyCalendar;