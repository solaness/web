import { useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import IntroSlideChat from "../../components/onboarding/intro/IntroSlideChat";
import IntroSlideWbti from "../../components/onboarding/intro/IntroSlideWbti";
import IntroSlideSunScore from "../../components/onboarding/intro/IntroSlideSunScore";
import IntroSlideHistory from "../../components/onboarding/intro/IntroSlideHistory";

const LOGIN_PATH = "/onboarding/login";

// 슬라이드는 각자 헤딩/본문/일러스트까지 스스로 그리는 독립 컴포넌트라, 여기선 순서만 관리한다.
const SLIDES: ComponentType[] = [
  IntroSlideChat,
  IntroSlideWbti,
  IntroSlideSunScore,
  IntroSlideHistory,
];

// 이 정도 이상 스와이프해야 슬라이드가 넘어간다(짧게 스친 정도로는 안 넘어가게).
const SWIPE_THRESHOLD_PX = 40;

function Intro() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.min(Math.max(index, 0), SLIDES.length - 1));
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX == null || endX == null) {
      return;
    }

    const delta = endX - startX;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      return;
    }

    // 왼쪽으로 스와이프(손가락이 왼쪽으로 이동, delta 음수)하면 다음 슬라이드로.
    goToSlide(currentSlide + (delta < 0 ? 1 : -1));
  };

  // 어느 슬라이드에 있든 "시작하기"는 항상 로그인 화면으로 바로 이동한다 —
  // 서비스 소개는 훑어보고 싶은 만큼만 보고 언제든 건너뛸 수 있게 하기 위함.
  const handleStart = () => {
    navigate(LOGIN_PATH);
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <section
        className="relative z-10 flex min-h-0 flex-1 items-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((Slide, index) => (
            <div key={index} className="flex w-full shrink-0 items-center px-6">
              <div className="w-full">
                <Slide />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 shrink-0 px-6 pb-11 pt-5">
        <button
          type="button"
          onClick={handleStart}
          className="h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-base font-bold leading-[22px] text-white shadow-[4px_4px_4px_0px_#8A3E0F40] transition-colors hover:bg-[#FF9D00] active:bg-[#F28F00]"
        >
          시작하기
        </button>

        <div className="mt-7 flex justify-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
              aria-current={index === currentSlide}
              className={`h-2 w-2 rounded-full border border-[#FFAC27] transition-colors ${
                index === currentSlide ? "bg-[#FFAC27]" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </footer>
    </main>
  );
}

export default Intro;
