interface HistoryEmptyStateProps {
  message: string;
}

function HistoryEmptyState({
  message,
}: HistoryEmptyStateProps) {
  return (
    <section
      className="flex h-[187px] w-full items-start rounded-[20px] border border-[#FFAC27] bg-white px-5 py-5"
      style={{
        boxShadow:
          "4px 4px 6px 0 rgba(255, 172, 39, 0.5)",
      }}
    >
      <h2 className="text-[19px] font-bold leading-[26.4px] text-[#754308]">
        {message}
      </h2>
    </section>
  );
}

export default HistoryEmptyState;