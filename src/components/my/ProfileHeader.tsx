import type { User } from "firebase/auth";
import { useSelectedAvatar } from "../../hooks/useSelectedAvatar";

interface ProfileHeaderProps {
  user: User | null;
  isGuest: boolean;
  /** Firestore에 저장된 닉네임. 있으면 Google 계정 이름 대신 이걸 보여준다. */
  nickname?: string | null;
  /** 프로필 수정 화면에서만 이메일도 같이 보여주고 싶을 때 켠다. */
  showEmail?: boolean;
}

const GUEST_LABEL = "게스트";
const FALLBACK_NAME = "사용자";

/**
 * 마이페이지 상단 프로필 영역. 이름은 닉네임 -> Google 계정 이름 순으로 쓰지만,
 * 사진은 "프로필 수정"으로 직접 바꾸기 전까지는 로그인/게스트 모두 동일한 기본 캐릭터
 * 이미지를 보여준다 (user.photoURL은 아직 안 쓴다).
 */
function ProfileHeader({ user, isGuest, nickname, showEmail = false }: ProfileHeaderProps) {
  const { selectedAvatar } = useSelectedAvatar();
  const avatarUrl = selectedAvatar.imageUrl;
  const displayName = isGuest
    ? GUEST_LABEL
    : nickname || user?.displayName || FALLBACK_NAME;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-[160px] w-[160px] overflow-hidden rounded-full bg-white shadow-[4px_4px_15px_0px_#FFAC27B2]">
        <img
          src={avatarUrl}
          alt={`${displayName} 프로필 사진`}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-xl font-bold text-[#333333]">{displayName}</p>
      {showEmail && !isGuest && user?.email && (
        <p className="-mt-2 text-sm text-[#A1A1A1]">{user.email}</p>
      )}
    </div>
  );
}

export default ProfileHeader;
