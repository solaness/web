import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { areaBasedList } from "../api/tourApi";
import IconChevronLeft from "../assets/icons/icon-chevron-left.svg?react";
import IconPin from "../assets/icons/icon-pin.svg?react";
import solnyangHelloSun from "../assets/images/solnyang-hello-sun.png";
import solnyangProfile from "../assets/images/solnyang-profile.svg";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";
import { CHATBOT_MOODS } from "../data/chatbotMoods";
import type { Place, PlaceCategoryCode } from "../types/place";

// 추천마다 매번 새 API 호출이 생기므로, 호출 횟수는 선택당 1번으로 고정한다.
// cafe처럼 cat3(소분류)로 클라이언트에서 한 번 더 걸러내는 카테고리는 표본이 작으면 결과가 자주 비므로
// numOfRows를 넉넉히 잡아서, 같은 1회 호출 안에서 매칭될 확률을 높인다.
const RECOMMENDATION_FETCH_SIZE = 30;
const RECOMMENDATION_COUNT = 2;
// 같은 감정으로 "더 추천"은 최초 1회 + 최대 3회 추가까지만 허용한다.
const MAX_BATCHES_PER_ROUND = 4;

const MORE_OPTIONS = [
  { id: "more", label: "응!" },
  { id: "no_more", label: "아니!" },
] as const;

type MoreId = (typeof MORE_OPTIONS)[number]["id"];

const RESTART_OPTIONS = [
  { id: "restart", label: "응!" },
  { id: "end", label: "아니!" },
] as const;

type RestartId = (typeof RESTART_OPTIONS)[number]["id"];
type RecommendationStatus = "loading" | "success" | "error";

interface RecommendationBatch {
  id: number;
  recommendations: Place[];
  status: RecommendationStatus;
  moreId: MoreId | null;
  moreAt: string | null;
  restartId: RestartId | null;
  restartAt: string | null;
}

function createBatch(id: number): RecommendationBatch {
  return {
    id,
    recommendations: [],
    status: "loading",
    moreId: null,
    moreAt: null,
    restartId: null,
    restartAt: null,
  };
}

interface ChatRound {
  id: number;
  moodId: string | null;
  moodAt: string | null;
  batches: RecommendationBatch[];
}

function createRound(id: number): ChatRound {
  return { id, moodId: null, moodAt: null, batches: [] };
}

function formatToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function formatNowTime(): string {
  const now = new Date();
  const hours24 = now.getHours();
  const period = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${period} ${hours12}:${minutes}`;
}

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[75%] self-start rounded-2xl rounded-tl-sm border border-[#FFAC27] bg-white px-4 py-3 text-sm leading-relaxed text-[#754308]">
      {children}
    </div>
  );
}

function UserBubble({ children, at }: { children: ReactNode; at: string | null }) {
  return (
    <div className="flex w-full flex-col items-end gap-1">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#FFAC27] px-4 py-3 text-sm text-white">
        {children}
      </div>
      {at && <span className="text-xs text-[#A1A1A1]">{at}</span>}
    </div>
  );
}

/**
 * "오늘의 추천" 2열 그리드용 컴팩트 카드.
 * PlaceThumbCard(src/components/shared/PlaceThumbCard.tsx)는 전체 폭 목록용으로
 * 이름 폰트가 26px이라 2열에 넣으면 텍스트가 다 잘려서, 이 화면 전용으로 축소판을 둔다.
 */
function RecommendationThumb({ place }: { place: Place }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !place.thumbnailUrl || imageFailed;

  return (
    <button
      type="button"
      onClick={() => navigate(`/map/${place.id}`)}
      className="relative block aspect-square w-full overflow-hidden rounded-xl border border-[#FFAC27] text-left"
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFF3DD]">
          <IconPin className="h-6 w-6" />
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

      <div className="absolute inset-x-2 bottom-2 min-w-0">
        <p className="truncate text-sm font-bold text-white">{place.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/90">
          <IconPin className="h-[9px] w-[6px] shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>
      </div>
    </button>
  );
}

/** 기분/후속 질문 공용 선택지 박스. 한 번 고르면(selectedId가 생기면) 그 선택지는 고정되어 더 이상 클릭할 수 없다. */
function ChoiceBox<T extends string>({
  options,
  selectedId,
  onSelect,
}: {
  options: readonly { id: T; label: string; emoji?: string }[];
  selectedId: T | null;
  onSelect: (id: T) => void;
}) {
  const locked = selectedId !== null;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#FFAC27] bg-white p-2">
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            disabled={locked}
            onClick={() => onSelect(option.id)}
            className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
              isSelected
                ? "bg-[#FFF3DD] text-[#754308]"
                : locked
                  ? "text-[#D9D9D9]"
                  : "text-[#754308] hover:bg-[#FFF3DD]"
            }`}
          >
            {option.emoji && <span className="text-base">{option.emoji}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RecommendationBatchBlock({
  round,
  batch,
  onSelectMore,
  onSelectRestart,
}: {
  round: ChatRound;
  batch: RecommendationBatch;
  onSelectMore: (roundId: number, batchId: number, moreId: MoreId) => void;
  onSelectRestart: (roundId: number, batchId: number, restartId: RestartId) => void;
}) {
  // 같은 감정으로 더 추천받기는 라운드당 최대 MAX_BATCHES_PER_ROUND번까지만 — 다 썼으면
  // "더 추천해줄까?" 질문 없이 바로 "감정을 다시 선택할래?"로 넘어간다.
  const canOfferMore = round.batches.length < MAX_BATCHES_PER_ROUND;
  const showRestartQuestion = !canOfferMore || batch.moreId === "no_more";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-[#FFAC27] bg-white p-3">
        <p className="mb-2 text-sm font-bold text-[#F78903]">오늘의 추천</p>
        {batch.status === "loading" ? (
          <p className="py-2 text-sm text-[#B3B3B3]">불러오는 중...</p>
        ) : batch.status === "error" ? (
          <p className="py-2 text-sm font-bold text-red-500">
            장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : batch.recommendations.length === 0 ? (
          <p className="py-2 text-sm text-[#B3B3B3]">
            추천할 만한 장소를 찾지 못했어요.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {batch.recommendations.map((place) => (
              <RecommendationThumb key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>

      {canOfferMore && (
        <>
          <BotBubble>이런 비슷한 장소를 더 추천해줄까?</BotBubble>

          <ChoiceBox
            options={MORE_OPTIONS}
            selectedId={batch.moreId}
            onSelect={(moreId) => onSelectMore(round.id, batch.id, moreId)}
          />

          {batch.moreId && (
            <UserBubble at={batch.moreAt}>
              {MORE_OPTIONS.find((option) => option.id === batch.moreId)?.label}
            </UserBubble>
          )}
        </>
      )}

      {showRestartQuestion && (
        <>
          <BotBubble>그럼 감정을 다시 선택할래?</BotBubble>

          <ChoiceBox
            options={RESTART_OPTIONS}
            selectedId={batch.restartId}
            onSelect={(restartId) => onSelectRestart(round.id, batch.id, restartId)}
          />

          {batch.restartId && (
            <UserBubble at={batch.restartAt}>
              {RESTART_OPTIONS.find((option) => option.id === batch.restartId)?.label}
            </UserBubble>
          )}
        </>
      )}
    </div>
  );
}

function ChatRoundBlock({
  round,
  showIntro,
  onSelectMood,
  onSelectMore,
  onSelectRestart,
}: {
  round: ChatRound;
  showIntro: boolean;
  onSelectMood: (roundId: number, moodId: string) => void;
  onSelectMore: (roundId: number, batchId: number, moreId: MoreId) => void;
  onSelectRestart: (roundId: number, batchId: number, restartId: RestartId) => void;
}) {
  const mood = CHATBOT_MOODS.find((item) => item.id === round.moodId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      {showIntro && <BotBubble>오늘의 기분은 어떠냥?</BotBubble>}
      <BotBubble>지금 내 기분과 가장 가까운걸 골라봐!</BotBubble>

      <ChoiceBox
        options={CHATBOT_MOODS}
        selectedId={round.moodId}
        onSelect={(moodId) => onSelectMood(round.id, moodId)}
      />

      {mood && (
        <>
          <UserBubble at={round.moodAt}>
            {mood.emoji} {mood.label}
          </UserBubble>

          {mood.replyLines.map((line) => (
            <BotBubble key={line}>{line}</BotBubble>
          ))}

          {round.batches.map((batch) => (
            <RecommendationBatchBlock
              key={batch.id}
              round={round}
              batch={batch}
              onSelectMore={onSelectMore}
              onSelectRestart={onSelectRestart}
            />
          ))}
        </>
      )}
    </div>
  );
}

function Chatbot() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [rounds, setRounds] = useState<ChatRound[]>([]);
  const messagesContainerRef = useRef<HTMLElement>(null);

  const lastRound = rounds.at(-1);
  const isFinished = lastRound?.batches.at(-1)?.restartId === "end";

  useEffect(() => {
    const container = messagesContainerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [rounds]);

  // pageNo를 배치마다 다르게 줘서 "더 추천"이 매번 같은 1페이지를 반복 조회하지 않게 한다
  // (같은 페이지만 계속 받으면 excludeIds로 걸러낼 때 카페처럼 표본이 적은 카테고리는 금방 바닥난다).
  const fetchRecommendations = (
    category: PlaceCategoryCode,
    excludeIds: string[],
    pageNo: number,
  ): Promise<Place[]> =>
    areaBasedList({ category, numOfRows: RECOMMENDATION_FETCH_SIZE, pageNo }).then(
      (result) =>
        result.places
          .filter((place) => !excludeIds.includes(place.id))
          .slice(0, RECOMMENDATION_COUNT),
    );

  const updateBatch = (
    roundId: number,
    batchId: number,
    patch: Partial<RecommendationBatch>,
  ) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id !== roundId
          ? round
          : {
              ...round,
              batches: round.batches.map((batch) =>
                batch.id === batchId ? { ...batch, ...patch } : batch,
              ),
            },
      ),
    );
  };

  const handleStart = () => {
    setStarted(true);
    setRounds([createRound(0)]);
  };

  const handleSelectMood = (roundId: number, moodId: string) => {
    const mood = CHATBOT_MOODS.find((item) => item.id === moodId);
    if (!mood) {
      return;
    }

    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId && round.moodId === null
          ? { ...round, moodId, moodAt: formatNowTime(), batches: [createBatch(0)] }
          : round,
      ),
    );

    fetchRecommendations(mood.category, [], 1)
      .then((places) =>
        updateBatch(roundId, 0, { recommendations: places, status: "success" }),
      )
      .catch((error) => {
        console.error("추천 장소 조회 실패:", error);
        updateBatch(roundId, 0, { status: "error" });
      });
  };

  const handleSelectMore = (roundId: number, batchId: number, moreId: MoreId) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id !== roundId
          ? round
          : {
              ...round,
              batches: round.batches.map((batch) =>
                batch.id === batchId && batch.moreId === null
                  ? { ...batch, moreId, moreAt: formatNowTime() }
                  : batch,
              ),
            },
      ),
    );

    if (moreId !== "more") {
      return;
    }

    const round = rounds.find((item) => item.id === roundId);
    const mood = round && CHATBOT_MOODS.find((item) => item.id === round.moodId);
    if (!round || !mood) {
      return;
    }

    const excludeIds = round.batches.flatMap((batch) =>
      batch.recommendations.map((place) => place.id),
    );
    const nextBatchId = (round.batches.at(-1)?.id ?? -1) + 1;
    const nextPageNo = round.batches.length + 1;

    setRounds((prev) =>
      prev.map((item) =>
        item.id === roundId
          ? { ...item, batches: [...item.batches, createBatch(nextBatchId)] }
          : item,
      ),
    );

    fetchRecommendations(mood.category, excludeIds, nextPageNo)
      .then((places) =>
        updateBatch(roundId, nextBatchId, { recommendations: places, status: "success" }),
      )
      .catch((error) => {
        console.error("추천 장소 조회 실패:", error);
        updateBatch(roundId, nextBatchId, { status: "error" });
      });
  };

  const handleSelectRestart = (
    roundId: number,
    batchId: number,
    restartId: RestartId,
  ) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id !== roundId
          ? round
          : {
              ...round,
              batches: round.batches.map((batch) =>
                batch.id === batchId && batch.restartId === null
                  ? { ...batch, restartId, restartAt: formatNowTime() }
                  : batch,
              ),
            },
      ),
    );

    if (restartId === "restart") {
      setRounds((prev) => [...prev, createRound((prev.at(-1)?.id ?? 0) + 1)]);
    }
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF6]"
      style={{ fontFamily: '"Pretendard Variable", Pretendard, sans-serif' }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 h-[131px] shrink-0 rounded-b-[40px] bg-[#FFBB61]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전 화면으로 이동"
          className="absolute left-[9px] top-[62px] flex h-[45px] w-[48px] items-center justify-center text-white"
        >
          <IconChevronLeft className="text-white" />
        </button>

        <div className="absolute left-[58px] top-[54px] h-[62px] w-[62px] overflow-hidden rounded-full bg-white">
          <img src={solnyangProfile} alt="쏠냥이" className="h-full w-full" />
        </div>

        <span className="absolute left-[136px] top-[74px] text-[20px] font-bold leading-[22px] text-white">
          쏠냥이
        </span>

        <button
          type="button"
          aria-label="더보기"
          className="absolute left-[359px] top-[64px] text-[24px] leading-[30px] text-white"
        >
          ⋮
        </button>
      </header>

      {!started ? (
        <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-8 pb-24">
          <img
            src={solnyangHelloSun}
            alt="쏠냥이가 해를 향해 인사하는 모습"
            className="h-[180px] w-[210px] object-contain"
          />

          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xl font-bold text-[#F78903]">반갑다냐옹!</p>
            <p className="text-sm leading-relaxed text-[#754308]">
              나랑 대화하면서
              <br />
              힐링 아지트를 만들어봥
            </p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="mt-2 h-[53px] w-full max-w-[240px] rounded-[25px] bg-[#FFAC27] text-base font-bold text-white shadow-[4px_4px_4px_0px_#8A3E0F40]"
          >
            시작하기
          </button>
        </section>
      ) : (
        <section
          ref={messagesContainerRef}
          className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4"
        >
          <span className="mx-auto rounded-full border border-[#EFE6D8] bg-white px-3 py-1 text-xs text-[#A1A1A1]">
            {formatToday()}
          </span>

          {rounds.map((round, index) => (
            <ChatRoundBlock
              key={round.id}
              round={round}
              showIntro={index === 0}
              onSelectMood={handleSelectMood}
              onSelectMore={handleSelectMore}
              onSelectRestart={handleSelectRestart}
            />
          ))}

          {isFinished && (
            <BotBubble>알겠다냥. 내일도 힐링 아지트를 만들러와냥!</BotBubble>
          )}
        </section>
      )}

      {started && (
        <footer className="z-10 flex shrink-0 items-center gap-[21px] px-4 pb-6 pt-3">
          <div className="flex h-[56px] flex-1 items-center rounded-full border-2 border-[#FAC775] bg-white px-6 shadow-[4px_4px_4px_0px_#8A3E0F40]">
            <span className="text-[16px] font-semibold text-[#D9D9D9]">
              감정을 선택하세요...
            </span>
          </div>

          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#FFBB61] text-xl shadow-[4px_4px_4px_0px_#00000040]">
            🐾
          </div>
        </footer>
      )}
    </main>
  );
}

export default Chatbot;
