import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import ProgressBar from "../../components/onboarding/ProgressBar";
import TestQuestionCard from "../../components/onboarding/TestQuestionCard";
import { useWbtiAnswers } from "../../hooks/useWbtiAnswers";
import {
  TEST_PAGE_QUESTION_IDS,
  getQuestionsByIds,
} from "../../data/wbtiQuestions";

const STEP = 4;
const QUESTION_IDS = TEST_PAGE_QUESTION_IDS[3];
const PREVIOUS_PATH = "/onboarding/test/2";
const NEXT_PATH = "/onboarding/result";

function Test3() {
  const navigate = useNavigate();
  const { answers, selectAnswer, isPageComplete } = useWbtiAnswers();
  const questions = useMemo(() => getQuestionsByIds(QUESTION_IDS), []);
  const canProceed = isPageComplete(QUESTION_IDS);

  const handlePrevious = () => {
    navigate(PREVIOUS_PATH);
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    navigate(NEXT_PATH);
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

          <ProgressBar currentStep={STEP} />
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

export default Test3;
