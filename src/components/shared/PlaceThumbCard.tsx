import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconPin from "../../assets/icons/icon-pin.svg?react";
import IconChevronRight from "../../assets/icons/icon-chevron-right.svg?react";
import type { Place } from "../../types/place";

interface PlaceThumbCardProps {
  place: Place;
  onClick?: (place: Place) => void;
  className?: string;
}

/**
 * 홈 추천 / 지도 검색 / 방문 기록에서 공용으로 쓰는 장소 카드.
 * onClick을 넘기지 않으면 기본으로 `/map/:id` 상세 화면으로 이동한다.
 */
function PlaceThumbCard({ place, onClick, className = "" }: PlaceThumbCardProps) {
  const navigate = useNavigate();
  // TourAPI 응답에 firstimage/firstimage2가 비어있는 항목이 흔해서, 없거나 로드 실패 시
  // 플레이스홀더 블록을 대신 보여준다.
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !place.thumbnailUrl || imageFailed;

  const handleClick = () => {
    if (onClick) {
      onClick(place);
      return;
    }

    navigate(`/map/${place.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative block h-[114px] w-full overflow-hidden rounded-[16px] border-2 border-[#FFAC27] text-left ${className}`}
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFF3DD]">
          <IconPin className="h-8 w-8 text-[#FFAC27]" />
        </div>
      ) : (
        <img
          src={place.thumbnailUrl}
          alt={place.name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "linear-gradient(0deg, #000000 0%, rgba(102, 102, 102, 0) 100%)",
        }}
      />

      <div className="absolute inset-x-4 bottom-3 min-w-0 pr-8">
        <p className="truncate text-[26px] font-bold text-white">
          {place.name}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-white/90">
          <IconPin className="translate-y-[1px] shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>
      </div>

      <IconChevronRight className="absolute right-4 top-1/2 shrink-0 -translate-y-1/2 text-white" />
    </button>
  );
}

export default PlaceThumbCard;
