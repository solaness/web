/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// region은 Firestore(asia-northeast3)와 맞춰서 같은 리전 안에서 오가게 한다.
setGlobalOptions({maxInstances: 10, region: "asia-northeast3"});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const tourApiServiceKey = defineSecret("TOUR_API_SERVICE_KEY");

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
// 클라이언트(src/api/tourApi.ts)의 REQUEST_TIMEOUT_MS(15초)보다 일부러 짧게 잡는다 —
// 값이 같거나 더 길면 클라이언트가 먼저 포기하고 재시도해버려서, 이 함수가 만들어주는
// 504 응답을 아무도 못 받고 업스트림 호출만 방치된 채로 계속 TourAPI 할당량을 쓰게 된다.
// 여유를 두면 클라이언트가 포기하기 전에 이 함수가 먼저 정리하고 응답할 수 있다.
const UPSTREAM_TIMEOUT_MS = 12_000;

// 클라이언트(src/api/tourApi.ts)가 실제로 쓰는 엔드포인트만 허용한다 — 화이트리스트가
// 없으면 이 함수가 임의 경로를 그대로 넘겨주는 오픈 프록시가 되어버린다.
const ALLOWED_ENDPOINTS = new Set([
  "areaBasedList2",
  "locationBasedList2",
  "searchKeyword2",
  "detailCommon2",
]);

// 클라이언트가 실제로 요청하는 최댓값(RECOMMENDATION_FETCH_SIZE=30 등)보다 넉넉하지만,
// 요청 수 rate limit만으론 못 막는 "한 요청에 과도하게 많은 데이터를 요구"하는 것까지
// 막기 위한 상한. 이 값을 넘겨 보내면 TourAPI 기본값을 쓰도록 아예 파라미터를 지운다.
const MAX_NUM_OF_ROWS = 100;
const MAX_PAGE_NO = 1_000;
// 클라이언트가 실제로 쓰는 최댓값(NEARBY_RADIUS_METERS=10km)보다 넉넉한 상한.
const MAX_RADIUS_METERS = 50_000;

/**
 * data.go.kr이 발급하는 키는 이미 URL-encode된 상태라, 그대로 URLSearchParams에 넣으면
 * 요청 시점에 한 번 더 인코딩되어 인증에 실패한다 — scripts/build-regions.mjs,
 * scripts/inspect-tour-categories.mjs와 동일한 함정이라 여기서도 같은 디코딩을 거친다.
 * @param {string} rawKey Secret Manager에서 꺼낸 원본(인코딩됐을 수 있는) 키.
 * @return {string} TourAPI 요청에 바로 쓸 수 있게 디코딩한 키.
 */
function normalizeServiceKey(rawKey: string): string {
  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

/**
 * Express가 파싱한 req.query 값은 중복 파라미터가 오면 string[]/객체가 될 수 있어
 * URLSearchParams에 그대로 넘기면 "a,b" 같은 값으로 뭉개진다. 여기서 쓰는 파라미터는
 * 전부 단일 문자열이어야 정상이므로, 문자열이 아니면(중복/중첩) 첫 값만 취하고
 * 그마저 문자열이 아니면 버린다.
 * @param {unknown} value req.query에서 꺼낸 원시 값(string | string[] | object 등).
 * @return {string | undefined} 단일 문자열로 정리된 값, 없으면 undefined.
 */
function toSingleQueryValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return undefined;
}

/**
 * 요청 수 rate limit은 "몇 번 불렀는지"만 세지 "한 번에 얼마나 많은 데이터를
 * 요구했는지"는 안 본다 — numOfRows 같은 값을 비정상적으로 크게 보내면 허용 범위
 * 안에서도 TourAPI 응답 크기/비용이 커질 수 있어, 숫자 파라미터를 상한으로 clamp한다.
 * @param {URLSearchParams} params 업스트림으로 보낼 파라미터(제자리에서 수정).
 * @param {string} key clamp할 파라미터 이름.
 * @param {number} max 허용할 최댓값.
 * @return {void}
 */
function clampNumericParam(
  params: URLSearchParams,
  key: string,
  max: number,
): void {
  const raw = params.get(key);
  if (raw === null) {
    return;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    // 숫자가 아닌 값은 TourAPI가 자체 기본값/에러 처리를 하도록 아예 지운다.
    params.delete(key);
    return;
  }

  if (parsed > max) {
    params.set(key, String(max));
  }
}

