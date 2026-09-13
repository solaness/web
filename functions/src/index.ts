/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2/options";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
// rate limit 카운터를 인스턴스 로컬 메모리가 아니라 Firestore에 두어, 인스턴스 재시작이나
// 스케일아웃으로 인스턴스가 여러 개 떠도 같은 클라이언트가 하나의 카운터를 공유하게 한다.
const db = admin.firestore();

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

interface NumericParamRule {
  key: string;
  min: number;
  max: number;
}

// 요청 수 rate limit은 "몇 번 불렀는지"만 세지 "한 번에 얼마나 많은/이상한 데이터를
// 요구했는지"는 안 본다 — numOfRows=-1, pageNo=0, radius=1.5 같은 값을 그대로 업스트림에
// 넘기면 불필요한 TourAPI 에러 호출로 할당량과 rate limit만 낭비된다. 그렇다고 최솟값
// 미달/정수가 아닌 값까지 조용히 지우거나 clamp해버리면 호출부의 실수를 감춰버리므로,
// 이 값들은 clamp 대신 400으로 바로 거절한다. 최댓값 초과만 TourAPI 기본 상한 보호
// 목적으로 clamp를 유지한다(넘겼다고 굳이 요청을 실패시킬 이유는 없다).
const NUMERIC_PARAM_RULES: NumericParamRule[] = [
  {key: "numOfRows", min: 1, max: MAX_NUM_OF_ROWS},
  {key: "pageNo", min: 1, max: MAX_PAGE_NO},
  {key: "radius", min: 1, max: MAX_RADIUS_METERS},
];

/**
 * 숫자 파라미터 하나를 검사해 양의 정수 + 최솟값 조건을 강제하고, 유효하면 항상
 * 정규화된(예: "007" → "7") 값으로 다시 써넣으며 최댓값을 넘는 경우는 clamp한다.
 * 파라미터 자체가 없는 경우는 TourAPI 기본값을 쓰도록 그대로 둔다(에러 아님).
 * @param {URLSearchParams} params 업스트림으로 보낼 파라미터(유효하면 항상 제자리에서 정규화).
 * @param {NumericParamRule} rule 검사할 파라미터 이름과 허용 범위.
 * @return {string | undefined} 유효하지 않으면 사용자에게 보여줄 에러 메시지, 유효하면 undefined.
 */
function validateNumericParam(
  params: URLSearchParams,
  rule: NumericParamRule,
): string | undefined {
  const raw = params.get(rule.key);
  if (raw === null) {
    return undefined;
  }

  // 양의 정수(선행 0 포함, 부호/소수점 없음)만 허용 — Number()는 "1e2", "0x10", " 1"
  // 같은 값도 통과시켜버려서 정수 검증에 쓰기엔 느슨하다.
  if (!/^\d+$/.test(raw)) {
    return `${rule.key}는 ${rule.min} 이상의 정수여야 합니다.`;
  }

  const parsed = Number(raw);
  if (parsed < rule.min) {
    return `${rule.key}는 ${rule.min} 이상의 정수여야 합니다.`;
  }

  params.set(rule.key, String(Math.min(parsed, rule.max)));

  return undefined;
}

// Google Cloud의 HTTPS 로드밸런서(Hosting/Cloud Functions v2가 모두 그 뒤에 있다)는
// 들어온 X-Forwarded-For 뒤에 정확히 두 값, "<클라이언트 IP>, <로드밸런서 자체 IP>"만
// 덧붙인다 — 맨 뒤 값은 클라이언트가 아니라 로드밸런서 자신의 IP라서 모든 요청에 동일하게
// 찍히므로, 맨 뒤에서 이 값만큼 앞으로 간 위치(뒤에서 두 번째)가 실제 클라이언트 IP다.
// https://cloud.google.com/load-balancing/docs/https#x-forwarded-for_header
const GOOGLE_LB_APPENDED_HOPS = 2;

