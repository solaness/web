import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const RAW_SERVICE_KEY =
  process.env.MOIS_SERVICE_KEY?.trim() ?? "";

function normalizeServiceKey(serviceKey) {
  if (!serviceKey) {
    return "";
  }

  try {
    // Encoding 인증키라면 디코딩합니다.
    // URLSearchParams가 요청 과정에서 한 번 다시 인코딩합니다.
    return decodeURIComponent(serviceKey);
  } catch {
    return serviceKey;
  }
}

const SERVICE_KEY =
  normalizeServiceKey(RAW_SERVICE_KEY);

const API_URL =
  "https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList";

const PAGE_SIZE = 1000;

const SEJONG_CODE = "3611000000";
const ROOT_CODE = "0000000000";

if (!SERVICE_KEY) {
  throw new Error(
    "MOIS_SERVICE_KEY가 없습니다. 프로젝트 루트의 .env를 확인해주세요.",
  );
}

/**
 * 행정안전부 API 응답에서 실제 지역 목록을 꺼냅니다.
 */
function getRows(response) {
  const container = response?.StanReginCd;

  if (!Array.isArray(container)) {
    throw new Error(
      `예상하지 못한 API 응답입니다.\n${JSON.stringify(response, null, 2)}`,
    );
  }

  const rowContainer = container.find((item) =>
    Array.isArray(item?.row),
  );

  return rowContainer?.row ?? [];
}

/**
 * 전체 데이터 개수를 API 응답에서 가져옵니다.
 */
function getTotalCount(response) {
  const container = response?.StanReginCd;

  if (!Array.isArray(container)) {
    return 0;
  }

  for (const item of container) {
    if (!Array.isArray(item?.head)) {
      continue;
    }

    for (const headItem of item.head) {
      if (headItem?.totalCount !== undefined) {
        return Number(headItem.totalCount);
      }
    }
  }

  return 0;
}

/**
 * 법정동 코드 API의 특정 페이지를 요청합니다.
 */
async function fetchPage(pageNo) {
  const url = new URL(API_URL);

  url.searchParams.set("ServiceKey", SERVICE_KEY);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set(
    "numOfRows",
    String(PAGE_SIZE),
  );
  url.searchParams.set("type", "json");

  const response = await fetch(url);

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `API 요청 실패: ${response.status} ${response.statusText}\n${responseText}`,
    );
  }

  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      `API가 JSON이 아닌 응답을 반환했습니다.\n${responseText}`,
    );
  }
}

/**
 * 전체 법정동 데이터를 페이지 단위로 가져옵니다.
 */
async function fetchAllRows() {
  const firstResponse = await fetchPage(1);
  const totalCount = getTotalCount(firstResponse);
  const firstRows = getRows(firstResponse);

  if (totalCount === 0) {
    return firstRows;
  }

  const totalPages = Math.ceil(
    totalCount / PAGE_SIZE,
  );

  const allRows = [...firstRows];

  console.log(
    `전체 ${totalCount}개, 총 ${totalPages}페이지`,
  );

  for (
    let pageNo = 2;
    pageNo <= totalPages;
    pageNo += 1
  ) {
    console.log(
      `법정동 코드 다운로드 중: ${pageNo}/${totalPages}`,
    );

    const response = await fetchPage(pageNo);
    const rows = getRows(response);

    allRows.push(...rows);
  }

  return allRows;
}

/**
 * 행정안전부 원본 필드를 앱에서 사용하기 쉬운 형태로 정리합니다.
 */
