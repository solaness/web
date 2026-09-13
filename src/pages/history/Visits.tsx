import { useMemo } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import VisitRecordCard from "../../components/history/VisitRecordCard";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import { useAuth } from "../../contexts/AuthContext";
import {
  type DailyActivity,
  SAMPLE_ACTIVITIES,
} from "../../data/historyCalendar";

function Visits() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isGuest } = useAuth();

  const selectedRecordId = searchParams.get("recordId");

  const today = new Date();

  const queryYear = Number(
    searchParams.get("year"),
  );

  const queryMonth = Number(
    searchParams.get("month"),
  );

  const selectedYear =
    queryYear > 0
      ? queryYear
      : today.getFullYear();

  const selectedMonth =
    queryMonth >= 1 && queryMonth <= 12
      ? queryMonth
      : today.getMonth() + 1;

  const monthPrefix = `${selectedYear}-${String(
    selectedMonth,
  ).padStart(2, "0")}`;

  const activities = useMemo(() => {
    if (isGuest || !user) {
      return [];
    }

    return SAMPLE_ACTIVITIES.filter((activity) =>
      activity.date.startsWith(monthPrefix),
    ).sort(
      (first, second) =>
        new Date(second.date).getTime() -
        new Date(first.date).getTime(),
    );
  }, [isGuest, user, monthPrefix]);

  const handleSelectActivity = (
    activity: DailyActivity,
  ) => {
    navigate(`/history/visits/${activity.id}`);
  };

  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6] px-[24px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 h-[78px] overflow-hidden">
        <h1 className="relative z-10 text-[24px] font-bold leading-[30px] text-[#F78903]">
          Solaness
        </h1>
      </header>

      <section
        className="relative z-10 mt-[27px]"
        aria-label="방문 기록 목록"
      >
        {activities.length > 0 ? (
          <div className="flex flex-col gap-[12px]">
            {activities.map((activity) => (
              <VisitRecordCard
                key={activity.id}
                activity={activity}
                isSelected={
                  selectedRecordId === activity.id
                }
                onClick={handleSelectActivity}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex h-[187px] w-full items-center justify-center rounded-[20px] border border-[#FFAC27] bg-white px-5 text-center"
            style={{
              boxShadow: "4px 4px 6px 0 #FFE2B2",
            }}
          >
            <p className="text-[17px] font-bold leading-[24px] text-[#754308]">
              아직 방문 기록이 없어요 🥺
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Visits;
