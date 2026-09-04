import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "solaness_recent_map_searches";
const MAX_RECENT_SEARCHES = 10;

function readStoredSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * 지도 검색 화면의 "최근 검색" 상태를 관리하는 훅.
 * 온보딩 진행 상태(sessionStorage)와 달리, 앱을 재시작해도 남아있어야 하는
 * 기기 로컬 검색 이력이라 localStorage에 저장한다.
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>(readStoredSearches);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }, [searches]);

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    setSearches((prev) => {
      const deduped = prev.filter((item) => item !== trimmed);
      return [trimmed, ...deduped].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const removeSearch = useCallback((term: string) => {
    setSearches((prev) => prev.filter((item) => item !== term));
  }, []);

  return { searches, addSearch, removeSearch };
}
