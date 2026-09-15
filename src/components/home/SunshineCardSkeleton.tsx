function SunshineCardSkeleton() {
  return (
    <article
      className="mx-auto flex h-[383px] w-full max-w-[370px] flex-col rounded-[8px] border border-[#FFF1D6] bg-white px-4 pb-4 pt-4"
      style={{
        boxShadow:
          "0 0 5px 4px rgba(250, 199, 117, 0.45), 0 4px 8px rgba(138, 62, 15, 0.12)",
      }}
      aria-hidden="true"
    >
      <div className="h-[22px] w-40 animate-pulse rounded bg-[#FFF3DD]" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="h-[190px] w-[190px] animate-pulse rounded-full bg-[#FFF3DD]" />
        <div className="mt-5 h-4 w-48 animate-pulse rounded bg-[#FFE1A8]" />
      </div>
    </article>
  );
}

export default SunshineCardSkeleton;
