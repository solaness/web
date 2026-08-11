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

export const REGIONS: RegionData[] =
  regionData as RegionData[];

export function findRegionByCode(
  regionCode: string,
): RegionData | undefined {
  return REGIONS.find(
    (region) => region.code === regionCode,
  );
}

export function findDistrictByCode(
  regionCode: string,
  districtCode: string,
): DistrictData | undefined {
  const region = findRegionByCode(regionCode);

  return region?.districts.find(
    (district) => district.code === districtCode,
  );
}

export function getRegionName(
  regionCode: string,
): string {
  return findRegionByCode(regionCode)?.name ?? "";
}

export function getDistrictName(
  regionCode: string,
  districtCode: string,
): string {
  return (
    findDistrictByCode(regionCode, districtCode)?.name ??
    ""
  );
}

export function isValidRegionSelection(
  regionCode: string,
  districtCode: string,
): boolean {
  return Boolean(
    findDistrictByCode(regionCode, districtCode),
  );
}