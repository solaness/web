import HomePlaceThumbCardSkeleton from "../shared/HomePlaceThumbCardSkeleton";

const SKELETON_COUNT = 4;

function RecommendListSkeleton() {
  return (
    <section className="mt-7" aria-hidden="true">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-medium lowercase text-[#B3B3B3]">
          recommend
        </h2>

        <div className="h-px flex-1 bg-[#D9D9D9]" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <HomePlaceThumbCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default RecommendListSkeleton;
