import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import AppTitle from "../../components/shared/AppTitle";
import { useVisitRecord } from "../../hooks/useVisitRecord";
import { useGoBack } from "../../hooks/useGoBack";
import sunIcon from "../../assets/images/sun.svg";
import pencilIcon from "../../assets/images/pencil.svg";
import calendarIcon from "../../assets/images/calendar.svg";
import clockIcon from "../../assets/images/clock.svg";

const WEEKDAYS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
];

function formatVisitDate(date: string) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const weekday =
    WEEKDAYS[
      new Date(year, month - 1, day).getDay()
    ];

  return `${year}. ${String(month).padStart(
    2,
    "0",
  )}. ${String(day).padStart(
    2,
    "0",
  )} (${weekday})`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `총 ${remainingMinutes}분`;
  }

  if (remainingMinutes === 0) {
    return `총 ${hours}시간`;
  }

  return `총 ${hours}시간 ${remainingMinutes}분`;
}

function VisitDetail() {
  const navigate = useNavigate();
  const goBack = useGoBack("/history/visits");
  const { recordId } = useParams();
  const { activity, loadStatus, retry } = useVisitRecord(recordId);

  if (loadStatus === "loading") {
    return <LoadingScreen message="방문 기록을 불러오는 중..." />;
  }

  if (loadStatus === "error") {
    return (
      <ErrorScreen
        message="방문 기록을 불러오지 못했어요."
        onRetry={retry}
      />
    );
  }

  if (!recordId || !activity) {
    return (
      <Navigate
        to="/history/visits"
        replace
      />
    );
  }

  const handleOpenMap = () => {
    navigate(`/map/${activity.placeId}`);
  };

  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-md overflow-hidden bg-[#FFFDF6] px-[24px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10">
        <AppTitle
          onBack={goBack}
          titleClassName="text-[24px] font-bold leading-[30px] text-[#F78903]"
        />
      </header>

      <div className="relative z-10 mt-[44px] flex flex-col gap-[11px] ">
        {/* 장소 정보 */}
        <section className="min-h-[126px] w-full rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] py-[12px] pl-[24px] pr-[14px]">
          <span className="inline-flex rounded-full border border-[#FFC14F] px-[8px] py-[2px] text-[11px] font-medium leading-[12px] text-[#FFAC27]">
            {activity.category}
          </span>

          <h2 className="mt-[7px] line-clamp-2 break-words text-[clamp(24px,7vw,32px)] font-bold leading-[1.1] text-[#754308]">
            {activity.placeName}
          </h2>

          <p className="mt-[10px] flex min-w-0 items-center gap-[4px] text-[12px] leading-[14px] text-[#6B6B6B]">
            <span aria-hidden="true">📍</span>

            <span className="truncate">
              {activity.address}
            </span>
          </p>
        </section>

        <div className="grid grid-cols-2 gap-[20px]">
            {/* 방문 날짜 */}
            <section className="flex h-[84px] flex-col rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[11px] py-[10px]">
                <p className="flex items-center gap-[4px] text-[14px] font-medium text-[#FFAC27]">
                <img
                    src={calendarIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-[24px] w-[24px] shrink-0 object-contain"
                />
                <span>방문한 날</span>
                </p>

                <div className="flex flex-1 items-center">
                <time
                    dateTime={activity.date}
                    className="w-full text-center text-[16px] font-bold leading-[18px] text-[#754308]"
                >
                    {formatVisitDate(activity.date)}
                </time>
                </div>
            </section>

            {/* 머문 시간 */}
            <section className="flex h-[84px] flex-col rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[11px] py-[10px]">
                <p className="flex items-center gap-[4px] text-[14px] font-medium text-[#FFAC27]">
                <img
                    src={clockIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-[24px] w-[24px] shrink-0 object-contain"
                />
                <span>머문 시간</span>
                </p>

                <div className="flex flex-1 flex-col items-center justify-center">
                <p className="whitespace-nowrap text-[16px] font-bold leading-[18px] text-[#754308]">
                    {activity.visitStartTime ?? "--:--"} ~{" "}
                    {activity.visitEndTime ?? "--:--"}
                </p>

                <p className="mt-[2px] text-[10px] leading-[14px] text-[#939393]">
                    {formatDuration(activity.sunshineMinutes)}
                </p>
                </div>
            </section>
            </div>

        {/* 햇빛 점수 */}
        <section className="relative flex h-[187px] w-full flex-col items-center rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[11px] py-[13px] text-center">
          <p className="flex items-center justify-center gap-[4px] text-[13px] font-medium text-[#754308]">
            <img
                src={sunIcon}
                alt=""
                aria-hidden="true"
                className="h-[36px] w-[37px] shrink-0 object-contain"
            />
            <span>이번 방문으로 모은 햇빛</span>
          </p>

          <strong className="mt-[13px] text-[40px] font-bold leading-[42px] text-[#F6A425]">
            {activity.sunshineScore}점
          </strong>

          <span className="mt-[8px] rounded-full border border-[#FFC14F] px-[15px] py-[2px] text-[12px] font-medium text-[#FFAC27]">
            {activity.scorePerMinute}점 X{" "}
            {activity.sunshineMinutes}분
          </span>

          <p className="absolute bottom-0 left-0 right-0 flex h-[32px] items-center justify-center border-t border-[#FFE2B2] text-[10px] text-[#939393]">
            이 장소는 분당 {activity.scorePerMinute}점이 적립돼요
          </p>
        </section>

        {/* 활동 기록 */}
        <section className="h-[89px] w-full rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[14px] py-[11px]">
          <h3 className="flex items-center gap-[4px] text-[14px] font-medium text-[#FFAC27]">
            <img
                src={pencilIcon}
                alt=""
                aria-hidden="true"
                className="h-[24px] w-[24px] shrink-0 object-contain"
            />

            <span>활동 기록</span>
          </h3>

          <p className="mt-[8px] line-clamp-2 pl-[28px] text-[13px] leading-[14px] text-[#754308]">
            {activity.activityNote ??
              "작성한 활동 기록이 없어요."}
          </p>
        </section>

        <button
          type="button"
          className="h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-[14px] font-bold text-white shadow-[4px_4px_4px_rgba(138,62,15,0.25)] transition-colors hover:bg-[#F78903] active:bg-[#E97B00]"
          onClick={handleOpenMap}
        >
          지도에서 장소보기
        </button>
      </div>
    </main>
  );
}

export default VisitDetail;
