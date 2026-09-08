import solnyangProfile from "../../../assets/images/solnyang-profile.svg";

/**
 * 인트로 캐러셀 1번째 슬라이드 — 챗봇과 대화하는 모습을 미리 보여주는 목업 카드.
 * 실제로 동작하는 챗봇이 아니라 정적인 미리보기 UI라, 버튼/말풍선 모두 클릭 동작이 없다.
 */
function IntroSlideChat() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-3 rounded-[24px] border border-[#FFE1A8] bg-[#FFFDF6] p-5 shadow-[0px_0px_7px_6px_#FAC77540]">
        <div className="flex flex-col items-end gap-2">
          <span className="whitespace-nowrap rounded-full bg-[#FFAC27] px-4 py-2 text-[13px] font-medium text-white">
            마음이 복잡해
          </span>
          <span className="whitespace-nowrap rounded-full bg-[#FFAC27] px-4 py-2 text-[13px] font-medium text-white">
            조용히 생각 정리할 수 있는 곳 추천해줘
          </span>
        </div>

        <div className="flex flex-col items-start gap-2">
          <img
            src={solnyangProfile}
            alt="쏠냥이"
            className="h-10 w-10 shrink-0 rounded-full border border-[#FFAC27]"
          />
          <p className="rounded-2xl border border-[#FFAC27] bg-white px-3 py-2 text-[13px] leading-relaxed text-[#754308]">
            조용한 힐링 공간은 [수목원🌳 카페☕ 다도방🍵]이 있다냥
          </p>
          <span className="rounded-full border border-[#FFAC27] bg-white px-3 py-1.5 text-[13px] font-medium text-[#754308]">
            같이 이야기 해볼까냥?
          </span>
        </div>
      </div>

      <p className="text-center text-[36px] font-bold leading-tight text-[#754308]">
        나의 기분에 맞는
        <br />
        나만의 힐링스팟
      </p>
    </div>
  );
}

export default IntroSlideChat;
