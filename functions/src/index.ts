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

// 클라이언트(src/api/tourApi.ts)가 실제로 쓰는 엔드포인트만 허용한다 — 화이트리스트가
// 없으면 이 함수가 임의 경로를 그대로 넘겨주는 오픈 프록시가 되어버린다.
const ALLOWED_ENDPOINTS = new Set([
  "areaBasedList2",
  "locationBasedList2",
  "searchKeyword2",
  "detailCommon2",
]);

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

    const params = new URLSearchParams(req.query as Record<string, string>);
    // 클라이언트는 더 이상 serviceKey를 보내지 않지만, 혹시 들어와도 서버 시크릿으로 덮어써서
    // 클라이언트가 자기 키를 실어보내는 경로 자체를 원천 차단한다.
    params.set("serviceKey", tourApiServiceKey.value());

    const upstreamUrl = `${TOUR_API_BASE_URL}/${endpoint}?${params.toString()}`;

    try {
      const upstreamResponse = await fetch(upstreamUrl);
      const body = await upstreamResponse.text();

      res
        .status(upstreamResponse.status)
        .set(
          "Content-Type",
          upstreamResponse.headers.get("content-type") ?? "application/json",
        )
        .send(body);
    } catch (error) {
      logger.error("tourApiProxy upstream request failed", error);
      res.status(502).json({
        resultCode: "502",
        resultMsg: "TourAPI 요청에 실패했습니다.",
      });
    }
  },
);
