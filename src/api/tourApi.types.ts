/**
 * 관광공사 TourAPI(KorService2) 원본 응답 타입.
 * 필드명이 소문자(addr1, mapx, contentid ...)인 게 특징 — 앱 도메인 타입인
 * `Place`(src/types/place.ts)로는 tourPlaceMapper.ts를 거쳐서 변환한다.
 */
export interface TourApiRawItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: string;
  mapy?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  tel?: string;
}

interface TourApiHeader {
  resultCode: string;
  resultMsg: string;
}

/**
 * 결과가 0건이면 items가 빈 문자열("")로 오고,
 * 1건이면 item이 배열이 아닌 단일 객체로 온다 — TourAPI의 잘 알려진 특이 케이스.
 * requestTourList()에서 이 두 경우를 모두 정규화해서 처리한다.
 */
interface TourApiBody<T> {
  items: "" | { item: T | T[] };
  numOfRows: number;
  pageNo: number;
  totalCount: number;
}

export interface TourApiEnvelope<T> {
  response: {
    header: TourApiHeader;
    body: TourApiBody<T>;
  };
}

/** detailCommon2(상세 조회) 응답 항목 — 목록 조회 항목에 소개글/홈페이지 링크가 추가된다. */
export interface TourApiDetailRawItem extends TourApiRawItem {
  /** 소개 문구. 값이 없는 장소도 있다. */
  overview?: string;
  /** `<a href="...">...</a>` 형태의 HTML 문자열로 온다 — href만 추출해서 써야 한다. */
  homepage?: string;
}

/** categoryCode2 응답 항목 (cat1/cat2 코드 조회용, scripts/inspect-tour-categories.mjs에서 사용) */
export interface TourApiCategoryCodeItem {
  code: string;
  name: string;
}
