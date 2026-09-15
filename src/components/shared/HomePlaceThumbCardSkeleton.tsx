/**
 * 홈 추천 장소 목록을 불러오는 동안 HomePlaceThumbCard 자리에 대신 보여주는 스켈레톤.
 * HomePlaceThumbCard와 바깥 크기(w-[128px], h-[96px] 이미지)를 맞춰서, 데이터가 도착했을 때
 * 카드로 바뀌며 레이아웃이 밀리지 않게 한다. PlaceThumbCardSkeleton과 같은 톤(animate-pulse,
 * #FFF3DD/#FFE1A8)을 써서 지도 쪽 스켈레톤과 느낌을 맞춘다.
 */
function HomePlaceThumbCardSkeleton() {
  return (
    <div className="w-[128px] shrink-0" aria-hidden="true">
      <div className="h-[96px] w-full animate-pulse rounded-[8px] bg-[#FFF3DD]" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#FFE1A8]" />
      <div className="mt-1 h-3 w-full animate-pulse rounded bg-[#FFE1A8]" />
    </div>
  );
}

export default HomePlaceThumbCardSkeleton;
