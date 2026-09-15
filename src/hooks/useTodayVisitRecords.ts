import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getVisitRecordsByDate } from "../firebase/firestore";
import type { DailyActivity } from "../data/historyCalendar";
import { getTodayDateKey } from "../utils/date";

type LoadStatus = "loading" | "success" | "error";

/**
 * 홈의 오늘의 햇빛 점수/권장 충전 시간 카드에서 사용. users/{uid}/visitRecords 전체가 아니라
 * 오늘 날짜 기록만 조회한다 — 두 카드를 렌더링하는 SunshineCardSlider가 방문 기록이 많은
 * 사용자에게도 가벼운 요청 하나로 끝나도록 useVisitRecords 대신 이 훅을 쓴다.
 */
export function useTodayVisitRecords() {
  const { user, isGuest } = useAuth();
  const userId = user?.uid ?? null;
  const todayKey = getTodayDateKey();

  const [activities, setActivities] = useState<DailyActivity[]>([]);

  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    () => (isGuest || !userId ? "success" : "loading"),
  );

  useEffect(() => {
    if (isGuest || !userId) {
      setActivities([]);
      setLoadStatus("success");
      return;
    }

    let cancelled = false;
    setLoadStatus("loading");

    getVisitRecordsByDate(userId, todayKey)
      .then((records) => {
        if (!cancelled) {
          setActivities(records);
          setLoadStatus("success");
        }
      })
      .catch((error) => {
        console.error("오늘의 방문 기록을 불러오지 못했어요:", error);
        if (!cancelled) {
          setLoadStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isGuest, userId, todayKey]);

  return { activities, loadStatus };
}
