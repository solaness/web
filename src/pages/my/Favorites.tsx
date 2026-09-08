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

  const initialFavorites = useMemo(() => {
    if (isGuest || !user) {
      return [];
    }

    return SAMPLE_FAVORITES;
  }, [isGuest, user]);

  const [favorites, setFavorites] = useState<DailyActivity[]>(initialFavorites);
  const [pendingDelete, setPendingDelete] = useState<DailyActivity | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
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
