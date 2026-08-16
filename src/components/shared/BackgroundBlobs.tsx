/**
 * 온보딩 화면들이 공통으로 쓰는 블러 처리된 배경 원형 4개.
 * Region.tsx에서 처음 인라인으로 구현됐던 마크업을 그대로 옮겨 재사용 가능한 컴포넌트로 분리했다.
 * (CLAUDE.md에 명시된 공용 컴포넌트 — "온보딩 등 여러 화면 공용")
 */
function BackgroundBlobs() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-[72px] -top-[45px] h-[195px] w-[216px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,174,176,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute right-[-45px] top-[52px] h-[225px] w-[219px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,183,67,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute right-[-64px] top-[319px] h-[217px] w-[222px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(201,235,156,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-[72px] bottom-[-81px] h-[372px] w-[386px] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,157,0,0.18) 0%, rgba(255,253,246,0.18) 70%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

export default BackgroundBlobs;
