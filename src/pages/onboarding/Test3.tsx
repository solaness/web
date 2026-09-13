import TestStepPage from "../../components/onboarding/TestStepPage";
import { TEST_PAGE_QUESTION_IDS } from "../../data/wbtiQuestions";

const STEP = 4;
const QUESTION_IDS = TEST_PAGE_QUESTION_IDS[3];
const PREVIOUS_PATH = "/onboarding/test/2";
const NEXT_PATH = "/onboarding/result";

function Test3() {
  return (
    <TestStepPage
      step={STEP}
      questionIds={QUESTION_IDS}
      previousPath={PREVIOUS_PATH}
      nextPath={NEXT_PATH}
    />
  );
}

export default Test3;
