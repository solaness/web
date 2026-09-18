import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import GuestNotice from "../../components/shared/GuestNotice";
import ProfileHeader from "../../components/my/ProfileHeader";
import MyMenuRow from "../../components/my/MyMenuRow";
import AvatarBottomSheet from "../../components/my/AvatarBottomSheet";
import IconProfile from "../../assets/icons/icon-profile.svg?react";
import IconEdit from "../../assets/icons/icon-edit.svg?react";
import IconPhoto from "../../assets/icons/icon-photo.svg?react";
import IconRecheck from "../../assets/icons/icon-recheck.svg?react";
import IconLocation from "../../assets/icons/icon-location.svg?react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useSelectedAvatar } from "../../hooks/useSelectedAvatar";
import { updateNickname } from "../../firebase/firestore";
import type { AvatarId } from "../../data/avatarOptions";

const MY_PATH = "/my";
const WBTI_RETAKE_PATH = "/my/edit/wbti/1";
const REGION_EDIT_PATH = "/my/edit/region";
const NICKNAME_MAX_LENGTH = 12;

function EditProfile() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: isFetchingProfile } = useUserProfile();
  const { selectedAvatarId, selectAvatar } = useSelectedAvatar();

  const [nicknameInput, setNicknameInput] = useState("");
  const [initialNickname, setInitialNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);
  const [draftAvatarId, setDraftAvatarId] =
    useState<AvatarId>(selectedAvatarId);
  // 프리필이 늦게 도착했을 때, 그 사이 사용자가 이미 입력을 시작했다면 타이핑을 덮어쓰지
  // 않기 위한 플래그.
  const hasEditedNicknameRef = useRef(false);

  const handleOpenAvatarSheet = () => {
    setDraftAvatarId(selectedAvatarId);
    setIsAvatarSheetOpen(true);
  };

  const handleConfirmAvatar = () => {
    selectAvatar(draftAvatarId);
    setIsAvatarSheetOpen(false);
  };

  // 닉네임 프리필: 저장된 닉네임이 있으면 그걸, 없으면 Google 계정 이름을 초깃값으로 보여준다.
  useEffect(() => {
    if (isGuest || !user || isFetchingProfile) {
      return;
    }

    const resolved = profile?.nickname || user.displayName || "";
    // "바뀐 게 없으면 저장 생략" 판단 기준(initialNickname)은 사용자의 타이핑 여부와
    // 무관하게 서버 값으로 항상 맞춰두고, 실제 입력창 값만 아직 안 건드렸을 때만 채운다.
    setInitialNickname(resolved);

    if (!hasEditedNicknameRef.current) {
      setNicknameInput(resolved);
    }
  }, [isGuest, user, isFetchingProfile, profile]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const trimmed = nicknameInput.trim();

    if (!trimmed) {
      setSaveError("닉네임을 입력해 주세요.");
      return;
    }

    if (trimmed === initialNickname) {
      // 안 바뀐 경우 굳이 쓰기 요청을 보내지 않는다.
      navigate(MY_PATH);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateNickname(user.uid, trimmed);
      navigate(MY_PATH);
    } catch (error) {
      console.error("닉네임 저장 실패:", error);
      setSaveError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      className={`relative mx-auto w-full max-w-md overflow-x-hidden bg-[#FFFDF6] ${
        isGuest ? "h-[100dvh]" : ""
      }`}
      style={{
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 px-[19px] pt-6">
        <h1 className="text-[32px] font-bold text-[#F78903]">Solaness</h1>
      </header>

      {isGuest ? (
        <div className="relative z-10 flex flex-col gap-6 px-[19px] pt-6">
          <MyMenuRow
            sectionLabel="프로필 사진 변경"
            icon={IconPhoto}
            label="쏠냥이 선택하기"
            onClick={handleOpenAvatarSheet}
            arrowVariant="circle"
          />
          <GuestNotice message="프로필 수정은 로그인 후 이용할 수 있어요" />
        </div>
      ) : (
        <section className="relative z-10 flex flex-col gap-6 px-[19px] pb-8 pt-6">
          <ProfileHeader user={user} isGuest={isGuest} nickname={initialNickname} showEmail />

          <div>
            <p className="mb-2 text-sm font-semibold text-[#754308]">닉네임 변경</p>
            <div className="flex h-[42px] w-full items-center gap-3 rounded-[16px] border border-[#FFAC27] bg-[#FFFDF4] px-4">
              <IconProfile className="h-5 w-5 shrink-0 text-[#FFAC27]" />
              <input
                value={nicknameInput}
                onChange={(event) => {
                  hasEditedNicknameRef.current = true;
                  setNicknameInput(event.target.value);
                }}
                maxLength={NICKNAME_MAX_LENGTH}
                placeholder="닉네임을 입력해 주세요"
                className="flex-1 bg-transparent text-sm font-medium text-[#4F4F4F] outline-none placeholder:text-[#D9D9D9]"
              />
              <IconEdit className="h-5 w-5 shrink-0 text-[#FFAC27]" />
            </div>
          </div>

          <MyMenuRow
            sectionLabel="프로필 사진 변경"
            icon={IconPhoto}
            label="쏠냥이 선택하기"
            onClick={handleOpenAvatarSheet}
            arrowVariant="circle"
          />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#754308]">기타</p>
            <MyMenuRow
              icon={IconRecheck}
              label="WBTI 유형 재검사"
              onClick={() => navigate(WBTI_RETAKE_PATH)}
              arrowVariant="circle"
            />
            <MyMenuRow
              icon={IconLocation}
              label="지역 수정"
              onClick={() => navigate(REGION_EDIT_PATH)}
              arrowVariant="circle"
            />
          </div>

          {saveError && (
            <p role="alert" className="text-center text-sm font-bold text-red-500">
              {saveError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-base font-bold text-white shadow-[4px_4px_4px_0px_#8A3E0F40] disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "변경사항 저장하기"}
          </button>
        </section>
      )}

      <AvatarBottomSheet
        open={isAvatarSheetOpen}
        selectedAvatarId={draftAvatarId}
        isGuest={isGuest}
        onSelect={setDraftAvatarId}
        onConfirm={handleConfirmAvatar}
        onClose={() => setIsAvatarSheetOpen(false)}
      />
    </main>
  );
}

export default EditProfile;
