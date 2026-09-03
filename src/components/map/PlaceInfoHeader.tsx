import IconPin from "../../assets/icons/icon-pin.svg?react";
import IconStar from "../../assets/icons/icon-star.svg?react";
import IconLink from "../../assets/icons/icon-link.svg?react";
import IconShare from "../../assets/icons/icon-share.svg?react";
import { CATEGORIES } from "../../constants/categories";
import type { PlaceDetail } from "../../types/place";

interface PlaceRating {
  score: number;
  reviewCount: number;
}

interface PlaceInfoHeaderProps {
  place: PlaceDetail;
  /** 평점 데이터 출처(구글 플레이스 등)가 아직 없어서 null이면 별점 줄 자체를 숨긴다. */
  rating: PlaceRating | null;
  onShare: () => void;
}

/** 장소명 + 카테고리 뱃지 + 주소/평점/공유 + 사이트 링크. */
function PlaceInfoHeader({ place, rating, onShare }: PlaceInfoHeaderProps) {
  const badgeLabels = place.categories
    .map((code) => CATEGORIES.find((category) => category.code === code)?.label)
    .filter((label): label is string => Boolean(label));

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[32px] font-bold tracking-[0.02em] text-[#754308]">
        {place.name}
      </h1>

      {badgeLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badgeLabels.map((label) => (
            <span
              key={label}
              className="rounded-lg border border-[#FFAC27] bg-[#FFFAEB] px-2.5 py-1 text-[13px] font-semibold text-[#754308]"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <IconPin className="h-[29px] w-[21px] shrink-0" />
        <span className="text-base font-semibold text-[#754308]">{place.address}</span>

        {rating && (
          <span className="flex items-center gap-1 text-base font-semibold text-[#754308]">
            <IconStar className="h-4 w-4 text-[#FFAC27]" />
            {rating.score.toFixed(1)} ({rating.reviewCount.toLocaleString()})
          </span>
        )}

        <button
          type="button"
          onClick={onShare}
          aria-label="공유하기"
          className="ml-auto flex h-[39px] w-[42px] shrink-0 items-center justify-center rounded border border-[#FFAC27] bg-[#FFF5E1]"
        >
          <IconShare className="text-[#754308]" />
        </button>
      </div>

      {place.homepageUrl && (
        <a
          href={place.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-[#B3B3B3] underline"
        >
          <IconLink className="shrink-0" />
          {place.homepageUrl}
        </a>
      )}
    </div>
  );
}

export default PlaceInfoHeader;
