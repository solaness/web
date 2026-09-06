import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import ConfirmModal from "../../components/shared/ConfirmModal";
import ProfileHeader from "../../components/my/ProfileHeader";
import WbtiSummaryCard from "../../components/my/WbtiSummaryCard";
import MyMenuRow from "../../components/my/MyMenuRow";
import IconBookmark from "../../assets/icons/icon-bookmark.svg?react";
import IconProfile from "../../assets/icons/icon-profile.svg?react";
import IconLogout from "../../assets/icons/icon-logout.svg?react";
import IconWithdraw from "../../assets/icons/icon-withdraw.svg?react";
import googleLogo from "../../assets/images/google-logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useGuestWbtiType } from "../../hooks/useGuestWbtiType";
import { WBTI_TYPES } from "../../data/wbtiTypes";
import { getUserWbtiTypeId } from "../../firebase/firestore";
import type { WbtiTypeId } from "../../types/wbti";

const LOGIN_PATH = "/onboarding/login";
const EDIT_PROFILE_PATH = "/my/edit";
const FAVORITES_PATH = "/my/favorites";

function MyMain() {
  const { user, isGuest, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { guestTypeId } = useGuestWbtiType();
  const [loggedInTypeId, setLoggedInTypeId] = useState<WbtiTypeId | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // 로그인 사용자는 Firestore에서, 게스트는 useGuestWbtiType(세션스토리지)에서 유형을 가져온다.
  useEffect(() => {
    if (isGuest || !user) {
      return;
    }

    let cancelled = false;

    getUserWbtiTypeId(user.uid)
      .then((typeId) => {
        if (!cancelled) {
          setLoggedInTypeId(typeId);
        }
      })
      .catch((error) => {
        console.error("유형 정보를 불러오지 못했어요:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [user, isGuest]);

  const typeId = isGuest ? guestTypeId : loggedInTypeId;
  const typeInfo = typeId ? WBTI_TYPES[typeId] : null;

  const handleGoLogin = () => navigate(LOGIN_PATH);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleWithdrawConfirmed = async () => {
    setIsWithdrawModalOpen(false);
    setIsWithdrawing(true);

    try {
      await deleteAccount();
      navigate(LOGIN_PATH);
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      window.alert("탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <main
      className="relative mx-auto w-full max-w-[393px] overflow-x-hidden bg-[#FFFDF6]"
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 px-[19px] pt-6">
        <h1 className="text-[32px] font-bold text-[#F78903]">Solaness</h1>
      </header>

      <section className="relative z-10 flex flex-col gap-6 px-[19px] pb-8 pt-6">
        <ProfileHeader user={user} isGuest={isGuest} />

        {typeInfo && <WbtiSummaryCard typeInfo={typeInfo} />}

        <div className="flex flex-col items-center gap-3 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-4 py-4">
          <p className="text-sm font-semibold text-[#754308]">
            {isGuest ? "로그인 없이 이용중이에요" : "구글로 로그인했어요"}
          </p>

          {isGuest ? (
            // 마이페이지 전용 로그인 버튼. 공용 GoogleLoginButton과 크기/굵기가 달라 재사용하지 않고
            // 여기서 직접 그린다.
            <button
              type="button"
              onClick={handleGoLogin}
              className="flex h-[40px] w-[279px] items-center justify-center gap-2 rounded-[10px] border border-[#FFEDD1] bg-[#FFFDF4]"
            >
              <img src={googleLogo} alt="Google 로고" className="h-5 w-5" />
              <span className="text-xs text-[#333333]">로그인하기</span>
            </button>
          ) : (
            // 로그인 상태에서는 같은 자리를 로그아웃/탈퇴하기 버튼이 반씩 나눠 쓴다. 알약 하나처럼
            // 붙어 보이도록 바깥 테두리 하나에 안쪽 구분선만 넣는다 (전체 너비는 위 로그인 버튼과
            // 동일하게 279px).
            <div className="flex h-[40px] w-[279px] overflow-hidden rounded-[10px] border border-[#FFEDD1] bg-[#FFFDF4]">
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-1 border-r border-[#FFEDD1] text-xs text-[#333333]"
              >
                <IconLogout className="h-4 w-4 shrink-0" />
                로그아웃
              </button>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={isWithdrawing}
                className="flex flex-1 items-center justify-center gap-1 text-xs text-[#333333] disabled:opacity-50"
              >
                <IconWithdraw className="h-4 w-4 shrink-0" />
                {isWithdrawing ? "탈퇴 중..." : "탈퇴하기"}
              </button>
            </div>
          )}
        </div>

        <MyMenuRow
          sectionLabel="앱 설정"
          icon={IconBookmark}
          label="즐겨찾기"
          onClick={() => navigate(FAVORITES_PATH)}
        />

        <MyMenuRow
          sectionLabel="프로필 수정"
          icon={IconProfile}
          label="프로필 수정"
          onClick={() => navigate(EDIT_PROFILE_PATH)}
        />

        <p className="text-center text-xs text-[#A1A1A1]">
          이용약관 | 개인정보 처리방침
        </p>
      </section>

      {isWithdrawModalOpen && (
        <ConfirmModal
          title="정말 탈퇴하시겠어요? 😢"
          description="계정과 저장된 데이터가 모두 삭제되며 되돌릴 수 없어요"
          primaryLabel="취소"
          onPrimary={() => setIsWithdrawModalOpen(false)}
          secondaryLabel="탈퇴하기"
          onSecondary={handleWithdrawConfirmed}
        />
      )}
    </main>
  );
}

export default MyMain;