function normalizeRow(row) {
  const residentCode = String(
    row.locatjumin_cd ?? "",
  ).trim();

  const landCode = String(
    row.locatjijuk_cd ?? "",
  ).trim();

  const isValidResidentCode =
    /^\d{10}$/.test(residentCode) &&
    residentCode !== ROOT_CODE;

  /**
   * 주민 코드가 0000000000이면 사용할 수 없으므로
   * 지적 법정동 코드(locatjijuk_cd)를 사용합니다.
   */
  const code = isValidResidentCode
    ? residentCode
    : landCode;

  return {
    code,
    name: String(
      row.locallow_nm ?? "",
    ).trim(),
    fullName: String(
      row.locatadd_nm ?? "",
    ).trim(),
    parentCode: String(
      row.locathigh_cd ?? "",
    ).trim(),
    order: String(
      row.locat_order ?? "",
    ).trim(),
    remark: String(
      row.locat_rm ?? "",
    ).trim(),
  };
}

/**
 * 코드가 유효한 10자리 법정동 코드인지 확인합니다.
 */
function isValidCode(code) {
  return (
    /^\d{10}$/.test(code) &&
    code !== ROOT_CODE
  );
}

/**
 * 시·도 코드인지 확인합니다.
 *
 * 일반 시·도:
 * 앞 2자리를 제외한 나머지가 0
 *
 * 세종특별자치시:
 * 법정동 코드 체계상 3611000000을 사용하므로 예외 처리
 */
function isProvinceCode(code) {
  if (!isValidCode(code)) {
    return false;
  }

  const isGeneralProvince =
    code.slice(2) === "00000000";

  const isSejong =
    code === SEJONG_CODE;

  return isGeneralProvince || isSejong;
}

/**
 * 시·군·구 코드인지 확인합니다.
 *
 * 앞 5자리를 제외한 나머지가 0인 코드를 사용합니다.
 * 시·도 코드는 제외합니다.
 */
function isDistrictCode(code) {
  return (
    isValidCode(code) &&
    !isProvinceCode(code) &&
    code.slice(5) === "00000"
  );
}

/**
 * 동일한 코드를 가진 중복 레코드를 제거합니다.
 */
function removeDuplicateCodes(rows) {
  const codeMap = new Map();

  for (const row of rows) {
    if (!codeMap.has(row.code)) {
      codeMap.set(row.code, row);
    }
  }

  return [...codeMap.values()];
}

/**
 * 원본 법정동 데이터에서 시·도와 시·군·구만 추출합니다.
 */
function createRegionData(rawRows) {
  const normalizedRows = removeDuplicateCodes(
    rawRows
      .map(normalizeRow)
      .filter((row) =>
        isValidCode(row.code),
      ),
  );

  const regionMap = new Map();

  /**
   * 최상위 시·도 레코드가 누락되는 경우를 대비해
   * 전체 주소의 첫 단어와 코드 앞 두 자리로 시·도를 구성합니다.
   */
  for (const row of normalizedRows) {
    const addressParts = row.fullName
      .split(/\s+/)
      .filter(Boolean);

    const provinceName = addressParts[0];

    if (!provinceName) {
      continue;
    }

    const provinceCode =
      provinceName === "세종특별자치시"
        ? SEJONG_CODE
        : `${row.code.slice(0, 2)}00000000`;

    if (!isValidCode(provinceCode)) {
      continue;
    }

    if (!regionMap.has(provinceCode)) {
      regionMap.set(provinceCode, {
        code: provinceCode,
        name: provinceName,
        districts: new Map(),
      });
    }
  }

  /**
   * 코드 뒤 5자리가 0인 시·군·구 레코드를 추출합니다.
   */
  const districtRows = normalizedRows.filter(
    (row) => isDistrictCode(row.code),
  );

  for (const district of districtRows) {
    const addressParts = district.fullName
      .split(/\s+/)
      .filter(Boolean);

    const provinceName = addressParts[0];
    const districtName =
      addressParts[1] || district.name;

    if (!provinceName || !districtName) {
      continue;
    }

    const provinceCode =
      provinceName === "세종특별자치시"
        ? SEJONG_CODE
        : `${district.code.slice(0, 2)}00000000`;

    const region = regionMap.get(provinceCode);

    if (!region) {
      continue;
    }

    region.districts.set(
      district.code,
      {
        code: district.code,
        name: districtName,
      },
    );
  }

  const regions = [...regionMap.values()]
    .map((region) => {
      const districts = [
        ...region.districts.values(),
      ].sort((first, second) =>
        first.name.localeCompare(
          second.name,
          "ko",
        ),
      );

      /**
       * 세종특별자치시는 별도의 시·군·구 단계가 없으므로
       * 시 자체를 하위 선택값으로 사용합니다.
       */
      if (
        region.code === SEJONG_CODE &&
        districts.length === 0
      ) {
        districts.push({
          code: region.code,
          name: region.name,
        });
      }

      return {
        code: region.code,
        name: region.name,
        districts,
      };
    })
    .filter(
      (region) =>
        region.name.length > 0 &&
        region.districts.length > 0,
    )
    .sort((first, second) =>
      first.code.localeCompare(second.code),
    );

  console.log(
    "가공된 시·도:",
    regions.map(
      (region) =>
        `${region.name}(${region.code})`,
    ),
  );

  /**
   * 2026년 7월 전남·광주 통합 이후 현재 시·도는 16개입니다.
   */
  const expectedRegionCount = 16;

  if (regions.length !== expectedRegionCount) {
    throw new Error(
      `시·도 개수가 올바르지 않습니다. 예상: ${expectedRegionCount}개, 실제: ${regions.length}개`,
    );
  }

  if (
    regions.some(
      (region) => region.code === ROOT_CODE,
    )
  ) {
    throw new Error(
      "유효하지 않은 최상위 코드 0000000000이 포함됐습니다.",
    );
  }

  return regions;
}

