/**
 * 장소 목록을 불러오는 동안 PlaceThumbCard 자리에 대신 보여주는 스켈레톤.
 * PlaceThumbCard와 바깥 크기(h-[114px], rounded-[16px])를 맞춰서, 데이터가 도착했을 때
 * 카드로 바뀌며 레이아웃이 밀리지 않게 한다.
 */
function PlaceThumbCardSkeleton() {
  return (
    <div
      className="relative h-[114px] w-full animate-pulse overflow-hidden rounded-[16px] border-2 border-[#FFAC27] bg-[#FFF3DD]"
      aria-hidden="true"
    >
      <div className="absolute inset-x-4 bottom-3 flex flex-col gap-2">
        <div className="h-5 w-2/3 rounded bg-[#FFE1A8]" />
        <div className="h-3 w-1/2 rounded bg-[#FFE1A8]" />
      </div>
    </div>
  );
}

export default PlaceThumbCardSkeleton;
