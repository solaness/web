import { useState } from "react";
import IconPin from "../../assets/icons/icon-pin.svg?react";
import type { Place } from "../../types/place";

interface HomePlaceThumbCardProps {
  place: Place;
  onClick?: (placeId: string) => void;
}

function HomePlaceThumbCard({
  place,
  onClick,
}: HomePlaceThumbCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !place.thumbnailUrl || imageFailed;

  return (
    <button
      type="button"
      className="w-[128px] shrink-0 text-left"
      onClick={() => onClick?.(place.id)}
      aria-label={`${place.name} 상세 보기`}
    >
      {showPlaceholder ? (
        <div className="flex h-[96px] w-full items-center justify-center rounded-[8px] bg-[#FFF3DD]">
          <IconPin className="h-6 w-6 text-[#FFAC27]" />
        </div>
      ) : (
        <img
          src={place.thumbnailUrl}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-[96px] w-full rounded-[8px] object-cover"
        />
      )}

      <strong className="mt-2 block truncate text-sm font-bold text-[#5E390C]">
        {place.name}
      </strong>

      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8F806E]">
        {place.address}
      </p>
    </button>
  );
}

export default HomePlaceThumbCard;
