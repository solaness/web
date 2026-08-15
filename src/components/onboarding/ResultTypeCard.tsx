import solnyangHelloSun from "../../assets/images/solnyang-hello-sun.png";
import type { WbtiTypeInfo } from "../../types/wbti";
import { WBTI_RESULT_TAGLINE } from "../../data/wbtiTypes";

interface ResultTypeCardProps {
  typeInfo: WbtiTypeInfo;
  onStart: () => void;
  startLabel?: string;
  isSubmitting?: boolean;
  onShare?: () => void;
  onSave?: () => void;
}

/**
 * 유형 결과 카드. Firestore 호출이나 네비게이션을 직접 하지 않는 순수 controlled 컴포넌트로 두어
 * 온보딩 Result.tsx뿐 아니라 추후 마이페이지 "WBTI 재검사" 화면에서도 onStart/onShare/onSave 콜백만
 * 바꿔 끼워 재사용할 수 있게 설계했다.
 */
function ResultTypeCard({
  typeInfo,
  onStart,
  startLabel = "시작하기",
  isSubmitting = false,
  onShare,
  onSave,
}: ResultTypeCardProps) {
  const titleWithEmoji = `${typeInfo.title} ${typeInfo.emoji}`;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center gap-6 rounded-[24px] border border-[#FFE1A8] bg-white px-6 py-8 shadow-[0px_0px_10px_4px_#FAC77540]">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-semibold text-[#A1A1A1]">
            당신의 유형은...
          </p>
          <h1 className="text-xl font-bold text-[#754308]">
            {titleWithEmoji}
          </h1>
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

      <div className="flex w-full flex-col items-center gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onStart}
          className={`h-[53px] w-full rounded-[25px] text-[16px] font-bold leading-[22px] text-white transition-colors ${
            isSubmitting
              ? "cursor-not-allowed bg-[#D9D9D9]"
              : "bg-[#FFAC27] shadow-[4px_4px_4px_0px_#8A3E0F40] hover:bg-[#FF9D00] active:bg-[#F28F00]"
          }`}
        >
          {isSubmitting ? "저장 중..." : startLabel}
        </button>

        <div className="flex w-full gap-3">
          {/* TODO: 공유하기 기능 구현 예정 (우선순위 낮음) */}
          <button
            type="button"
            onClick={onShare}
            className="h-[53px] flex-1 rounded-[25px] border border-[#FFAC27] text-[16px] font-bold text-[#FFAC27] shadow-[4px_4px_4px_0px_#FAC775]"
          >
            공유하기
          </button>
          {/* TODO: 저장하기 기능 구현 예정 (우선순위 낮음) */}
          <button
            type="button"
            onClick={onSave}
            className="h-[53px] flex-1 rounded-[25px] border border-[#FFAC27] text-[16px] font-bold text-[#FFAC27] shadow-[4px_4px_4px_0px_#FAC775]"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultTypeCard;
