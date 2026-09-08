import solnyangHelloSun from "../../assets/images/solnyang-hello-sun.png";
import type { WbtiTypeInfo } from "../../types/wbti";
import { WBTI_RESULT_TAGLINE } from "../../data/wbtiTypes";

interface WbtiSummaryCardProps {
  typeInfo: WbtiTypeInfo;
}

/**
 * 마이페이지에서 보여주는 WBTI 유형 요약 카드 (가로 배치).
 * 온보딩 결과 화면의 세로형 `ResultTypeCard`와 데이터(WBTI_TYPES, WBTI_RESULT_TAGLINE)는
 * 동일하게 재사용하고, 레이아웃만 마이페이지 카드에 맞게 가로형으로 새로 짰다.
 */
function WbtiSummaryCard({ typeInfo }: WbtiSummaryCardProps) {
  return (
    <div
      className="flex w-full items-center gap-4 rounded-[20px] border border-[#FFAC27] px-5 py-5 shadow-[4px_4px_4px_0px_#FFAC2740]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 250, 232, 0.7) 0%, rgba(255, 239, 210, 0.7) 100%)",
      }}
    >
      {/* TODO: 실제 유형별 캐릭터 이미지 에셋이 준비되면 typeInfo.imageUrl로 교체.
          ResultTypeCard와 동일하게 현재는 placeholder 이미지를 쓴다. */}
      <img
        src={typeInfo.imageUrl ?? solnyangHelloSun}
        alt={`${typeInfo.title} 캐릭터 이미지`}
        className="h-[72px] w-[72px] shrink-0 object-contain"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <span className="w-fit rounded-full bg-[#FFF3DD] px-3 py-1 text-xs font-semibold text-[#FFAC27]">
          당신의 유형은...
        </span>
        <p className="text-base font-bold text-[#754308]">
          {typeInfo.title} {typeInfo.emoji}
        </p>
        <p className="text-xs leading-[18px] text-[#A1A1A1]">
          {typeInfo.catchphrase}{" "}
          <span className="font-semibold text-[#FFAC27]">{`[${typeInfo.healingStyle}]`}</span>{" "}
          {WBTI_RESULT_TAGLINE}
        </p>
      </div>
    </div>
  );
}

export default WbtiSummaryCard;