/**
 * 생성된 지역 데이터가 올바른지 검사합니다.
 */
function validateRegionData(regions) {
  const provinceCodeSet = new Set();
  const districtCodeSet = new Set();

  for (const region of regions) {
    if (provinceCodeSet.has(region.code)) {
      throw new Error(
        `중복 시·도 코드가 있습니다: ${region.code}`,
      );
    }

    provinceCodeSet.add(region.code);

    if (!region.name) {
      throw new Error(
        `시·도 이름이 없습니다: ${region.code}`,
      );
    }

    for (const district of region.districts) {
      const uniqueDistrictKey =
        `${region.code}:${district.code}`;

      if (
        districtCodeSet.has(uniqueDistrictKey)
      ) {
        throw new Error(
          `중복 시·군·구 코드가 있습니다: ${district.code}`,
        );
      }

      districtCodeSet.add(uniqueDistrictKey);

      if (!district.name) {
        throw new Error(
          `시·군·구 이름이 없습니다: ${district.code}`,
        );
      }
    }
  }
}

/**
 * JSON 파일을 UTF-8 형식으로 저장합니다.
 */
async function writeJsonFile(
  outputPath,
  data,
) {
  await mkdir(
    path.dirname(outputPath),
    {
      recursive: true,
    },
  );

  await writeFile(
    outputPath,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  console.log(
    "행정안전부 법정동 코드 다운로드를 시작합니다.",
  );

  const rawRows = await fetchAllRows();

  const rawOutputPath = path.resolve(
    "scripts/input/legal-dong-raw.json",
  );

  const regionOutputPath = path.resolve(
    "src/data/regions.json",
  );

  // 가공에 실패해도 원본 응답을 확인할 수 있도록
  // 원본 데이터를 먼저 저장합니다.
  await writeJsonFile(
    rawOutputPath,
    rawRows,
  );

  const regions =
    createRegionData(rawRows);

  validateRegionData(regions);

  await writeJsonFile(
    regionOutputPath,
    regions,
  );

  const districtCount = regions.reduce(
    (total, region) =>
      total + region.districts.length,
    0,
  );

  console.log(
    `시·도 ${regions.length}개 생성`,
  );

  console.log(
    `시·군·구 ${districtCount}개 생성`,
  );

  console.log(
    `원본 데이터: ${rawOutputPath}`,
  );

  console.log(
    `가공 결과: ${regionOutputPath}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});