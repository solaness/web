/** 로컬 기준 "YYYY-MM-DD" 날짜 키로 변환한다. visitRecords의 `date` 필드와 같은 형식. */
export function formatDateKey(date: Date | null = null): string {
  const value = date ?? new Date();

  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

/** 오늘 날짜의 "YYYY-MM-DD" 키(로컬 기준)를 반환한다. */
export function getTodayDateKey(): string {
  return formatDateKey();
}
