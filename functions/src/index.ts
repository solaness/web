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

// 이 함수는 Hosting rewrite로만 노출할 의도지만, 배포되면 Cloud Functions URL 자체는
// 별도 인증 없이 직접 호출도 가능하다 — 화이트리스트는 임의 경로로 새는 것만 막을 뿐,
// 허용된 엔드포인트를 대량 호출하는 것까진 못 막는다. 인스턴스 단위 in-memory
// 슬라이딩 윈도우로 클라이언트(IP)당 요청 수를 거칠게라도 제한해 TourAPI 일일
// 할당량/비용이 스크립트 호출로 소진되는 것을 완화한다. 인스턴스가 여러 개로
// 스케일되면 한도가 인스턴스 수만큼 느슨해지는 근사치일 뿐이라, 더 강한 보장이
// 필요해지면 Firebase App Check 적용을 다음 단계로 고려한다.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
// 무한정 늘어나는 것만 방지하는 대략적인 상한.
const MAX_TRACKED_CLIENTS = 5_000;
const requestCounts = new Map<string, { count: number; windowStart: number }>();

/**
 * 클라이언트(IP)가 현재 슬라이딩 윈도우 안에서 허용치를 넘겼는지 본다.
 * @param {string} clientKey 요청자를 구분하는 키(IP 등).
 * @return {boolean} 제한에 걸리면 true.
 */
function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(clientKey);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    if (requestCounts.size >= MAX_TRACKED_CLIENTS) {
      requestCounts.clear();
    }
    requestCounts.set(clientKey, {count: 1, windowStart: now});
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
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
 */
export const tourApiProxy = onRequest(
  {secrets: [tourApiServiceKey], cors: true},
  async (req, res) => {
    if (isRateLimited(req.ip ?? "unknown")) {
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
