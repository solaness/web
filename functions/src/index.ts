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
// src/api/tourApi.ts의 REQUEST_TIMEOUT_MS와 동일하게 맞춘다.
const UPSTREAM_TIMEOUT_MS = 15_000;

// 클라이언트(src/api/tourApi.ts)가 실제로 쓰는 엔드포인트만 허용한다 — 화이트리스트가
// 없으면 이 함수가 임의 경로를 그대로 넘겨주는 오픈 프록시가 되어버린다.
const ALLOWED_ENDPOINTS = new Set([
  "areaBasedList2",
  "locationBasedList2",
  "searchKeyword2",
  "detailCommon2",
]);

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
// 할당량/비용이 스크립트 호출로 소진되는 것을 완화한다. 인스턴스가 여러 개로
// 스케일되면 한도가 인스턴스 수만큼 느슨해지는 근사치일 뿐이라, 더 강한 보장이
// 필요해지면 Firebase App Check 적용을 다음 단계로 고려한다.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
// 무한정 늘어나는 것만 방지하는 대략적인 상한 — 초과 시 통째로 비우지 않고
// 만료된(직전 윈도우보다도 오래된) 항목만 정리한다(evictStaleClients 참고).
const MAX_TRACKED_CLIENTS = 5_000;

interface RateLimitEntry {
  windowIndex: number;
  currCount: number;
  prevCount: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

/**
 * 우선 이미 만료된(직전 윈도우보다도 오래된) 항목만 골라 지운다 — 살아있는 클라이언트의
 * 카운트를 건드리지 않아서, requestCounts.clear() 방식과 달리 이걸 반복 유도해서
 * rate limit을 초기화시키는 공격이 통하지 않는다. 다만 서로 다른 클라이언트 키가
 * 현재/직전 윈도우 안에서 계속 쏟아지면(rate limit을 우회하려는 IP 스푸핑이든, 실제
 * 대량 트래픽이든) 이 정리만으론 하나도 안 지워질 수 있으므로, 그래도 상한을 넘는
 * 만큼은 가장 오래 전에 추가된 항목부터 강제로 비워서 메모리 증가를 무조건 막는다.
 * @param {number} currentWindowIndex 지금 시각이 속한 윈도우 인덱스.
 * @return {void}
 */
function evictStaleClients(currentWindowIndex: number): void {
  for (const [key, entry] of requestCounts) {
    if (entry.windowIndex < currentWindowIndex - 1) {
      requestCounts.delete(key);
    }
  }

  while (requestCounts.size >= MAX_TRACKED_CLIENTS) {
    const oldestKey = requestCounts.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    requestCounts.delete(oldestKey);
  }
}

/**
 * 클라이언트가 현재 창(window) 근처에서 허용치를 넘겼는지, 카운터 두 개(현재/직전 윈도우)를
 * 가중 합산하는 sliding window counter 근사법으로 본다 — 단순 tumbling window와 달리
 * 윈도우 경계를 걸친 순간적 버스트로 한도의 최대 2배까지 새는 걸 막는다.
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
  requestCounts.set(clientKey, entry);

  if (requestCounts.size >= MAX_TRACKED_CLIENTS) {
    evictStaleClients(windowIndex);
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
 */
export const tourApiProxy = onRequest(
  {secrets: [tourApiServiceKey], cors: false},
  async (req, res) => {
    if (isRateLimited(resolveClientKey(req.headers, req.ip))) {
      res.status(429).json({
        resultCode: "429",
        resultMsg: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }

    // Hosting rewrite(배포)는 "/api/tour/areaBasedList2" 전체 경로를 그대로 넘기고,
    // 로컬 emulator 직결(vite.config.ts)은 접두사가 벗겨진 "/areaBasedList2"를 넘긴다 —
    // 두 경우 다 대응하기 위해 프록시 경로 접두사와 무관하게 마지막 세그먼트만 엔드포인트로 본다.
    const segments = req.path.split("/").filter(Boolean);
    const endpoint = segments[segments.length - 1] ?? "";

    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      res.status(404).json({
        resultCode: "NOT_FOUND",
        resultMsg: `Unknown TourAPI endpoint: ${endpoint}`,
      });
      return;
    }

    const params = new URLSearchParams();
    for (const [key, rawValue] of Object.entries(req.query)) {
      const value = toSingleQueryValue(rawValue);
      if (value !== undefined) {
        params.set(key, value);
      }
    }
    // 클라이언트는 더 이상 serviceKey를 보내지 않지만, 혹시 들어와도 서버 시크릿으로 덮어써서
    // 클라이언트가 자기 키를 실어보내는 경로 자체를 원천 차단한다.
    params.set("serviceKey", normalizeServiceKey(tourApiServiceKey.value()));

    const upstreamUrl = `${TOUR_API_BASE_URL}/${endpoint}?${params.toString()}`;

    try {
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

      logger.error("tourApiProxy upstream request failed", error);
      res.status(isTimeout ? 504 : 502).json({
        resultCode: isTimeout ? "504" : "502",
        resultMsg: isTimeout ?
          "TourAPI 응답이 지연되고 있습니다." :
          "TourAPI 요청에 실패했습니다.",
      });
    }
  },
);
