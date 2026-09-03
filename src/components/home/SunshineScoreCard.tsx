interface SunshineScoreCardProps {
  score?: number;
  message?: string;
}

function SunshineScoreCard({
  score = 78,
  message = "오늘도 햇빛 에너지를 충전했어요!",
}: SunshineScoreCardProps) {
  return (
    <article
      className="mx-auto flex h-[383px] w-full max-w-[370px] flex-col rounded-[8px] border border-[#FFF1D6] bg-white px-4 pb-4 pt-4"
      style={{
        boxShadow:
          "0 0 5px 4px rgba(250, 199, 117, 0.45), 0 4px 8px rgba(138, 62, 15, 0.12)",
      }}
    >
      <h2 className="text-[21px] font-bold leading-[22px] text-[#754308]">
        오늘의 햇빛 점수
      </h2>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="relative flex h-[190px] w-[190px] items-center justify-center"
          aria-label={`오늘의 햇빛 점수 ${score}점`}
        >
          {/* 태양 빛 효과 */}
          <div className="absolute h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle,rgba(255,183,67,0.35)_0%,rgba(255,253,246,0)_70%)]" />

          {/* 태양 광선 */}
          {Array.from({ length: 12 }).map(
            (_, index) => (
              <span
                key={index}
                className="absolute h-[22px] w-[5px] rounded-full bg-[#FFB743]"
                style={{
                  transform: `rotate(${index * 30}deg) translateY(-78px)`,
                }}
                aria-hidden="true"
              />
            ),
          )}

          {/* 태양 본체 */}
          <div className="absolute h-[112px] w-[112px] rounded-full bg-[#FFAC27] shadow-[0_0_22px_rgba(255,172,39,0.4)]" />

          {/* 점수 */}
          <strong className="relative z-10 text-[52px] font-bold leading-none text-white">
            {score}
          </strong>
        </div>

        <p className="mt-5 text-center text-[16px] font-semibold leading-[22px] text-[#754308]">
          {message}
        </p>
      </div>
    </article>
  );
}

export default SunshineScoreCard;