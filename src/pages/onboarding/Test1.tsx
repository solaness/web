import TestStepPage from "../../components/onboarding/TestStepPage";
import { TEST_PAGE_QUESTION_IDS } from "../../data/wbtiQuestions";

const STEP = 2;
const QUESTION_IDS = TEST_PAGE_QUESTION_IDS[1];
const PREVIOUS_PATH = "/onboarding/region";
const NEXT_PATH = "/onboarding/test/2";

function Test1() {
  return (
    <TestStepPage
      step={STEP}
      questionIds={QUESTION_IDS}
      previousPath={PREVIOUS_PATH}
      nextPath={NEXT_PATH}
    />
  );
}

export default Test1;
