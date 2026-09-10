import solnyangHello from "../../../assets/images/solnyang-hello.svg";

/** 인트로 캐러셀 2번째 슬라이드 — WBTI(웰니스 유형 검사) 소개. */
function IntroSlideWbti() {
  return (
    <div className="flex flex-col">
      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <h2 className="text-[30px] font-bold text-[#754308]">
          🌟 나만의 웰니스 유형, WBTI
        </h2>
        <p className="text-[13px] leading-relaxed text-[#A1A1A1]">
          본 설문(또는 성향 테스트)은 대홍기획 데이터인사이트 부문이 개발한
          'W-BTI(Wellness-Based Type Indicator)' 지표를 기반으로
          제작되었습니다.
        </p>
      </div>

      <div className="relative mx-auto mt-8 flex h-[290px] w-[290px] items-center justify-center">
        <div className="absolute h-[254px] w-[168px] -translate-x-10 translate-y-4 rotate-[-14deg] rounded-[20px] border-2 border-[#C9E9C0] bg-white" />
        <div className="absolute h-[254px] w-[168px] translate-x-10 translate-y-4 rotate-[12deg] rounded-[20px] border-2 border-[#BFE0F5] bg-white" />
        <div className="absolute flex h-[254px] w-[168px] items-center justify-center rounded-[20px] border-2 border-[#FFAC27] bg-white">
          <img
            src={solnyangHello}
            alt="쏠냥이"
            className="h-[140px] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default IntroSlideWbti;
