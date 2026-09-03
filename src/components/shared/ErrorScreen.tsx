interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

/** 전체 화면(또는 flex 컨테이너)을 채우는 공용 에러 화면. onRetry를 넘기면 재시도 버튼이 뜬다. */
function ErrorScreen({
  message = "문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <p className="text-sm font-bold text-red-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-[#FFAC27] px-4 py-2 text-sm font-bold text-[#F78903]"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

export default ErrorScreen;
