/** 오늘 날짜를 visitRecords의 `date` 필드와 같은 "YYYY-MM-DD" 형식(로컬 기준)으로 반환한다. */
export function getTodayDateKey(): string {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}
