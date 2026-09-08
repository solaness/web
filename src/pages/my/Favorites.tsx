import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import ConfirmModal from "../../components/shared/ConfirmModal";
import FavoriteTicketRow from "../../components/my/FavoriteTicketRow";
import { useAuth } from "../../contexts/AuthContext";
import { SAMPLE_FAVORITES } from "../../data/favorites";
import type { DailyActivity } from "../../data/historyCalendar";

const TOAST_DURATION_MS = 2000;

function Favorites() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  // user 객체 참조가 아니라 uid로만 비교한다 — 다른 탭에서의 재인증 등으로
  // onAuthStateChanged가 동일 계정의 새 user 객체를 다시 흘려보내도 이 값은
  // 그대로라, 세션 중 삭제한 즐겨찾기가 아래 useEffect에 의해 되살아나지 않는다.
  const userId = user?.uid ?? null;

  const initialFavorites = useMemo(() => {
    if (isGuest || !userId) {
      return [];
    }

    return SAMPLE_FAVORITES;
  }, [isGuest, userId]);

  const [favorites, setFavorites] = useState<DailyActivity[]>(initialFavorites);
  const [pendingDelete, setPendingDelete] = useState<DailyActivity | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  // 한 번에 하나의 티켓만 스와이프로 열려있게 한다 — id를 들고 있다가 다른 티켓이
  // 열리면 이전 티켓엔 isOpen=false가 내려가서 스스로 닫힌다.
  const [openFavoriteId, setOpenFavoriteId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleSelectFavorite = (activity: DailyActivity) => {
    navigate(`/map/${activity.placeId}`);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    setFavorites((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    setOpenFavoriteId((current) => (current === pendingDelete.id ? null : current));

    setShowDeleteToast(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setShowDeleteToast(false);
    }, TOAST_DURATION_MS);
  };

  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6] px-[24px] pb-28 pt-5"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 h-[78px] overflow-hidden">
        <h1 className="relative z-10 text-[24px] font-bold leading-[30px] text-[#F78903]">
          Solaness
        </h1>
      </header>

      <section className="relative z-10 mt-[27px]" aria-label="즐겨찾기 목록">
        {favorites.length > 0 ? (
          <div className="flex flex-col gap-[12px]">
            {favorites.map((activity) => (
              <FavoriteTicketRow
                key={activity.id}
                activity={activity}
                isOpen={openFavoriteId === activity.id}
                onOpenChange={(open) =>
                  setOpenFavoriteId(open ? activity.id : null)
                }
                onSelect={handleSelectFavorite}
                onRequestDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex h-[187px] w-full items-center justify-center rounded-[20px] border border-[#FFAC27] bg-white px-5 text-center"
            style={{
              boxShadow: "4px 4px 6px 0 #FFE2B2",
            }}
          >
            <p className="text-[17px] font-bold leading-[24px] text-[#754308]">
              아직 즐겨찾기한 장소가 없어요 🥺
            </p>
          </div>
        )}
      </section>

      {pendingDelete && (
        <ConfirmModal
          title="장소를 삭제하실건가요?"
          description="삭제된 기록은 복구되지 않아요"
          primaryLabel="삭제하기"
          onPrimary={handleConfirmDelete}
          secondaryLabel="나가기"
          onSecondary={() => setPendingDelete(null)}
        />
      )}

      {showDeleteToast && (
        <div className="fixed inset-x-0 bottom-[100px] z-40 flex justify-center px-6">
          <div
            role="status"
            className="flex h-[58px] w-full max-w-[345px] items-center justify-center rounded-[25px] bg-[#FD9419] shadow-[4px_4px_4px_0_rgba(138,62,15,0.25)]"
          >
            <p className="text-[24px] font-bold text-white">장소를 삭제했어요</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default Favorites;
