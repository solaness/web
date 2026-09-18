import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import AppTitle from "../../components/shared/AppTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useGoBack } from "../../hooks/useGoBack";
import { addVisitRecord } from "../../firebase/firestore";
import { getSunScore } from "../../constants/sunScore";
import { CATEGORIES } from "../../constants/categories";
import sunIcon from "../../assets/images/sun.svg";
import calendarIcon from "../../assets/images/calendar.svg";
import clockIcon from "../../assets/images/clock.svg";
import pencilIcon from "../../assets/images/pencil.svg";
import type { Place } from "../../types/place";

interface VisitRecordFormLocationState {
  place?: Place;
  date?: string;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatVisitDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];

  return `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(
    2,
    "0",
  )} (${weekday})`;
}

/** 시작~종료 시각 사이 분(分)을 구한다. 종료가 시작보다 빠르면 null. */
function minutesBetween(start: string, end: string): number | null {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const minutes =
    endHour * 60 + endMinute - (startHour * 60 + startMinute);

  return minutes > 0 ? minutes : null;
}

function VisitRecordForm() {
  const navigate = useNavigate();
  const goBack = useGoBack("/history/calendar");
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { place, date } =
    (location.state as VisitRecordFormLocationState | null) ?? {};

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activityNote, setActivityNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!place || !date) {
    return (
      <Navigate
        to="/history/calendar"
        replace
      />
    );
  }

  const categoryLabel =
    CATEGORIES.find((option) => option.code === place.category)?.label ??
    place.category;

  const scorePerMinute = getSunScore(
    [place.category],
    place.isIndoorExperience ?? false,
  );

  const sunshineMinutes =
    startTime && endTime ? minutesBetween(startTime, endTime) : null;

  const hasTimeRangeError = Boolean(
    startTime && endTime && sunshineMinutes === null,
  );

  const canSave = sunshineMinutes !== null && !isSaving && userId !== null;

  const handleSave = async () => {
    if (sunshineMinutes === null || !userId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const newId = await addVisitRecord(userId, {
        date,
        placeId: place.id,
        placeName: place.name,
        address: place.address,
        category: categoryLabel,
        sunshineScore: scorePerMinute * sunshineMinutes,
        sunshineMinutes,
        scorePerMinute,
        visitStartTime: startTime,
        visitEndTime: endTime,
        activityNote: activityNote.trim() || undefined,
        imageUrl: place.thumbnailUrl,
      });

      navigate(`/history/visits/${newId}`, { replace: true });
    } catch (error) {
      console.error("방문 기록 저장에 실패했어요:", error);
      setSaveError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
    }
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

      <header className="relative z-10 -ml-[5px] mt-[4px] flex items-center gap-1">
        <AppTitle
          onBack={goBack}
          titleClassName="text-[32px] font-bold text-[#F78903]"
        />
      </header>

      <div className="relative z-10 mt-[44px] flex flex-col gap-[11px]">
        {/* 장소 정보 */}
        <section className="w-full rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] py-[12px] pl-[24px] pr-[14px]">
          <span className="inline-flex rounded-full border border-[#FFC14F] px-[8px] py-[2px] text-[11px] font-medium leading-[12px] text-[#FFAC27]">
            {categoryLabel}
          </span>

          <h2 className="mt-[8px] text-[32px] font-bold leading-[30px] text-[#754308]">
            {place.name}
          </h2>

          <p className="mt-[13px] text-[12px] leading-[14px] text-[#6B6B6B]">
            📍 {place.address}
          </p>
        </section>

        {/* 방문한 날 */}
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
              dateTime={date}
              className="w-full text-center text-[16px] font-bold leading-[18px] text-[#754308]"
            >
              {formatVisitDate(date)}
            </time>
          </div>
        </section>

        {/* 머문 시간 입력 */}
        <section className="rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[14px] py-[12px]">
          <p className="flex items-center gap-[4px] text-[14px] font-medium text-[#FFAC27]">
            <img
              src={clockIcon}
              alt=""
              aria-hidden="true"
              className="h-[24px] w-[24px] shrink-0 object-contain"
            />
            <span>머문 시간</span>
          </p>

          <div className="mt-[10px] flex items-center gap-[10px]">
            <input
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              aria-label="방문 시작 시간"
              className="h-[42px] flex-1 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-3 text-sm font-medium text-[#4F4F4F] outline-none"
            />

            <span className="text-[#754308]">~</span>

            <input
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              aria-label="방문 종료 시간"
              className="h-[42px] flex-1 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-3 text-sm font-medium text-[#4F4F4F] outline-none"
            />
          </div>

          {hasTimeRangeError && (
            <p className="mt-[6px] text-[11px] text-red-500">
              종료 시간은 시작 시간보다 늦어야 해요.
            </p>
          )}
        </section>

        {/* 햇빛 점수 */}
        <section className="relative flex h-[187px] w-full flex-col items-center rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[11px] py-[13px] text-center">
          <p className="flex items-center justify-center gap-[4px] text-[13px] font-medium text-[#754308]">
            <img
              src={sunIcon}
              alt=""
              aria-hidden="true"
              className="h-[36px] w-[37px] shrink-0 object-contain"
            />
            <span>이번 방문으로 모을 햇빛</span>
          </p>

          <strong className="mt-[13px] text-[40px] font-bold leading-[42px] text-[#F6A425]">
            {sunshineMinutes !== null
              ? `${scorePerMinute * sunshineMinutes}점`
              : "-"}
          </strong>

          <span className="mt-[8px] rounded-full border border-[#FFC14F] px-[15px] py-[2px] text-[12px] font-medium text-[#FFAC27]">
            {scorePerMinute}점 X {sunshineMinutes ?? 0}분
          </span>

          <p className="absolute bottom-0 left-0 right-0 flex h-[32px] items-center justify-center border-t border-[#FFE2B2] text-[10px] text-[#939393]">
            이 장소는 분당 {scorePerMinute}점이 적립돼요
          </p>
        </section>

        {/* 활동 기록 입력 */}
        <section className="rounded-[11px] border border-[#FFC14F] bg-[#FFFEF6] px-[14px] py-[11px]">
          <h3 className="flex items-center gap-[4px] text-[14px] font-medium text-[#FFAC27]">
            <img
              src={pencilIcon}
              alt=""
              aria-hidden="true"
              className="h-[24px] w-[24px] shrink-0 object-contain"
            />
            <span>활동 기록</span>
          </h3>

          <textarea
            value={activityNote}
            onChange={(event) =>
              setActivityNote(event.target.value)
            }
            placeholder="오늘 활동을 기록해보세요"
            rows={3}
            className="mt-[8px] w-full resize-none bg-transparent pl-[28px] text-[13px] leading-[18px] text-[#754308] outline-none placeholder:text-[#B3B3B3]"
          />
        </section>

        {saveError && (
          <p className="text-center text-[12px] text-red-500">{saveError}</p>
        )}

        <button
          type="button"
          disabled={!canSave}
          className="h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-[14px] font-bold text-white shadow-[4px_4px_4px_rgba(138,62,15,0.25)] transition-colors hover:bg-[#F78903] active:bg-[#E97B00] disabled:cursor-not-allowed disabled:bg-[#E0E0E0] disabled:shadow-none"
          onClick={handleSave}
        >
          {isSaving ? "저장하는 중..." : "기록 저장하기"}
        </button>
      </div>
    </main>
  );
}

export default VisitRecordForm;