/**
 * Firebase Hosting rewrite를 거치면 req.ip가 Express의 trust proxy 설정에 기대게 되어
 * 프록시 홉 뒤에서 모든 요청이 같은 IP로 뭉뚱그려질 위험이 있다 — 그 설정에 기대는 대신
 * X-Forwarded-For를 직접 읽는다. 단, 맨 앞 값은 클라이언트가 그대로 조작해서 보낼 수
 * 있는 입력이라(프록시는 기존 값을 지우지 않고 뒤에 자기 홉만 덧붙인다) 신뢰할 수 없다 —
 * Google 인프라(Hosting/Cloud Run)가 실제로 연결을 받은 피어를 확인해 마지막에
 * 붙여주는 맨 뒤 값만 rate limit 키로 신뢰한다.
 * @param {Record<string, string | string[] | undefined>} headers req.headers.
 * @param {string | undefined} fallbackIp req.ip (X-Forwarded-For가 없을 때 대체용).
 * @return {string} rate limit 버킷 키로 쓸 클라이언트 식별자.
 */
function resolveClientKey(
  headers: Record<string, string | string[] | undefined>,
  fallbackIp: string | undefined,
): string {
  const forwardedFor = headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwardedFor) ?
    forwardedFor[forwardedFor.length - 1] :
    forwardedFor;
  const hops = forwardedValue?.split(",").map((hop) => hop.trim());
  const trustedIp = hops?.[hops.length - 1];

  return trustedIp || fallbackIp || "unknown";
}

// 이 함수는 Hosting rewrite로만 노출할 의도지만, 배포되면 Cloud Functions URL 자체는
// 별도 인증 없이 직접 호출도 가능하다 — 화이트리스트는 임의 경로로 새는 것만 막을 뿐,
// 허용된 엔드포인트를 대량 호출하는 것까진 못 막는다. 인스턴스 단위 in-memory
// 슬라이딩 윈도우(근사치)로 클라이언트(IP)당 요청 수를 거칠게라도 제한해 TourAPI 일일
// 할당량/비용이 스크립트 호출로 소진되는 것을 완화한다. 인스턴스별로 따로 세기 때문에
// 실제 한도는 이 함수의 maxInstances(아래 tourApiProxy 옵션 참고) 배수만큼 느슨해지는
// 근사치일 뿐이라, 더 강한 보장이 필요해지면 Firebase App Check 적용을 다음 단계로 고려한다.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
// 무한정 늘어나는 것만 방지하는 대략적인 상한 — 초과분은 가장 오래 안 쓰인(LRU) 항목부터 비운다.
const MAX_TRACKED_CLIENTS = 5_000;

interface RateLimitEntry {
  windowIndex: number;
  currCount: number;
  prevCount: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

/**
 * 클라이언트가 현재 창(window) 근처에서 허용치를 넘겼는지, 카운터 두 개(현재/직전 윈도우)를
 * 가중 합산하는 sliding window counter 근사법으로 본다 — 단순 tumbling window와 달리
 * 윈도우 경계를 걸친 순간적 버스트로 한도의 최대 2배까지 새는 걸 막는다.
 *
 * requestCounts가 MAX_TRACKED_CLIENTS를 넘으면 가장 오래 안 쓰인 항목부터 비운다 —
 * 기존 키라도 매번 delete 후 다시 set해서 Map의 삽입 순서를 "마지막 접근 순서"로
 * 유지하는 방식(JS Map은 이미 있는 키를 set()해도 순서를 안 옮긴다)으로, 맨 앞을
 * 지우는 것만으로 진짜 LRU eviction이 되게 한다 — 그냥 첫 삽입 순서로 지우면 활성
 * 클라이언트가 아직 안 끝난 윈도우 중간에 카운터를 초기화당해 한도를 우회하게 된다.
 * @param {string} clientKey 요청자를 구분하는 키(IP 등).
 * @return {boolean} 제한에 걸리면 true.
 */
function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const windowIndex = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const elapsedRatio = (now % RATE_LIMIT_WINDOW_MS) / RATE_LIMIT_WINDOW_MS;

  let entry = requestCounts.get(clientKey);

  if (!entry || entry.windowIndex < windowIndex - 1) {
    entry = {windowIndex, currCount: 0, prevCount: 0};
  } else if (entry.windowIndex === windowIndex - 1) {
    entry = {windowIndex, currCount: 0, prevCount: entry.currCount};
  }

  entry.currCount += 1;

  requestCounts.delete(clientKey);
  requestCounts.set(clientKey, entry);

  while (requestCounts.size > MAX_TRACKED_CLIENTS) {
    const oldestKey = requestCounts.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    requestCounts.delete(oldestKey);
  }

  const estimatedCount =
    entry.prevCount * (1 - elapsedRatio) + entry.currCount;

