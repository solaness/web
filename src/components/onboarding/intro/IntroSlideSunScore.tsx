const SUN_SCORE_EMOJIS = ["🌿", "☕", "🌊"];
// 아이콘마다 위아래 애니메이션 시작 시점을 조금씩 늦춰서, 다같이 까딱이지 않고
// 파도처럼 순서대로 울렁이는 느낌을 준다.
const FLOAT_DELAY_STEP_S = 0.2;
// 마퀴가 끊김없이 무한 반복되도록 아이콘 목록을 통째로 두 번 이어붙인다
// (index.css의 marquee keyframes가 정확히 이 목록 전체 너비의 절반만큼만 이동하도록 맞춰져 있다).
const MARQUEE_ICONS = [...SUN_SCORE_EMOJIS, ...SUN_SCORE_EMOJIS];

/** 인트로 캐러셀 3번째 슬라이드 — 오늘의 햇빛 충전 점수 소개. */
function IntroSlideSunScore() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[30px] font-bold text-[#754308]">
          🌟 오늘의 햇빛 충전 점수
        </h2>
        <p className="text-[13px] leading-relaxed text-[#A1A1A1]">
          매일 야외 활동 시간을 기반으로
          <br />
          일간, 주간, 월간 햇빛 충전 현황을 분석하고 관리합니다
        </p>
      </div>

      {/*
        overflow-x만 hidden으로 두면 CSS 스펙상 overflow-y가 강제로 auto로 계산돼서
        (visible/non-visible 조합은 허용 안 됨, overflow-y를 visible로 명시해도 소용없다)
        세로로 살짝만 넘쳐도 스크롤바가 생긴다. 그래서 아예 세로로 넘치지 않도록
        위아래 여백(py)을 아이콘의 float 애니메이션 범위보다 넉넉히 잡는다.
      */}
      <div className="relative mt-16 w-full overflow-x-hidden py-8">
        <div className="flex w-max animate-marquee gap-16">
          {MARQUEE_ICONS.map((emoji, index) => (
            <span
              key={index}
              className="animate-float text-[110px] leading-none"
              style={{
                animationDelay: `${
                  (index % SUN_SCORE_EMOJIS.length) * FLOAT_DELAY_STEP_S
                }s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntroSlideSunScore;
