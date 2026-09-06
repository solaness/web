import TestStepPage from "../../components/onboarding/TestStepPage";
import { TEST_PAGE_QUESTION_IDS } from "../../data/wbtiQuestions";

const STEP = 3;
const QUESTION_IDS = TEST_PAGE_QUESTION_IDS[2];
const PREVIOUS_PATH = "/onboarding/test/1";
const NEXT_PATH = "/onboarding/test/3";

function Test2() {
  return (
    <TestStepPage
      step={STEP}
      questionIds={QUESTION_IDS}
      previousPath={PREVIOUS_PATH}
      nextPath={NEXT_PATH}
    />
  );
}

export default Test2;
