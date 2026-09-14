import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import DailyActivityCard from "../../components/history/DailyActivityCard";
import HistoryEmptyState from "../../components/history/HistoryEmptyState";
import MonthlyCalendar from "../../components/history/MonthlyCalendar";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import IconChevronLeft from "../../assets/icons/icon-chevron-left.svg?react";
import { useGoBack } from "../../hooks/useGoBack";
import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  getVisitRecords,
} from "../../firebase/firestore";
import type {
  DailyActivity,
} from "../../data/historyCalendar";

/*
 * 실제 오늘 날짜로 캘린더를 엽니다. 예전엔 목업 데이터(2026년 7월 샘플)에
 * 맞춰 2026-07로 고정해뒀는데, 그 상태로 실제 기록을 추가하면 "이번 달"
 * 기준으로 집계하는 기록 메인 화면(HistoryMain)의 통계에는 안 잡히는
 * 문제가 있었다.
 */
const today = new Date();
const INITIAL_YEAR = today.getFullYear();
const INITIAL_MONTH = today.getMonth();

function Calendar() {
  const navigate = useNavigate();
  const goBack = useGoBack("/home");

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

  const userId = user?.uid ?? null;

  const [availableActivities, setAvailableActivities] =
    useState<DailyActivity[]>([]);

  const [loadStatus, setLoadStatus] =
    useState<"loading" | "success" | "error">("loading");

  const [retryToken, setRetryToken] = useState(0);

  /*
   * 로그인 사용자는 본인의 Firestore 방문 기록을 불러옵니다.
   * 게스트는 기록이 없는 상태를 표시합니다.
   */
  useEffect(() => {
    if (isGuest || !userId) {
      setAvailableActivities([]);
      setLoadStatus("success");
      return;
    }

    let cancelled = false;
    setLoadStatus("loading");

    getVisitRecords(userId)
      .then((records) => {
        if (!cancelled) {
          setAvailableActivities(records);
          setLoadStatus("success");
        }
      })
      .catch((error) => {
        console.error("방문 기록을 불러오지 못했어요:", error);
        if (!cancelled) {
          setLoadStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isGuest, userId, retryToken]);

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
        `/history/visits?recordId=${selectedActivity.id}&year=${year}&month=${month + 1}`,
      );

      return;
    }

    navigate("/home");
  };

  const handleAddRecord = () => {
    if (!selectedDate) {
      return;
    }

    navigate("/map", {
      state: {
        recordDate: selectedDate,
      },
    });
  };

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-[393px] bg-[#FFFDF6] px-[23px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <header className="flex items-center gap-1">
        <button
          type="button"
          onClick={goBack}
          aria-label="이전 화면으로 이동"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#F78903]"
        >
          <IconChevronLeft />
        </button>

        <h1 className="text-[24px] font-bold text-[#F78903]">
          Solaness
        </h1>
      </header>

      {loadStatus === "loading" && (
        <LoadingScreen message="방문 기록을 불러오는 중..." />
      )}

      {loadStatus === "error" && (
        <ErrorScreen
          message="방문 기록을 불러오지 못했어요."
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      )}

      {loadStatus === "success" && (
        <>
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
           []
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

        {selectedDate && (
          <button
            type="button"
            className="mt-2 h-[53px] w-full rounded-[25px] border border-[#FFAC27] bg-[#FFFEF6] text-[16px] font-bold text-[#FFAC27] transition-colors hover:bg-[#FFF3DD] active:bg-[#FFE9C2]"
            onClick={handleAddRecord}
          >
            방문 기록 추가하기
          </button>
        )}
      </div>
        </>
      )}
    </main>
  );
}

export default Calendar;