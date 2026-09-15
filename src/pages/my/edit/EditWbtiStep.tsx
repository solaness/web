import { Navigate, useParams } from "react-router-dom";
import TestStepPage from "../../../components/onboarding/TestStepPage";
import GuestNotice from "../../../components/shared/GuestNotice";
import { useAuth } from "../../../contexts/AuthContext";
import { TEST_PAGE_QUESTION_IDS } from "../../../data/wbtiQuestions";

const BASE_PATH = "/my/edit/wbti";
const EDIT_PROFILE_PATH = "/my/edit";
const RESULT_PATH = `${BASE_PATH}/result`;
const TOTAL_STEPS = 3;

/**
 * 마이페이지 "WBTI 유형 재검사" 문항 화면. 온보딩 Test1~3.tsx와 문항 구성은 같지만
 * 지역 선택 단계가 없어서 :step(1~3) 하나로 처리 — TestStepPage에 경로만 다르게 넘긴다.
 */
function EditWbtiStep() {
  const { isGuest } = useAuth();
  const { step } = useParams<{ step: string }>();
  const stepNumber = Number(step);

  if (isGuest) {
    return (
      <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF6]">
        <GuestNotice message="WBTI 재검사는 로그인 후 이용할 수 있어요" />
      </main>
    );
  }

  if (stepNumber !== 1 && stepNumber !== 2 && stepNumber !== 3) {
    return <Navigate to={`${BASE_PATH}/1`} replace />;
  }

  const previousPath =
    stepNumber === 1 ? EDIT_PROFILE_PATH : `${BASE_PATH}/${stepNumber - 1}`;
  const nextPath = stepNumber === 3 ? RESULT_PATH : `${BASE_PATH}/${stepNumber + 1}`;

  return (
    <TestStepPage
      step={stepNumber}
      totalSteps={TOTAL_STEPS}
      questionIds={TEST_PAGE_QUESTION_IDS[stepNumber]}
      previousPath={previousPath}
      nextPath={nextPath}
    />
  );
}

export default EditWbtiStep;
