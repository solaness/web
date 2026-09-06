import { Navigate, useNavigate } from "react-router-dom";
import solnyangHello from "../../assets/images/solnyang-hello.svg";
import RecordMiniCalendar from "../../components/history/RecordMiniCalendar";
import RecordMonthlyPlaces from "../../components/history/RecordMonthlyPlaces";
import RecordMonthlySummary from "../../components/history/RecordMonthlySummary";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import { useAuth } from "../../contexts/AuthContext";
import { SAMPLE_ACTIVITIES } from "../../data/historyCalendar";

const now = new Date();
const DISPLAY_YEAR = now.getFullYear();
const DISPLAY_MONTH = now.getMonth();

function HistoryMain() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  if (isGuest) {
    return <Navigate to="/history/calendar" replace />;
  }

  const monthPrefix = `${DISPLAY_YEAR}-${String(
    DISPLAY_MONTH + 1,
  ).padStart(2, "0")}`;

  const monthlyActivities = SAMPLE_ACTIVITIES.filter((activity) =>
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
      className="relative mx-auto min-h-[1061px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6] px-[27px] pb-28 pt-5"
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
    </main>
  );
}

export default HistoryMain;