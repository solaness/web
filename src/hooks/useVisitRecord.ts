import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getVisitRecord } from "../firebase/firestore";
import type { DailyActivity } from "../data/historyCalendar";

type LoadStatus = "loading" | "success" | "error";

/** 기록 상세 화면(VisitDetail)에서 단건 조회할 때 쓰는, useVisitRecords와 짝을 이루는 훅. */
export function useVisitRecord(recordId: string | undefined) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!recordId || !userId) {
      setLoadStatus("success");
      return;
    }

    let cancelled = false;
    setLoadStatus("loading");

    getVisitRecord(userId, recordId)
      .then((record) => {
        if (!cancelled) {
          setActivity(record);
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
  }, [recordId, userId, retryToken]);

  return {
    activity,
    loadStatus,
    retry: () => setRetryToken((token) => token + 1),
  };
}
