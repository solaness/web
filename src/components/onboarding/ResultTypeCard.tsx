import solnyangHelloSun from "../../assets/images/solnyang-hello-sun.svg";
import type { WbtiTypeInfo } from "../../types/wbti";
import { WBTI_RESULT_TAGLINE } from "../../data/wbtiTypes";

interface ResultTypeCardProps {
  typeInfo: WbtiTypeInfo;
}

/**
 * 유형 결과 카드. typeInfo만 받아 유형 정보(제목/이미지/설명)를 순수하게 표시만 하는
 * presentational 컴포넌트. 시작하기/공유하기/저장하기 버튼은 `ResultActionButtons`로 분리했다
 * (표시와 액션의 역할을 나눠, 마이페이지 "WBTI 재검사" 등에서 카드/버튼을 독립적으로 재사용할 수 있게).
 */
function ResultTypeCard({ typeInfo }: ResultTypeCardProps) {
  const titleWithEmoji = `${typeInfo.title} ${typeInfo.emoji}`;

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-[24px] border border-[#FFE1A8] bg-white px-6 py-8 shadow-[0px_0px_10px_4px_#FAC77540]">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-[#A1A1A1]">
          당신의 유형은...
        </p>
        <h1 className="text-xl font-bold text-[#754308]">{titleWithEmoji}</h1>
      </div>

      {/* TODO: 실제 유형별 캐릭터 이미지 에셋이 준비되면 typeInfo.imageUrl로 교체.
          현재는 아직 export된 8종 일러스트가 없어 온보딩 로그인 화면 캐릭터를 placeholder로 재사용한다. */}
      <img
        src={typeInfo.imageUrl ?? solnyangHelloSun}
        alt={`${typeInfo.title} 캐릭터 이미지`}
        className="h-[160px] w-[160px] object-contain"
      />

      <div className="flex flex-col items-center gap-1 text-center text-sm leading-[22px] text-[#754308]">
        <p>{typeInfo.catchphrase}</p>
        <p className="font-bold">{`[${typeInfo.healingStyle}]`}</p>
        <p>{WBTI_RESULT_TAGLINE}</p>
        <p>{typeInfo.suggestion}</p>
      </div>
    </div>
  );
}

export default ResultTypeCard;
