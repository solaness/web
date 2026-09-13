interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const DEFAULT_TOTAL_STEPS = 4;

function ProgressBar({
  currentStep,
  totalSteps = DEFAULT_TOTAL_STEPS,
}: ProgressBarProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStep / totalSteps) * 100),
  );

  return (
    <div className="flex flex-1 items-center gap-[11px]">
      <div
        className="relative h-[7px] flex-1 overflow-hidden rounded-lg border-2 border-[#FFAC27]"
        role="progressbar"
        aria-label="온보딩 진행률"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
      >
        <div
          className="absolute inset-y-0 left-0 bg-[#FFAC27] transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <span className="shrink-0 text-sm font-semibold leading-[22px] text-[#FFAC27]">
        {currentStep} / {totalSteps}
      </span>
    </div>
  );
}

export default ProgressBar;
