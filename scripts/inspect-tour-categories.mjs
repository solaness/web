import process from "node:process";

/**
 * 관광공사 TourAPI(KorService2)의 categoryCode2로 cat1(대분류)별 cat2(중분류) 목록을 조회해서 출력한다.
 * src/constants/categoryFilters.ts의 cat2 TODO를 채우기 위한 1회성 조회용 스크립트.
 *
 * 사용법: npm run tour:categories
 * (.env의 VITE_TOUR_API_KEY를 그대로 사용 — 브라우저와 동일한 인코딩 함정이 있어
 *  scripts/build-regions.mjs와 동일하게 디코딩해서 사용한다)
 */

const RAW_SERVICE_KEY = process.env.VITE_TOUR_API_KEY?.trim() ?? "";

function normalizeServiceKey(serviceKey) {
  if (!serviceKey) {
    return "";
  }

  try {
    return decodeURIComponent(serviceKey);
  } catch {
    return serviceKey;
  }
}

const SERVICE_KEY = normalizeServiceKey(RAW_SERVICE_KEY);

if (!SERVICE_KEY) {
  throw new Error(
    "VITE_TOUR_API_KEY가 없습니다. 프로젝트 루트의 .env를 확인해주세요.",
  );
}

const API_URL = "https://apis.data.go.kr/B551011/KorService2/categoryCode2";

// 우리 CATEGORIES가 쓰는 대분류만 조회한다 (산림·바다=A01, 체험=A03, 쇼핑=A04, 카페=A05).
const CAT1_CODES = ["A01", "A03", "A04", "A05"];

async function fetchCat2List(cat1) {
  const url = new URL(API_URL);

  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "Solaness");
  url.searchParams.set("_type", "json");
  url.searchParams.set("cat1", cat1);
  url.searchParams.set("numOfRows", "100");

  const response = await fetch(url);
  const text = await response.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`JSON이 아닌 응답입니다 (cat1=${cat1}):\n${text}`);
  }

  const { header, body } = json.response ?? {};

  if (header?.resultCode !== "0000") {
    throw new Error(
      `API 에러 (cat1=${cat1}): ${header?.resultCode} ${header?.resultMsg}`,
    );
  }

  if (body?.items === "") {
    return [];
  }

  const item = body?.items?.item;
  return Array.isArray(item) ? item : [item].filter(Boolean);
}

async function main() {
  for (const cat1 of CAT1_CODES) {
    console.log(`\n=== cat1=${cat1} ===`);

    const cat2List = await fetchCat2List(cat1);

    if (cat2List.length === 0) {
      console.log("  (결과 없음)");
      continue;
    }

    for (const { code, name } of cat2List) {
      console.log(`  ${code}  ${name}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
