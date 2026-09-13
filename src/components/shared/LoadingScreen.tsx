interface LoadingScreenProps {
  message?: string;
}

/** 전체 화면(또는 flex 컨테이너)을 채우는 공용 로딩 화면. */
function LoadingScreen({ message = "불러오는 중..." }: LoadingScreenProps) {
  return (
    <div className="flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-sm text-[#B3B3B3]">
      <span>{message}</span>
    </div>
  );
}

export default LoadingScreen;
