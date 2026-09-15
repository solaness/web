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
