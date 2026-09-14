import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getVisitRecords } from "../firebase/firestore";
import type { DailyActivity } from "../data/historyCalendar";

type LoadStatus = "loading" | "success" | "error";

/**
 * uid별로 마지막 성공 조회 결과를 캐싱한다. Calendar/HistoryMain/Visits가 한 세션 안에서
 * 차례로 마운트되며 각자 getVisitRecords(전체 컬렉션 조회)를 다시 부르던 걸 막기 위함 —
 * 한 번 불러온 뒤엔 캐시를 그대로 재사용하고, retry()를 호출했을 때만 다시 읽는다.
 */
const cache = new Map<string, DailyActivity[]>();

/**
 * users/{uid}/visitRecords 전체 목록을 불러온다. Calendar, HistoryMain, Visits가 각자
 * 구현하던 동일한 loadStatus/retryToken/cancelled-effect 패턴을 여기로 모았다.
 * 게스트/비로그인이면 fetch 없이 빈 목록으로 success 처리한다.
 */
export function useVisitRecords() {
  const { user, isGuest } = useAuth();
  const userId = user?.uid ?? null;

  const [activities, setActivities] = useState<DailyActivity[]>(
    () => (userId && cache.has(userId) ? cache.get(userId)! : []),
  );

  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    () => (isGuest || !userId || cache.has(userId ?? "") ? "success" : "loading"),
  );

  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (isGuest || !userId) {
      setActivities([]);
      setLoadStatus("success");
      return;
    }

    if (retryToken === 0 && cache.has(userId)) {
      setActivities(cache.get(userId)!);
      setLoadStatus("success");
      return;
    }

    let cancelled = false;
    setLoadStatus("loading");

    getVisitRecords(userId)
      .then((records) => {
        cache.set(userId, records);

        if (!cancelled) {
          setActivities(records);
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

  return {
    activities,
    loadStatus,
    retry: () => setRetryToken((token) => token + 1),
  };
}
