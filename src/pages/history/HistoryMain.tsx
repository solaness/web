import { useNavigate } from "react-router-dom";
import solnyangHello from "../../assets/images/solnyang-hello.svg";
import RecordMiniCalendar from "../../components/history/RecordMiniCalendar";
import RecordMonthlyPlaces from "../../components/history/RecordMonthlyPlaces";
import RecordMonthlySummary from "../../components/history/RecordMonthlySummary";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import { useVisitRecords } from "../../hooks/useVisitRecords";

const now = new Date();
const DISPLAY_YEAR = now.getFullYear();
const DISPLAY_MONTH = now.getMonth();

function HistoryMain() {
  const navigate = useNavigate();
  const { activities, loadStatus, retry } = useVisitRecords();

  const monthPrefix = `${DISPLAY_YEAR}-${String(
    DISPLAY_MONTH + 1,
  ).padStart(2, "0")}`;

  const monthlyActivities = activities.filter((activity) =>
    activity.date.startsWith(monthPrefix),
  );

  const activityDates = monthlyActivities.map(
    (activity) => activity.date,
  );

  const handleOpenCalendar = () => {
    navigate("/history/calendar");
  };

  const handleOpenVisits = () => {
    navigate("/history/visits");
  };

  const handleSelectActivity = (activityId: string) => {
    navigate(`/history/visits?recordId=${activityId}`);
  };

  return (
    <main
      className="relative mx-auto min-h-[1061px] w-full max-w-md overflow-hidden bg-[#FFFDF6] px-[27px] pb-28 pt-5"
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

        <img
          src={solnyangHello}
          alt=""
          className="pointer-events-none absolute right-[5px] top-[4px] h-[114.5px] w-[99.47px] object-contain object-top"
        />
      </header>

      {loadStatus === "loading" && (
        <LoadingScreen message="방문 기록을 불러오는 중..." />
      )}

      {loadStatus === "error" && (
        <ErrorScreen
          message="방문 기록을 불러오지 못했어요."
          onRetry={retry}
        />
      )}

      {loadStatus === "success" && (
        <div className="relative z-10 space-y-[12px]">
          <RecordMiniCalendar
            year={DISPLAY_YEAR}
            month={DISPLAY_MONTH}
            activityDates={activityDates}
            onOpenCalendar={handleOpenCalendar}
          />

          <RecordMonthlySummary activities={monthlyActivities} />

          <RecordMonthlyPlaces
            activities={monthlyActivities}
            onOpenAll={handleOpenVisits}
            onSelectActivity={handleSelectActivity}
          />
        </div>
      )}
    </main>
  );
}

export default HistoryMain;