  return estimatedCount > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * 관광공사 TourAPI(KorService2) 프록시.
 *
 * 배포 환경에서는 Firebase Hosting이 "/api/tour/**" 요청을 이 함수로 rewrite한다
 * (firebase.json 참고) — 정적 호스팅이라 Vite dev proxy 같은 로컬 우회가 없으므로,
 * 같은 오리진으로 요청을 받아 서버 사이드에서만 보관하는 serviceKey를 붙여 TourAPI를
 * 대신 호출해준다. 로컬 개발도 firebase emulators로 이 함수를 그대로 띄우고
 * vite.config.ts가 거기로 프록시하므로, 로컬/배포가 동일한 코드 경로를 탄다
 * (클라이언트 번들에는 serviceKey가 전혀 들어가지 않는다).
 *
 * 정상 호출 경로 둘 다(배포: Hosting rewrite로 같은 오리진, 로컬: vite dev proxy가
 * 서버사이드에서 emulator를 호출) 브라우저 cross-origin 요청이 아니라서 CORS가
 * 필요 없다 — 굳이 열어두면 제3자 사이트가 브라우저에서 이 함수를 직접 호출해
 * TourAPI 할당량을 쓰는 경로만 하나 더 생기므로 명시적으로 꺼둔다(firebase-functions는
 * cors 옵션을 아예 생략하면 기본값이 true라, 생략이 아니라 false를 명시해야 한다).
 *
 * maxInstances를 전역 기본값(10)보다 낮춰서, 인스턴스별로 따로 도는 rate limit의
 * 실질 상한(위 RATE_LIMIT_MAX_REQUESTS 주석 참고)이 과도하게 느슨해지지 않게 한다.
 */
export const tourApiProxy = onRequest(
  {secrets: [tourApiServiceKey], cors: false, maxInstances: 3},
  async (req, res) => {
    // Hosting rewrite(배포)는 "/api/tour/areaBasedList2" 전체 경로를 그대로 넘기고,
    // 로컬 emulator 직결(vite.config.ts)은 접두사가 벗겨진 "/areaBasedList2"를 넘긴다 —
    // 두 경우 다 대응하기 위해 프록시 경로 접두사와 무관하게 마지막 세그먼트만 엔드포인트로 본다.
    const segments = req.path.split("/").filter(Boolean);
    const endpoint = segments[segments.length - 1] ?? "";

    // 화이트리스트 확인을 rate limit보다 먼저 한다 — 순서가 바뀌면 잘못된/오래된
    // 경로로 오는 무해한(또는 탐색성) 요청들이 정상 요청과 같은 카운터를 태워서,
    // 진짜 TourAPI 호출이 뜨기도 전에 그 클라이언트의 한도를 소진시켜버린다.
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      res.status(404).json({
        resultCode: "NOT_FOUND",
        resultMsg: `Unknown TourAPI endpoint: ${endpoint}`,
      });
      return;
    }

    if (isRateLimited(resolveClientKey(req.headers, req.ip))) {
      res.status(429).json({
        resultCode: "429",
        resultMsg: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }

    try {
      const params = new URLSearchParams();
      for (const [key, rawValue] of Object.entries(req.query)) {
        const value = toSingleQueryValue(rawValue);
        if (value !== undefined) {
          params.set(key, value);
        }
      }
      clampNumericParam(params, "numOfRows", MAX_NUM_OF_ROWS);
      clampNumericParam(params, "pageNo", MAX_PAGE_NO);
      clampNumericParam(params, "radius", MAX_RADIUS_METERS);
      // 클라이언트는 더 이상 serviceKey를 보내지 않지만, 혹시 들어와도 서버 시크릿으로
      // 덮어써서 클라이언트가 자기 키를 실어보내는 경로 자체를 원천 차단한다. 이 값을
      // 읽다가 실패해도(시크릿 미설정 등) 아래 catch에서 다른 실패와 동일하게
      // {resultCode, resultMsg} 형태로 응답하도록 try 블록 안에 둔다.
      params.set("serviceKey", normalizeServiceKey(tourApiServiceKey.value()));

      const upstreamUrl =
        `${TOUR_API_BASE_URL}/${endpoint}?${params.toString()}`;

      const upstreamResponse = await fetch(upstreamUrl, {
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
      const body = await upstreamResponse.text();

      res
        .status(upstreamResponse.status)
        .set(
          "Content-Type",
          upstreamResponse.headers.get("content-type") ?? "application/json",
        )
        .send(body);
    } catch (error) {
      const isTimeout =
        error instanceof DOMException && error.name === "TimeoutError";

      logger.error("tourApiProxy request failed", error);
      res.status(isTimeout ? 504 : 502).json({
        resultCode: isTimeout ? "504" : "502",
        resultMsg: isTimeout ?
          "TourAPI 응답이 지연되고 있습니다." :
          "TourAPI 요청에 실패했습니다.",
      });
    }
  },
);
