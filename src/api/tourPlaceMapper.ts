import type { TourApiRawItem } from "./tourApi.types";
import type { Place, PlaceCategoryCode } from "../types/place";

/**
 * TourAPI 원본 항목(camelCase 아닌 lowercase 필드)을 앱의 Place 타입으로 변환한다.
 * `category`는 어떤 CATEGORY_FILTERS 조회로 이 항목을 가져왔는지 호출부에서 넘겨준다
 * (원본 cat1/cat2/cat3만으로는 우리 카테고리 체계로 역매핑하기 어려워서).
 */
export function mapTourItemToPlace(
  item: TourApiRawItem,
  category: PlaceCategoryCode,
): Place {
  const address = [item.addr1, item.addr2]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");

  const thumbnailUrl = item.firstimage?.trim() || item.firstimage2?.trim() || "";

  const lat = item.mapy?.trim() ? Number(item.mapy) : NaN;
  const lng = item.mapx?.trim() ? Number(item.mapx) : NaN;

  return {
    id: item.contentid,
    name: item.title,
    address,
    category,
    thumbnailUrl,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  };
}
