import type { User } from "firebase/auth";
import solnyangProfile from "../../assets/images/solnyang-profile.svg";

interface ProfileHeaderProps {
  user: User | null;
  isGuest: boolean;
}

const GUEST_LABEL = "게스트";
const FALLBACK_NAME = "사용자";

/**
 * 마이페이지 상단 프로필 영역. 이름은 로그인 사용자의 Google 계정 이름을 쓰지만,
 * 사진은 "프로필 수정"으로 직접 바꾸기 전까지는 로그인/게스트 모두 동일한 기본 캐릭터
 * 이미지를 보여준다 (user.photoURL은 아직 안 쓴다).
 */
function ProfileHeader({ user, isGuest }: ProfileHeaderProps) {
  const avatarUrl = solnyangProfile;
  const displayName = isGuest ? GUEST_LABEL : user?.displayName ?? FALLBACK_NAME;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-[160px] w-[160px] overflow-hidden rounded-full bg-white shadow-[0px_0px_10px_4px_#FAC77540]">
        <img
          src={avatarUrl}
          alt={`${displayName} 프로필 사진`}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-xl font-bold text-[#333333]">{displayName}</p>
    </div>
  );
}

export default ProfileHeader;