/**
 * Firebase Hosting rewrite를 거치면 req.ip가 Express의 trust proxy 설정에 기대게 되어
 * 프록시 홉 뒤에서 모든 요청이 같은 IP로 뭉뚱그려질 위험이 있다 — 그 설정에 기대는 대신
 * X-Forwarded-For를 직접 읽는다. 맨 앞 값들은 클라이언트가 그대로 조작해서 보낼 수 있는
 * 입력이라(로드밸런서는 기존 값을 지우지 않고 뒤에 자기 홉만 덧붙인다) 신뢰할 수 없고,
 * 맨 뒤 값도 클라이언트가 아니라 로드밸런서 자신의 IP라 신뢰할 수 없다 — 뒤에서
 * GOOGLE_LB_APPENDED_HOPS번째(= 두 번째) 값만 로드밸런서가 실제로 확인한 클라이언트
 * IP이므로 그 값만 rate limit 키로 신뢰한다.
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
  const hops = forwardedValue?.split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  const trustedIp = hops && hops.length >= GOOGLE_LB_APPENDED_HOPS ?
    hops[hops.length - GOOGLE_LB_APPENDED_HOPS] :
    undefined;

  return trustedIp || fallbackIp || "unknown";
}

// 이 함수는 Hosting rewrite로만 노출할 의도지만, 배포되면 Cloud Functions URL 자체는
// 별도 인증 없이 직접 호출도 가능하다 — 화이트리스트는 임의 경로로 새는 것만 막을 뿐,
// 허용된 엔드포인트를 대량 호출하는 것까진 못 막는다. Firestore에 클라이언트(IP)별
// 카운터를 두고 요청 수를 제한해 TourAPI 일일 할당량/비용이 스크립트 호출로 소진되는
// 것을 완화한다. 인스턴스 로컬 메모리가 아니라 Firestore에 두는 이유는, 인메모리
// 카운터는 인스턴스가 재시작되거나(배포, 크래시) maxInstances만큼 스케일아웃되면
// 그만큼 한도가 초기화·분산되어 실질적으로 무력화되기 때문이다 — Firestore 트랜잭션으로
// 모든 인스턴스가 같은 카운터를 공유해야 이 제한이 실제로 의미를 가진다. 이 제한은
// 어디까지나 TourAPI 할당량 소진을 늦추는 비용 방어용이라, 진짜 요청자 인증이
// 필요해지면 Firebase App Check 적용을 다음 단계로 고려한다.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_COLLECTION = "tourApiProxyRateLimits";
// 카운터 문서가 무한정 쌓이는 것을 막기 위한 TTL(ms) — Firestore 콘솔/gcloud에서
// 이 필드(expiresAt) 기준 TTL 정책을 별도로 등록해야 실제로 자동 삭제된다(계정 설정이라
// 이 PR 범위 밖). 정책을 등록하지 않아도 동작 자체(제한 판단)에는 영향이 없다.
const RATE_LIMIT_ENTRY_TTL_MS = RATE_LIMIT_WINDOW_MS * 2;

interface RateLimitEntry {
  windowIndex: number;
  currCount: number;
  prevCount: number;
}

/**
 * 클라이언트가 현재 창(window) 근처에서 허용치를 넘겼는지, 카운터 두 개(현재/직전 윈도우)를
 * 가중 합산하는 sliding window counter 근사법으로 본다 — 단순 tumbling window와 달리
 * 윈도우 경계를 걸친 순간적 버스트로 한도의 최대 2배까지 새는 걸 막는다.
 *
 * 카운터를 Firestore 트랜잭션(읽고-계산하고-쓰기)으로 갱신해 여러 인스턴스가 동시에
 * 같은 클라이언트의 요청을 처리해도 카운트가 유실되지 않게 한다. Firestore 자체
 * 장애/지연으로 트랜잭션이 실패하면 이 제한 기능 하나 때문에 프록시 전체가 죽지 않도록
 * fail-open(제한 안 걸린 것으로 간주)하고 에러만 로깅한다.
 * @param {string} clientKey 요청자를 구분하는 키(IP 등).
 * @return {Promise<boolean>} 제한에 걸리면 true.
 */
async function isRateLimited(clientKey: string): Promise<boolean> {
  const now = Date.now();
  const windowIndex = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const elapsedRatio = (now % RATE_LIMIT_WINDOW_MS) / RATE_LIMIT_WINDOW_MS;
  // Firestore 문서 id는 "/"를 쓸 수 없다 — IPv6 주소의 ":"는 허용되지만, 혹시 모를
  // 예외 문자까지 안전하게 다루기 위해 encodeURIComponent로 한 번 감싼다.
  const docRef = db
    .collection(RATE_LIMIT_COLLECTION)
    .doc(encodeURIComponent(clientKey));

  try {
    const estimatedCount = await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(docRef);
      const existing = snapshot.data() as RateLimitEntry | undefined;

      let entry: RateLimitEntry;
      if (!existing || existing.windowIndex < windowIndex - 1) {
        entry = {windowIndex, currCount: 0, prevCount: 0};
      } else if (existing.windowIndex === windowIndex - 1) {
        entry = {windowIndex, currCount: 0, prevCount: existing.currCount};
      } else {
        entry = existing;
      }

      entry.currCount += 1;

      tx.set(docRef, {
        ...entry,
        expiresAt: admin.firestore.Timestamp.fromMillis(
          now + RATE_LIMIT_ENTRY_TTL_MS,
        ),
      });

      return entry.prevCount * (1 - elapsedRatio) + entry.currCount;
    });

    return estimatedCount > RATE_LIMIT_MAX_REQUESTS;
  } catch (error) {
    logger.error("rate limit check failed, failing open", error);
    return false;
  }
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
 * maxInstances를 전역 기본값(10)보다 낮춰서, rate limit이 과도하게 많은 인스턴스로
 * 흩어지는 것을 줄인다(Firestore 기반이라 인스턴스 수와 무관하게 정확하지만, 낮춰서
 * 얻는 이점은 여전히 유효하다 — 동시 Firestore 트랜잭션 경합/비용을 줄인다).
 */
export const tourApiProxy = onRequest(
  {secrets: [tourApiServiceKey], cors: false, maxInstances: 3},
  async (req, res) => {
    // 읽기 전용 프록시라 GET만 허용한다 — Hosting rewrite는 POST/PUT/DELETE 등도
    // 그대로 이 함수로 넘기므로, 다른 메서드는 아무 처리도 하기 전에 바로 거절한다.
    if (req.method !== "GET") {
      res.set("Allow", "GET").status(405).json({
        resultCode: "405",
        resultMsg: `허용되지 않는 메서드입니다: ${req.method}`,
      });
      return;
    }

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

    if (await isRateLimited(resolveClientKey(req.headers, req.ip))) {
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

      // 파라미터 하나라도 유효하지 않으면(음수/0/소수 등) 업스트림을 호출하지 않고
      // 바로 400으로 거절한다 — 불필요한 TourAPI 에러 호출로 할당량/rate limit을
      // 낭비하지 않기 위해서다.
      const validationErrors = NUMERIC_PARAM_RULES
        .map((rule) => validateNumericParam(params, rule))
        .filter((message): message is string => message !== undefined);
      if (validationErrors.length > 0) {
        res.status(400).json({
          resultCode: "400",
          resultMsg: validationErrors.join(" "),
        });
        return;
      }
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
