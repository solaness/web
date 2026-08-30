import {
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import DailyActivityCard from "../../components/history/DailyActivityCard";
import HistoryEmptyState from "../../components/history/HistoryEmptyState";
import MonthlyCalendar from "../../components/history/MonthlyCalendar";
import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  SAMPLE_ACTIVITIES,
  SAMPLE_TRAVEL_SCHEDULES,
} from "../../data/historyCalendar";

const INITIAL_YEAR = 2026;

/*
 * JavaScript의 월은 0부터 시작합니다.
 * 6은 7월입니다.
 */
const INITIAL_MONTH = 6;

function Calendar() {
  const navigate = useNavigate();

  const {
    user,
    isGuest,
  } = useAuth();

  const [year, setYear] =
    useState(INITIAL_YEAR);

  const [month, setMonth] =
    useState(INITIAL_MONTH);

  /*
   * 처음 화면에 들어왔을 때는
   * 아무 날짜도 선택하지 않습니다.
   */
  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string | null>(null);

  const monthPrefix = `${year}-${String(
    month + 1,
  ).padStart(2, "0")}`;

  /*
   * 로그인 사용자는 UI 확인용 샘플 데이터를 사용합니다.
   * 게스트는 기록이 없는 상태를 표시합니다.
   *
   * Firestore 연결 후 SAMPLE_ACTIVITIES를
   * 실제 조회 결과로 교체하면 됩니다.
   */
  const availableActivities = useMemo(
    () => {
      if (isGuest || !user) {
        return [];
      }

      return SAMPLE_ACTIVITIES;
    },
    [isGuest, user],
  );

  /*
   * 로그인 사용자에게만 연속 일정을 표시합니다.
   */
  const availableTravelSchedules =
    useMemo(() => {
      if (isGuest || !user) {
        return [];
      }

      return SAMPLE_TRAVEL_SCHEDULES;
    }, [isGuest, user]);

  /*
   * 현재 화면에 표시된 연도와 월에 해당하는
   * 활동 기록만 추출합니다.
   */
  const monthlyActivities = useMemo(
    () =>
      availableActivities.filter(
        (activity) =>
          activity.date.startsWith(
            monthPrefix,
          ),
      ),
    [
      availableActivities,
      monthPrefix,
    ],
  );

  /*
   * 현재 월과 겹치는 여행 일정만 추출합니다.
   */
  const monthlyTravelSchedules =
    useMemo(() => {
      const firstDate =
        `${monthPrefix}-01`;

      const lastDay = new Date(
        year,
        month + 1,
        0,
      ).getDate();

      const lastDate =
        `${monthPrefix}-${String(
          lastDay,
        ).padStart(2, "0")}`;

      return availableTravelSchedules.filter(
        (schedule) =>
          schedule.startDate <= lastDate &&
          schedule.endDate >= firstDate,
      );
    }, [
      availableTravelSchedules,
      monthPrefix,
      month,
      year,
    ]);

  /*
   * 캘린더에 원형으로 표시할 활동 날짜 목록입니다.
   */
  const activityDates = useMemo(
    () =>
      monthlyActivities.map(
        (activity) =>
          activity.date,
      ),
    [monthlyActivities],
  );

  /*
   * 선택한 날짜에 해당하는 활동 기록입니다.
   */
  const selectedActivity =
    selectedDate
      ? monthlyActivities.find(
          (activity) =>
            activity.date === selectedDate,
        )
      : undefined;

  const selectedMonth = selectedDate
    ? Number(
        selectedDate.slice(5, 7),
      )
    : null;

  const selectedDay = selectedDate
    ? Number(
        selectedDate.slice(8, 10),
      )
    : null;

  const hasMonthlyActivity =
    monthlyActivities.length > 0;

  /*
   * 빈 상태 문구
   *
   * 1. 날짜 선택 + 기록 없음
   * 2. 이번 달 기록 있음 + 날짜 미선택
   * 3. 이번 달 전체 기록 없음 + 날짜 미선택
   */
  let emptyMessage: string;

  if (
    selectedDate &&
    selectedMonth !== null &&
    selectedDay !== null
  ) {
    emptyMessage =
      `${selectedMonth}월 ${selectedDay}일, 활동 기록이 없어요 🥺`;
  } else if (hasMonthlyActivity) {
    emptyMessage =
      "날짜를 선택해주세요";
  } else {
    emptyMessage =
      "아직 이번 달 활동 기록이 없어요 🥺";
  }

  const handlePreviousMonth = () => {
    if (month === 0) {
      setYear(
        (previousYear) =>
          previousYear - 1,
      );

      setMonth(11);
    } else {
      setMonth(
        (previousMonth) =>
          previousMonth - 1,
      );
    }

    /*
     * 월을 변경하면 기존 선택 날짜를 해제합니다.
     */
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(
        (previousYear) =>
          previousYear + 1,
      );

      setMonth(0);
    } else {
      setMonth(
        (previousMonth) =>
          previousMonth + 1,
      );
    }

    setSelectedDate(null);
  };

  const handleSelectDate = (
    date: string,
  ) => {
    setSelectedDate(date);
  };

  const handleBottomButton = () => {
    if (selectedActivity) {
      navigate(
        `/history/visits?recordId=${selectedActivity.id}`,
      );

      return;
    }

    navigate("/home");
  };

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-[393px] bg-[#FFFDF6] px-[23px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <header>
        <h1 className="text-[24px] font-bold text-[#F78903]">
          Solaness
        </h1>
      </header>

      <div className="mt-8">
        <MonthlyCalendar
          year={year}
          month={month}
          selectedDate={
            selectedDate
          }
          activityDates={
            activityDates
          }
          travelSchedules={
            monthlyTravelSchedules
          }
          onPreviousMonth={
            handlePreviousMonth
          }
          onNextMonth={
            handleNextMonth
          }
          onSelectDate={
            handleSelectDate
          }
        />
      </div>

      <div className="mt-7 px-1 pb-2">
        {selectedActivity &&
        selectedDay !== null ? (
          <DailyActivityCard
            day={selectedDay}
            activity={
              selectedActivity
            }
          />
        ) : (
          <HistoryEmptyState
            message={emptyMessage}
          />
        )}
      </div>

      <div className="px-1">
        <button
          type="button"
          className="mt-2 h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-[16px] font-bold text-white shadow-[4px_4px_4px_rgba(138,62,15,0.25)] transition-colors hover:bg-[#F78903] active:bg-[#E97B00]"
          onClick={handleBottomButton}
        >
          {selectedActivity
            ? "방문기록 보러가기"
            : "햇빛 지수 채우러 가기"}
        </button>
      </div>
    </main>
  );
}

export default Calendar;