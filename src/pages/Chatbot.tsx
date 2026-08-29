import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import IconChevronLeft from "../assets/icons/icon-chevron-left.svg?react";
import IconPin from "../assets/icons/icon-pin.svg?react";
import solnyangHelloSun from "../assets/images/solnyang-hello-sun.png";
import solnyangProfile from "../assets/images/solnyang-profile.png";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";
import { CHATBOT_MOODS } from "../data/chatbotMoods";
import type { Place } from "../types/place";

const FOLLOWUP_OPTIONS = [
  { id: "more", label: "응!" },
  { id: "done", label: "아니 괜찮아!" },
] as const;

type FollowupId = (typeof FOLLOWUP_OPTIONS)[number]["id"];

interface ChatRound {
  id: number;
  moodId: string | null;
  moodAt: string | null;
  followupId: FollowupId | null;
  followupAt: string | null;
}

function createRound(id: number): ChatRound {
  return { id, moodId: null, moodAt: null, followupId: null, followupAt: null };
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

/** 기분/후속 질문 공용 선택지 박스. 한 번 고르면(selectedId가 생기면) 그 라운드의 선택지는 고정되어 더 이상 클릭할 수 없다. */
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

function ChatRoundBlock({
  round,
  showIntro,
  onSelectMood,
  onSelectFollowup,
}: {
  round: ChatRound;
  showIntro: boolean;
  onSelectMood: (roundId: number, moodId: string) => void;
  onSelectFollowup: (roundId: number, followupId: FollowupId) => void;
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

          <div className="rounded-2xl border border-[#FFAC27] bg-white p-3">
            <p className="mb-2 text-sm font-bold text-[#F78903]">오늘의 추천</p>
            <div className="grid grid-cols-2 gap-2">
              {mood.recommendations.map((place) => (
                <RecommendationThumb key={place.id} place={place} />
              ))}
            </div>
          </div>

          <BotBubble>추천 이후에 추가로 더 추천해줄까?</BotBubble>

          <ChoiceBox
            options={FOLLOWUP_OPTIONS}
            selectedId={round.followupId}
            onSelect={(followupId) => onSelectFollowup(round.id, followupId)}
          />

          {round.followupId && (
            <UserBubble at={round.followupAt}>
              {FOLLOWUP_OPTIONS.find((option) => option.id === round.followupId)?.label}
            </UserBubble>
          )}
        </>
      )}
    </div>
  );
}

function Chatbot() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [rounds, setRounds] = useState<ChatRound[]>([]);

  const isFinished = rounds.at(-1)?.followupId === "done";

  const handleStart = () => {
    setStarted(true);
    setRounds([createRound(0)]);
  };

  const handleSelectMood = (roundId: number, moodId: string) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === roundId && round.moodId === null
          ? { ...round, moodId, moodAt: formatNowTime() }
          : round,
      ),
    );
  };

  const handleSelectFollowup = (roundId: number, followupId: FollowupId) => {
    setRounds((prev) => {
      const updated = prev.map((round) =>
        round.id === roundId && round.followupId === null
          ? { ...round, followupId, followupAt: formatNowTime() }
          : round,
      );

      if (followupId === "more") {
        const nextId = (prev.at(-1)?.id ?? 0) + 1;
        return [...updated, createRound(nextId)];
      }

      return updated;
    });
  };

  return (
    <main
      className="relative mx-auto flex h-[100dvh] min-h-[600px] w-full max-w-[393px] flex-col overflow-hidden bg-[#FFFDF6]"
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

        <img
          src={solnyangProfile}
          alt="쏠냥이"
          className="absolute left-[58px] top-[54px] h-[62px] w-[62px]"
        />

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
        <section className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4">
          <span className="mx-auto rounded-full border border-[#EFE6D8] bg-white px-3 py-1 text-xs text-[#A1A1A1]">
            {formatToday()}
          </span>

          {rounds.map((round, index) => (
            <ChatRoundBlock
              key={round.id}
              round={round}
              showIntro={index === 0}
              onSelectMood={handleSelectMood}
              onSelectFollowup={handleSelectFollowup}
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
