import type { WbtiTypeInfo } from "../../types/wbti";

interface ResultTypeCardProps {
  typeInfo: WbtiTypeInfo;
}

function ResultTypeCard({
  typeInfo,
}: ResultTypeCardProps) {
  if (!typeInfo.imageUrl) {
    return null;
  }

  return (
    <img
      src={typeInfo.imageUrl}
      alt={`${typeInfo.title} WBTI 유형 결과`}
      className="h-auto w-full max-w-[348px] object-contain"
    />
  );
}

export default ResultTypeCard;