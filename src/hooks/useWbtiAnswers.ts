import { useCallback, useState } from "react";
import type { WbtiAnswerMap, WbtiAxisCode } from "../types/wbti";

const STORAGE_KEY = "onboardingWbtiAnswers";

function readStoredAnswers(storageKey: string): WbtiAnswerMap {
  const storedValue = sessionStorage.getItem(storageKey);

  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue) as WbtiAnswerMap | null;
    return parsedValue ?? {};
  } catch {
    return {};
  }
}

/**
 * WBTI 답변을 sessionStorage에 즉시 반영하며 관리하는 훅.
 * Region.tsx의 "다음" 클릭 시점 저장과 달리, 문항은 선택할 때마다 저장해야
 * 페이지를 오갈 때(이전/다음) 답변이 복원된다.
 *
 * storageKey를 파라미터화해 둔 것은 향후 마이페이지 "WBTI 재검사" 화면이
 * 온보딩과 별도의 저장 공간을 쓰고 싶을 때를 대비한 설계이며, 이번 이슈에서는
 * 기본값(onboardingWbtiAnswers)만 사용한다.
 */
export function useWbtiAnswers(storageKey: string = STORAGE_KEY) {
  const [answers, setAnswers] = useState<WbtiAnswerMap>(() =>
    readStoredAnswers(storageKey),
  );

  const selectAnswer = useCallback(
    (questionId: number, code: WbtiAxisCode) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: code };
        sessionStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  const isPageComplete = useCallback(
    (questionIds: number[]) =>
      questionIds.every((id) => Boolean(answers[id])),
    [answers],
  );

  return { answers, selectAnswer, isPageComplete };
}

export { STORAGE_KEY as WBTI_ANSWERS_STORAGE_KEY };
