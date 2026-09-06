import { CATEGORY_FILTERS } from "../constants/categoryFilters";
import type { Place, PlaceCategoryCode, PlaceDetail } from "../types/place";
import { mapTourItemToPlace } from "./tourPlaceMapper";
import type {
  TourApiDetailRawItem,
  TourApiEnvelope,
  TourApiRawItem,
} from "./tourApi.types";

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
 * TourAPI 목록 조회는 cat3를 단일 값으로만 받기 때문에(산림/바다, 카페처럼 cat3가 여러 개인
 * 카테고리는) 요청에는 cat1(+cat2)까지만 싣고, 응답을 받은 뒤 cat3In 목록으로 한 번 더 걸러낸다.
 * cat3In이 없는 필터(전체, 체험/쇼핑처럼 겹칠 상대가 없는 카테고리)는 cat1만 확인하거나 그대로 통과시킨다.
 */
function matchesCategoryFilter(
  item: TourApiRawItem,
  category: PlaceCategoryCode,
): boolean {
  const filter = CATEGORY_FILTERS[category];

  if (filter.cat3In) {
    return item.cat3 != null && filter.cat3In.includes(item.cat3);
  }

  if (!filter.cat1) {
    return true;
  }

  return item.cat1 === filter.cat1;
}

/**
 * 상세 조회는 카테고리를 모르는 채로 들어오므로(place id만 앎), cat1/cat3로
 * 역으로 어떤 CATEGORY_FILTERS에 해당하는지 찾는다(뱃지 표시용, 여러 개 매칭될 수 있음).
 * "all"은 필터 조건이 없어 모든 항목에 매칭돼버리므로 후보에서 제외한다.
 */
export function resolvePlaceCategories(item: TourApiRawItem): PlaceCategoryCode[] {
  return (Object.keys(CATEGORY_FILTERS) as PlaceCategoryCode[]).filter(
    (category) => category !== "all" && matchesCategoryFilter(item, category),
  );
}

/**
 * envelope 파싱 + 에러 처리 공통 로직. 목록/상세 조회가 모두 같은 envelope 모양을 쓴다.
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<TourApiEnvelope<T>["response"]> {
  const response = await fetch(`${BASE_PATH}/${endpoint}?${params.toString()}`, {
    signal,
  });

  // serviceKey가 비어있거나 잘못됐을 때는 HTTP 자체가 401 등으로 오면서
  // 본문이 우리가 기대하는 JSON envelope가 아닐 수 있다(정상 인증 실패는 HTTP 200 + resultCode 에러로 오지만,
  // 그보다 앞단인 게이트웨이 레벨 인증 실패는 HTTP 에러 상태 + JSON이 아닌 본문으로 오는 경우가 있다).
  let envelope: TourApiEnvelope<T> | null = null;
  let flatError: { resultCode: string; resultMsg: string } | null = null;
  try {
    const json = (await response.json()) as
      | TourApiEnvelope<T>
      | { resultCode: string; resultMsg: string };
    if ("response" in json) {
      envelope = json;
    } else {
      // 파라미터 자체가 잘못됐을 때(INVALID_REQUEST_PARAMETER_ERROR 등)는
      // response 래핑 없이 최상위에 resultCode/resultMsg가 바로 온다.
      flatError = json;
    }
  } catch {
    envelope = null;
  }

  if (flatError) {
    throw new TourApiError(flatError.resultCode, flatError.resultMsg);
  }

  if (!response.ok || !envelope?.response) {
    throw new TourApiError(
      String(response.status),
      `API 요청 실패 (HTTP ${response.status})`,
    );
  }

  const { header } = envelope.response;

  // response.ok만으로는 부족하다 — 인증 실패도 HTTP 200 + resultCode 에러로 오는 경우가 있다.
  if (header.resultCode !== RESULT_CODE_SUCCESS) {
    throw new TourApiError(header.resultCode, header.resultMsg);
  }

  return envelope.response;
}

async function requestTourList(
  endpoint: string,
  params: URLSearchParams,
  category: PlaceCategoryCode,
  signal?: AbortSignal,
): Promise<TourListResult> {
  const { body } = await fetchTourApi<TourApiRawItem>(endpoint, params, signal);

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

/**
 * homepage는 `<a href="...">...</a>` 형태의 HTML 문자열로 오므로 href만 뽑아 쓴다.
 * href 속성이 없으면(형식이 다르면) 태그만 제거한 텍스트를 대신 반환한다.
 */
function extractHomepageUrl(rawHomepage?: string): string {
  if (!rawHomepage) {
    return "";
  }

  const hrefMatch = rawHomepage.match(/href="([^"]+)"/);
  if (hrefMatch) {
    return hrefMatch[1];
  }

  return rawHomepage.replace(/<[^>]+>/g, "").trim();
}

interface PlaceDetailOptions {
  id: string;
  signal?: AbortSignal;
}

export async function getPlaceDetail({
  id,
  signal,
}: PlaceDetailOptions): Promise<PlaceDetail> {
  // detailCommon2는 defaultYN/overviewYN 같은 상세 옵션 플래그를 받지 않는다
  // (넘기면 INVALID_REQUEST_PARAMETER_ERROR) — overview 등은 플래그 없이도 기본 포함된다.
  const params = new URLSearchParams();
  params.set("serviceKey", getServiceKey());
  params.set("MobileOS", MOBILE_OS);
  params.set("MobileApp", MOBILE_APP);
  params.set("_type", "json");
  params.set("contentId", id);

  const { body } = await fetchTourApi<TourApiDetailRawItem>(
    "detailCommon2",
    params,
    signal,
  );

  if (body.items === "") {
    throw new TourApiError("NOT_FOUND", "장소를 찾을 수 없어요.");
  }

  const item = Array.isArray(body.items.item) ? body.items.item[0] : body.items.item;

  if (!item) {
    throw new TourApiError("NOT_FOUND", "장소를 찾을 수 없어요.");
  }

  const categories = resolvePlaceCategories(item);
  const place = mapTourItemToPlace(item, categories[0] ?? "all");

  return {
    ...place,
    categories,
    overview: item.overview?.trim() ?? "",
    homepageUrl: extractHomepageUrl(item.homepage),
    tel: item.tel?.trim() || undefined,
  };
}
