import RecordCategoryStats from "./RecordCategoryStats";
import solnyangBasic from "../../assets/images/solnyang-basic.svg";
import solnyangHello from "../../assets/images/solnyang-hello.svg"
import type { DailyActivity } from "../../data/historyCalendar";

interface RecordMonthlySummaryProps {
  activities: DailyActivity[];
}

interface SummaryBoxProps {
  label: string;
  value: number;
  unit: string;
  mascotSrc: string;
}

const CATEGORY_CONFIG = [
  { id: "forest", name: "산림", icon: "🌿", values: ["산림", "수목원", "공원"] },
  { id: "cafe", name: "카페", icon: "☕", values: ["카페"] },
  { id: "experience", name: "체험", icon: "🎨", values: ["체험"] },
  { id: "shopping", name: "쇼핑", icon: "🛍️", values: ["쇼핑"] },
  { id: "sea", name: "바다", icon: "🌊", values: ["바다", "해변"] },
];

const OTHER_CATEGORY = { id: "etc", name: "기타", icon: "📍" };

function SummaryBox({
  label,
  value,
  unit,
  mascotSrc,
}: SummaryBoxProps) {
  return (
    <div
      className="relative h-[82px] flex-1 overflow-hidden rounded-[14px] border border-[#FFE2B2] bg-white px-[10px] py-[8px]"
      style={{
        boxShadow: "2px 2px 4px 0 #FFE2B2",
      }}
    >
      <p className="text-[14px] font-semibold text-[#754308]">
        {label}
      </p>

      <div className="mt-1 flex items-end">
        <strong className="text-[36px] font-bold leading-none text-[#F78903]">
          {value}
        </strong>

        <span className="mb-[2px] ml-1 text-[12px] font-bold text-[#F78903]">
          {unit}
        </span>
      </div>

      <img
        src={mascotSrc}
        alt=""
        className="pointer-events-none absolute bottom-[3px] right-[3px] h-[65.5px] w-[57px] object-contain"
      />
    </div>
  );
}

function RecordMonthlySummary({
   activities,
}: RecordMonthlySummaryProps) {
  const totalActivities = activities.length;

  const visitedPlaceCount = new Set(
    activities.map((activity) => activity.placeId),
  ).size;

  const categoryStats = CATEGORY_CONFIG.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    count: activities.filter((activity) =>
      category.values.includes(activity.category),
    ).length,
  }));

  const knownCategoryValues = CATEGORY_CONFIG.flatMap(
    (category) => category.values,
  );
  const otherCount = activities.filter(
    (activity) => !knownCategoryValues.includes(activity.category),
  ).length;

  if (otherCount > 0) {
    categoryStats.push({ ...OTHER_CATEGORY, count: otherCount });
  }

  return (
    <section
      className="h-[277px] w-full rounded-[20px] border border-[#FFAC27] bg-[#FFFEF8] px-[13px] py-[12px]"
      style={{
        boxShadow: "4px 4px 4px 0 #FFE2B2",
      }}
      aria-labelledby="monthly-summary-title"
    >
      <h2
        id="monthly-summary-title"
        className="text-[18px] font-bold leading-[22px] text-[#754308]"
      >
        이번달 활동 요약 📍
      </h2>

      <div className="mt-[14px] flex gap-[8px]">
        <SummaryBox
          label="총 활동 횟수"
          value={totalActivities}
          unit="회"
          mascotSrc={solnyangBasic}
        />

        <SummaryBox
          label="방문 장소 수"
          value={visitedPlaceCount}
          unit="곳"
          mascotSrc={solnyangHello}
        />
      </div>

      <div className="mt-[18px]">
        <RecordCategoryStats categories={categoryStats} />
      </div>
    </section>
  );
}

export default RecordMonthlySummary;