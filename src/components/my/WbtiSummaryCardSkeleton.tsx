/**
 * 로그인 사용자의 WBTI 유형을 Firestore에서 불러오는 동안 보여주는 스켈레톤.
 * WbtiSummaryCard와 바깥 크기(카드 padding/이미지 72px)를 맞춰서, 데이터가 도착했을 때
 * 카드가 나타나며 레이아웃이 밀리지 않게 한다.
 */
function WbtiSummaryCardSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse items-center gap-4 rounded-[20px] border border-[#FFE1A8] bg-[#FFFDF4] px-5 py-5"
      aria-hidden="true"
    >
      <div className="h-[72px] w-[72px] shrink-0 rounded-full bg-[#FFEFD2]" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-5 w-24 rounded-full bg-[#FFEFD2]" />
        <div className="h-4 w-32 rounded bg-[#FFEFD2]" />
        <div className="h-3 w-full rounded bg-[#FFEFD2]" />
      </div>
    </div>
  );
}

export default WbtiSummaryCardSkeleton;
