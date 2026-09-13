import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../shared/BackgroundBlobs";
import ProgressBar from "./ProgressBar";
import TestQuestionCard from "./TestQuestionCard";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { getQuestionsByIds } from "../../data/wbtiQuestions";

interface TestStepPageProps {
  /** ProgressBar에 표시할 현재 단계 (지역 선택을 1단계로 치는 온보딩 기준 등, 호출부가 정한다) */
  step: number;
  /** ProgressBar 분모. 온보딩은 4(지역+문항3세트), 재검사처럼 지역 없이 문항만 있으면 3 */
  totalSteps?: number;
  questionIds: number[];
  previousPath: string;
  nextPath: string;
}

/**
 * WBTI 문항 화면(헤더+진행바+문항리스트+다음버튼) 공통 레이아웃.
 * 온보딩 Test1~3.tsx와 마이페이지 "WBTI 유형 재검사"가 문항 구성(questionIds)과
 * 이전/다음 경로만 다르고 나머지는 완전히 동일해서 이 컴포넌트로 뽑았다.
 */
function TestStepPage({
  step,
  totalSteps,
  questionIds,
  previousPath,
  nextPath,
}: TestStepPageProps) {
  const navigate = useNavigate();
  const {
    wbtiAnswers: answers,
    selectWbtiAnswer: selectAnswer,
    isWbtiPageComplete: isPageComplete,
  } = useOnboarding();
  const questions = useMemo(() => getQuestionsByIds(questionIds), [questionIds]);
  const canProceed = isPageComplete(questionIds);

  const handlePrevious = () => {
    navigate(previousPath);
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    navigate(nextPath);
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 shrink-0 px-[19px] pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="shrink-0 text-sm font-semibold leading-[22px] text-[#FFAC27]"
            onClick={handlePrevious}
            aria-label="이전 화면으로 이동"
          >
            이전
          </button>

          <ProgressBar currentStep={step} totalSteps={totalSteps} />
        </div>
      </header>

      <section className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-[19px] pb-4">
        <div className="flex flex-col gap-8">
          {questions.map((question) => (
            <TestQuestionCard
              key={question.id}
              question={question}
              order={question.id}
              selectedCode={answers[question.id]}
              onSelect={(code) => selectAnswer(question.id, code)}
            />
          ))}
        </div>
      </section>

      <footer className="relative z-20 shrink-0 bg-gradient-to-t from-[#FFFDF6] via-[#FFFDF6] to-transparent px-16 pb-11 pt-5">
        <button
          type="button"
          className={`h-[53px] w-full rounded-[25px] text-base font-bold leading-[22px] text-white transition-colors ${
            canProceed
              ? "bg-[#FFAC27] shadow-[4px_4px_4px_0px_#8A3E0F40] hover:bg-[#FF9D00] active:bg-[#F28F00]"
              : "cursor-not-allowed bg-[#D9D9D9]"
          }`}
          disabled={!canProceed}
          onClick={handleNext}
        >
          다음
        </button>
      </footer>
    </main>
  );
}

export default TestStepPage;
