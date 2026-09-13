interface HistoryBarSpec {
  month: string;
  heightPercent: number;
  gradient: string;
}

// 실제 데이터가 아니라 "기록이 쌓이는 느낌"을 보여주기 위한 예시 막대 그래프.
const HISTORY_BARS: HistoryBarSpec[] = [
  { month: "1월", heightPercent: 45, gradient: "from-[#FFE9C6] to-[#FFC98B]" },
  { month: "2월", heightPercent: 100, gradient: "from-[#FFE0E8] to-[#FFB3C7]" },
  { month: "3월", heightPercent: 75, gradient: "from-[#E3F5DE] to-[#B7E4B0]" },
  { month: "4월", heightPercent: 30, gradient: "from-[#E3F2FB] to-[#AEDBF5]" },
];

const CHART_HEIGHT_PX = 220;
const BAR_WIDTH_PX = 62;

/** 인트로 캐러셀 4번째 슬라이드 — 나만의 햇빛 기록(방문 기록) 소개. */
function IntroSlideHistory() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[30px] font-bold text-[#754308]">
          🌟 나만의 햇빛 기록
        </h2>
        <p className="text-[13px] leading-relaxed text-[#A1A1A1]">
          바쁜 일상 속에서 오늘 하루 내가 쬐었던
          <br />
          따뜻한 햇살의 조각들을 차곡차곡 기록해 보세요
        </p>
      </div>

      <div className="mt-16 flex flex-col items-center">
        <div
          className="flex items-end justify-center gap-4 border-b border-[#FFAC27] pb-[11px]"
          style={{ height: CHART_HEIGHT_PX }}
        >
          {HISTORY_BARS.map(({ month, heightPercent, gradient }) => (
            <div
              key={month}
              className={`rounded-[10px] border border-[#FFAC27] bg-gradient-to-b ${gradient}`}
              style={{
                width: BAR_WIDTH_PX,
                height: `${(CHART_HEIGHT_PX * heightPercent) / 100}px`,
              }}
            />
          ))}
        </div>

        <div className="mt-2 flex justify-center gap-4">
          {HISTORY_BARS.map(({ month }) => (
            <span
              key={month}
              style={{ width: BAR_WIDTH_PX }}
              className="text-center text-sm font-semibold text-[#FFAC27]"
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntroSlideHistory;
