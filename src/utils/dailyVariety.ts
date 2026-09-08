/**
 * 지도 "카테고리 추천 장소"가 항상 TourAPI 조회순(인기순) TOP 50만 그대로 보여주면
 * 재방문해도 매번 같은 리스트·같은 순서라 "추천"이라기보단 "랭킹판"에 가까워 보인다.
 *
 * 그렇다고 매번 완전 무작위로 섞으면 새로고침할 때마다 리스트가 휙휙 바뀌어 버려서
 * 오히려 이상해 보인다 — 그래서 "오늘 날짜"를 시드로 쓴 결정적 셔플을 쓴다.
 * 같은 날 안에는 몇 번을 다시 들어와도 같은 결과가 나오고, 자정이 지나면 자연스럽게 바뀐다.
 *
 * 셔플만 하면 매번 "TOP 50" 안에서만 순서가 바뀌는 거라 장소 자체는 똑같으므로,
 * 조회할 pageNo도 날짜 기준으로 poolSize개 페이지 안에서 순환시켜 실제로 다른
 * 장소 풀(TOP 1~50, 51~100, ...)이 노출되게 한다.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDayOfYear(date: Date): number {
  const startOfYear = Date.UTC(date.getFullYear(), 0, 1);
  const startOfDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.floor((startOfDay - startOfYear) / MS_PER_DAY);
}

/** 오늘 날짜를 YYYYMMDD 형태의 정수 시드로 변환한다. */
export function getTodaySeed(date: Date = new Date()): number {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  return yyyy * 10000 + mm * 100 + dd;
}

/** 오늘 날짜 기준으로 1..poolSize 범위의 pageNo를 순환시킨다. */
export function getDailyPageNo(poolSize: number, date: Date = new Date()): number {
  return (getDayOfYear(date) % poolSize) + 1;
}

/**
 * seed로 초기화하는 결정적 의사난수 생성기(Mulberry32). 같은 seed면 항상 같은 수열을 낸다.
 */
function mulberry32(seed: number): () => number {
  let a = seed;

  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * seed로 배열을 결정적으로 섞은 새 배열을 반환한다(Fisher–Yates). 원본 배열은 건드리지 않는다.
 */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
