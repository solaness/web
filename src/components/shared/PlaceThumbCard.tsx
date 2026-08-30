import type {
  RecommendedPlace,
} from "../../data/homeRecommendations";

interface PlaceThumbCardProps {
  place: RecommendedPlace;
  onClick?: (placeId: string) => void;
}

function PlaceThumbCard({
  place,
  onClick,
}: PlaceThumbCardProps) {
  return (
    <button
      type="button"
      className="w-[128px] shrink-0 text-left"
      onClick={() => onClick?.(place.id)}
      aria-label={`${place.name} 상세 보기`}
    >
      <img
        src={place.imageUrl}
        alt=""
        className="h-[96px] w-full rounded-[8px] object-cover"
      />

      <strong className="mt-2 block truncate text-sm font-bold text-[#5E390C]">
        {place.name}
      </strong>

      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8F806E]">
        {place.description}
      </p>
    </button>
  );
}

export default PlaceThumbCard;