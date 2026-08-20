import { CATEGORY_FILTERS } from "../constants/categoryFilters";
import type { Place, PlaceCategoryCode } from "../types/place";
import { mapTourItemToPlace } from "./tourPlaceMapper";
import type { TourApiEnvelope, TourApiRawItem } from "./tourApi.types";

// Vite dev 프록시 경유 경로 (vite.config.ts의 server.proxy 참고).
// TODO(prod-proxy): 배포 시 Firebase Cloud Functions 프록시로 교체할 때 이 상수만 바꾸면 되게 한다.
const BASE_PATH = "/api/tour";

const MOBILE_OS = "ETC";
const MOBILE_APP = "Solaness";
const DEFAULT_NUM_OF_ROWS = 20;
const RESULT_CODE_SUCCESS = "0000";

export class TourApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TourApiError";
    this.code = code;
  }
}

function getServiceKey(): string {
  const rawKey = import.meta.env.VITE_TOUR_API_KEY ?? "";

  if (!rawKey) {
    return "";
  }

  try {
    // data.go.kr이 발급하는 키는 이미 URL-encode된 상태라, 그대로 URLSearchParams에 넣으면
    // 요청 시점에 한 번 더 인코딩되어 인증에 실패한다(scripts/build-regions.mjs와 동일한 함정).
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

interface CommonParamsOptions {
  pageNo?: number;
  numOfRows?: number;
}

function buildCommonParams({
  pageNo = 1,
  numOfRows = DEFAULT_NUM_OF_ROWS,
}: CommonParamsOptions): URLSearchParams {
  const params = new URLSearchParams();

  params.set("serviceKey", getServiceKey());
  params.set("MobileOS", MOBILE_OS);
  params.set("MobileApp", MOBILE_APP);
  params.set("_type", "json");
  params.set("pageNo", String(pageNo));
  params.set("numOfRows", String(numOfRows));

  return params;
}

function applyCategoryFilter(
  params: URLSearchParams,
  category: PlaceCategoryCode,
): void {
  const filter = CATEGORY_FILTERS[category];

  if (filter.contentTypeId) {
    params.set("contentTypeId", filter.contentTypeId);
  }
  if (filter.cat1) {
    params.set("cat1", filter.cat1);
  }
  if (filter.cat2) {
    params.set("cat2", filter.cat2);
  }
}

interface TourListResult {
  places: Place[];
  totalCount: number;
}

/**
 * cat2가 아직 정확히 안 채워진 카테고리(산림/바다, 카페)는 요청에 cat1까지만 실리므로,
 * 서버가 완벽하게 걸러주지 못했을 가능성을 대비해 응답 원본 item의 cat1으로 한 번 더 확인한다.
 * cat1이 지정 안 된 필터(전체, 체험/쇼핑처럼 겹칠 상대가 없는 카테고리)는 그대로 통과시킨다.
 */
function matchesCategoryFilter(
  item: TourApiRawItem,
  category: PlaceCategoryCode,
): boolean {
  const filter = CATEGORY_FILTERS[category];

  if (!filter.cat1) {
    return true;
  }

  return item.cat1 === filter.cat1;
}

async function requestTourList(
  endpoint: string,
  params: URLSearchParams,
  category: PlaceCategoryCode,
  signal?: AbortSignal,
): Promise<TourListResult> {
  const response = await fetch(`${BASE_PATH}/${endpoint}?${params.toString()}`, {
    signal,
  });

  // serviceKey가 비어있거나 잘못됐을 때는 HTTP 자체가 401 등으로 오면서
  // 본문이 우리가 기대하는 JSON envelope가 아닐 수 있다(정상 인증 실패는 HTTP 200 + resultCode 에러로 오지만,
  // 그보다 앞단인 게이트웨이 레벨 인증 실패는 HTTP 에러 상태 + JSON이 아닌 본문으로 오는 경우가 있다).
  let envelope: TourApiEnvelope<TourApiRawItem> | null = null;
  try {
    envelope = (await response.json()) as TourApiEnvelope<TourApiRawItem>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope?.response) {
    throw new TourApiError(
      String(response.status),
      `API 요청 실패 (HTTP ${response.status})`,
    );
  }

  const { header, body } = envelope.response;

  // response.ok만으로는 부족하다 — 인증 실패도 HTTP 200 + resultCode 에러로 오는 경우가 있다.
  if (header.resultCode !== RESULT_CODE_SUCCESS) {
    throw new TourApiError(header.resultCode, header.resultMsg);
  }

  if (body.items === "") {
    return { places: [], totalCount: 0 };
  }

  const rawItems = Array.isArray(body.items.item)
    ? body.items.item
    : [body.items.item];

  const places = rawItems
    .filter((item): item is TourApiRawItem => Boolean(item))
    .filter((item) => matchesCategoryFilter(item, category))
    .map((item) => mapTourItemToPlace(item, category));

  return { places, totalCount: body.totalCount };
}

interface AreaBasedListOptions extends CommonParamsOptions {
  category: PlaceCategoryCode;
  signal?: AbortSignal;
}

export async function areaBasedList({
  category,
  signal,
  ...pagingOptions
}: AreaBasedListOptions): Promise<TourListResult> {
  const params = buildCommonParams(pagingOptions);
  params.set("arrange", "Q"); // 조회순 정렬

  applyCategoryFilter(params, category);

  return requestTourList("areaBasedList2", params, category, signal);
}

interface SearchKeywordOptions extends CommonParamsOptions {
  keyword: string;
  category: PlaceCategoryCode;
  signal?: AbortSignal;
}

export async function searchKeyword({
  keyword,
  category,
  signal,
  ...pagingOptions
}: SearchKeywordOptions): Promise<TourListResult> {
  const params = buildCommonParams(pagingOptions);
  params.set("keyword", keyword);

  applyCategoryFilter(params, category);

  return requestTourList("searchKeyword2", params, category, signal);
}
