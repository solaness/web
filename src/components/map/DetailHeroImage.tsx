import { useState } from "react";
import IconPin from "../../assets/icons/icon-pin.svg?react";

interface DetailHeroImageProps {
  imageUrl: string;
  placeName: string;
}

/**
 * 지도 상세 페이지 상단 풀스크린 이미지.
 * 뒤로가기/북마크 버튼은 여기 담지 않는다 — 스크롤 카드 오버레이(MapDetail.tsx)가
 * 같은 absolute inset-0 레이어에서 이 위에 그려지기 때문에, 버튼을 여기 두면
 * 오버레이의 투명 영역이 클릭을 가로채서 버튼이 눌리지 않는다.
 * 대신 MapDetail.tsx가 오버레이보다 더 위 레이어에 버튼을 별도로 그린다.
 */
function DetailHeroImage({ imageUrl, placeName }: DetailHeroImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !imageUrl || imageFailed;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#FFF3DD]">
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center">
          <IconPin className="h-10 w-10 text-[#FFAC27]" />
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={placeName}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export default DetailHeroImage;
