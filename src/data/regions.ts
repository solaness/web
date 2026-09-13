import regionData from "./regions.json";

export interface DistrictData {
  code: string;
  name: string;
}

export interface RegionData {
  code: string;
  name: string;
  districts: DistrictData[];
}

const RAW_REGIONS =
  regionData as RegionData[];

/*
 * 시 아래에 일반구가 있는 경우 원본 데이터에는
 * 시 코드와 구 코드가 함께 들어 있습니다.
 *
 * 예:
 * 고양시 4128000000
 * 고양시 4128100000
 * 고양시 4128500000
 * 고양시 4128700000
 *
 * 화면에는 시 이름이 한 번만 표시되어야 하므로
 * 같은 이름을 합치고 시 대표 코드를 우선 사용합니다.
 */
function removeDuplicateDistricts(
  districts: DistrictData[],
): DistrictData[] {
  const districtMap = new Map<
    string,
    DistrictData
  >();

  districts.forEach((district) => {
    const existing =
      districtMap.get(district.name);

    if (!existing) {
      districtMap.set(
        district.name,
        district,
      );

      return;
    }

    /*
     * 일반구 코드보다 상위 시 코드를 우선합니다.
     *
     * 고양시: 4128000000
     * 고양시 덕양구: 4128100000
     *
     * 상위 시 코드는 다섯 번째 숫자가 0입니다.
     */
    const isCityCode =
      district.code.charAt(4) === "0";

    const existingIsCityCode =
      existing.code.charAt(4) === "0";

    if (
      isCityCode &&
      !existingIsCityCode
    ) {
      districtMap.set(
        district.name,
        district,
      );
    }
  });

  return Array.from(
    districtMap.values(),
  );
}

export const REGIONS: RegionData[] =
  RAW_REGIONS.map((region) => ({
    ...region,
    districts:
      removeDuplicateDistricts(
        region.districts,
      ),
  }));

export function findRegionByCode(
  regionCode: string,
): RegionData | undefined {
  return REGIONS.find(
    (region) =>
      region.code === regionCode,
  );
}

export function findDistrictByCode(
  regionCode: string,
  districtCode: string,
): DistrictData | undefined {
  const region =
    findRegionByCode(regionCode);

  return region?.districts.find(
    (district) =>
      district.code === districtCode,
  );
}

export function getRegionName(
  regionCode: string,
): string {
  return (
    findRegionByCode(regionCode)
      ?.name ?? ""
  );
}

export function getDistrictName(
  regionCode: string,
  districtCode: string,
): string {
  return (
    findDistrictByCode(
      regionCode,
      districtCode,
    )?.name ?? ""
  );
}

export function isValidRegionSelection(
  regionCode: string,
  districtCode: string,
): boolean {
  return Boolean(
    findDistrictByCode(
      regionCode,
      districtCode,
    ),
  );
}