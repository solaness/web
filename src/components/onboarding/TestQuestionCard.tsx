import type { WbtiAxisCode, WbtiQuestion } from "../../types/wbti";
import TestOptionButton from "./TestOptionButton";

interface TestQuestionCardProps {
  question: WbtiQuestion;
  order: number;
  selectedCode: WbtiAxisCode | undefined;
  onSelect: (code: WbtiAxisCode) => void;
}

function TestQuestionCard({
  question,
  order,
  selectedCode,
  onSelect,
}: TestQuestionCardProps) {
  const title = question.emoji
    ? `Q${order}. ${question.prompt} ${question.emoji}`
    : `Q${order}. ${question.prompt}`;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-1 text-base font-bold leading-[22px] text-[#754308]">
        {title}
      </h2>

      <div
        className="flex flex-col gap-2"
        role="radiogroup"
        aria-label={question.prompt}
      >
        {question.options.map((option) => (
          <TestOptionButton
            key={option.code}
            label={option.label}
            isSelected={selectedCode === option.code}
            onClick={() => onSelect(option.code)}
          />
        ))}
      </div>
    </div>
  );
}

export default TestQuestionCard;
