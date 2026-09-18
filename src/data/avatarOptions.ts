import avatar00 from "../assets/images/avatars/solnyang-avatar-00.svg";
import avatar01 from "../assets/images/avatars/solnyang-avatar-01.svg";
import avatar02 from "../assets/images/avatars/solnyang-avatar-02.svg";
import avatar03 from "../assets/images/avatars/solnyang-avatar-03.svg";
import avatar04 from "../assets/images/avatars/solnyang-avatar-04.svg";
import avatar05 from "../assets/images/avatars/solnyang-avatar-05.svg";
import avatar06 from "../assets/images/avatars/solnyang-avatar-06.svg";
import avatar07 from "../assets/images/avatars/solnyang-avatar-07.svg";
import avatar08 from "../assets/images/avatars/solnyang-avatar-08.svg";
import avatar09 from "../assets/images/avatars/solnyang-avatar-09.svg";
import avatar10 from "../assets/images/avatars/solnyang-avatar-10.svg";
import avatar11 from "../assets/images/avatars/solnyang-avatar-11.svg";

export const AVATAR_OPTIONS = [
  {
    id: "avatar-00",
    imageUrl: avatar00,
    label: "기본 쏠냥이",
  },
  {
    id: "avatar-01",
    imageUrl: avatar01,
    label: "쏠냥이 프로필 1",
  },
  {
    id: "avatar-02",
    imageUrl: avatar02,
    label: "쏠냥이 프로필 2",
  },
  {
    id: "avatar-03",
    imageUrl: avatar03,
    label: "쏠냥이 프로필 3",
  },
  {
    id: "avatar-04",
    imageUrl: avatar04,
    label: "쏠냥이 프로필 4",
  },
  {
    id: "avatar-05",
    imageUrl: avatar05,
    label: "쏠냥이 프로필 5",
  },
  {
    id: "avatar-06",
    imageUrl: avatar06,
    label: "쏠냥이 프로필 6",
  },
  {
    id: "avatar-07",
    imageUrl: avatar07,
    label: "쏠냥이 프로필 7",
  },
  {
    id: "avatar-08",
    imageUrl: avatar08,
    label: "쏠냥이 프로필 8",
  },
  {
    id: "avatar-09",
    imageUrl: avatar09,
    label: "쏠냥이 프로필 9",
  },
  {
    id: "avatar-10",
    imageUrl: avatar10,
    label: "쏠냥이 프로필 10",
  },
  {
    id: "avatar-11",
    imageUrl: avatar11,
    label: "쏠냥이 프로필 11",
  },
] as const;

export type AvatarId =
  (typeof AVATAR_OPTIONS)[number]["id"];

export const DEFAULT_AVATAR_ID: AvatarId =
  "avatar-00";

export function isAvatarId(
  value: string,
): value is AvatarId {
  return AVATAR_OPTIONS.some(
    (avatar) => avatar.id === value,
  );
}

export function getAvatarById(
  avatarId: AvatarId,
) {
  return (
    AVATAR_OPTIONS.find(
      (avatar) =>
        avatar.id === avatarId,
    ) ?? AVATAR_OPTIONS[0]
  );
}
