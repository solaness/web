import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import VisitRecordSwipeRow from "../../components/history/VisitRecordSwipeRow";
import ConfirmModal from "../../components/shared/ConfirmModal";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import LoadingScreen from "../../components/shared/LoadingScreen";
import ErrorScreen from "../../components/shared/ErrorScreen";
import AppTitle from "../../components/shared/AppTitle";
import { useVisitRecords } from "../../hooks/useVisitRecords";
import { useGoBack } from "../../hooks/useGoBack";
import type { DailyActivity } from "../../data/historyCalendar";

const TOAST_DURATION_MS = 2000;

interface ToastState {
  message: string;
  variant: "success" | "error";
}

function Visits() {
  const navigate = useNavigate();
  const goBack = useGoBack("/history");
  const [searchParams] = useSearchParams();

  const selectedRecordId = searchParams.get("recordId");

  const [openRecordId, setOpenRecordId] =
  useState<string | null>(null);

  const [pendingDelete, setPendingDelete] =
    useState<DailyActivity | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const toastTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

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

  const { activities: allActivities, loadStatus, retry,  removeRecord, } = useVisitRecords();

  /*
   * getVisitRecords가 이미 방문일(date) 내림차순으로 정렬해 돌려주므로
   * 여기서는 해당 월만 걸러내면 순서가 그대로 유지된다.
   */
  const activities = useMemo(
    () =>
      allActivities.filter((activity) =>
        activity.date.startsWith(monthPrefix),
      ),
    [allActivities, monthPrefix],
  );

  const handleSelectActivity = (
    activity: DailyActivity,
  ) => {
    navigate(`/history/visits/${activity.id}`);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);
  };

  const handleRequestDelete = (
    activity: DailyActivity,
  ) => {
    setOpenRecordId(null);
    setPendingDelete(activity);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    const target = pendingDelete;

    setPendingDelete(null);
    setOpenRecordId(null);

    try {
      await removeRecord(target.id);

      showToast({
        message: "방문 기록을 삭제했어요",
        variant: "success",
      });
    } catch (error) {
      console.error(
        "방문 기록 삭제에 실패했어요:",
        error,
      );

      showToast({
        message: "삭제에 실패했어요",
        variant: "error",
      });
    }
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

      <header className="relative z-10 flex h-[78px] items-center overflow-hidden">
        <AppTitle
          onBack={goBack}
          titleClassName="text-[24px] font-bold leading-[30px] text-[#F78903]"
        />
      </header>

      <section
        className="relative z-10 mt-[27px]"
        aria-label="방문 기록 목록"
      >
        {loadStatus === "loading" && (
          <LoadingScreen message="방문 기록을 불러오는 중..." />
        )}

        {loadStatus === "error" && (
          <ErrorScreen
            message="방문 기록을 불러오지 못했어요."
            onRetry={retry}
          />
        )}

        {loadStatus === "success" &&
          (activities.length > 0 ? (
            <div className="flex flex-col gap-[12px]">
              {activities.map((activity) => (
                <VisitRecordSwipeRow
                  key={activity.id}
                  activity={activity}
                  isOpen={openRecordId === activity.id}
                  isSelected={
                    selectedRecordId === activity.id
                  }
                  onOpenChange={(open) =>
                    setOpenRecordId(
                      open ? activity.id : null,
                    )
                  }
                  onSelect={handleSelectActivity}
                  onRequestDelete={
                    handleRequestDelete
                  }
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
          ))}
      </section>
      {pendingDelete && (
        <ConfirmModal
          title="방문 기록을 삭제할까요?"
          description="삭제된 기록은 복구할 수 없어요"
          primaryLabel="삭제하기"
          onPrimary={handleConfirmDelete}
          secondaryLabel="취소"
          onSecondary={() =>
            setPendingDelete(null)
          }
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-[100px] z-50 flex justify-center px-6">
          <div
            role="status"
            className={`flex h-[58px] w-full max-w-[345px] items-center justify-center rounded-[25px] shadow-[4px_4px_4px_0_rgba(138,62,15,0.25)] ${
              toast.variant === "success"
                ? "bg-[#FD9419]"
                : "bg-[#FF544E]"
            }`}
          >
            <p className="text-[20px] font-bold text-white">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default Visits;
