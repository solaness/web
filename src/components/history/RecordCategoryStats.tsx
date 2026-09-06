interface CategoryStat {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface RecordCategoryStatsProps {
  categories: CategoryStat[];
}

function RecordCategoryStats({
  categories,
}: RecordCategoryStatsProps) {
  return (
    <section aria-labelledby="category-stats-title">
      <h3
        id="category-stats-title"
        className="text-[18px] font-bold leading-[22px] text-[#754308]"
      >
        카테고리별 방문 수 📍
      </h3>

      <div className="mt-[9px] grid grid-cols-5 gap-1">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex min-w-0 flex-col items-center text-center"
          >
            <span
              className="text-[27px] leading-[30px]"
              aria-hidden="true"
            >
              {category.icon}
            </span>

            <span className="mt-1 truncate text-[10px] text-[#939393]">
              {category.name}
            </span>

            <strong className="mt-[2px] text-[20px] font-bold text-[#F78903]">
              {category.count}회
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecordCategoryStats;