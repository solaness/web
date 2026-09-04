import { useNavigate } from "react-router-dom";
import HomePlaceThumbCard from "../shared/HomePlaceThumbCard";
import type {
  RecommendedPlace,
} from "../../data/homeRecommendations";

interface RecommendListProps {
  places: RecommendedPlace[];
}

function RecommendList({
  places,
}: RecommendListProps) {
  const navigate = useNavigate();

  const handlePlaceClick = (
    placeId: string,
  ) => {
    navigate(`/map/${placeId}`);
  };

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-medium lowercase text-[#B3B3B3]">
          recommend
        </h2>

        <div className="h-px flex-1 bg-[#D9D9D9]" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {places.map((place) => (
          <HomePlaceThumbCard
            key={place.id}
            place={place}
            onClick={handlePlaceClick}
          />
        ))}
      </div>
    </section>
  );
}

export default RecommendList;