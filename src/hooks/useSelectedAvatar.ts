import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_AVATAR_ID,
  getAvatarById,
  isAvatarId,
  type AvatarId,
} from "../data/avatarOptions";

const STORAGE_KEY =
  "solaness:selected-avatar-id";

const AVATAR_CHANGE_EVENT =
  "solaness:avatar-change";

function readSelectedAvatarId(): AvatarId {
  if (typeof window === "undefined") {
    return DEFAULT_AVATAR_ID;
  }

  const savedAvatarId =
    window.sessionStorage.getItem(
      STORAGE_KEY,
    );

  return savedAvatarId &&
    isAvatarId(savedAvatarId)
    ? savedAvatarId
    : DEFAULT_AVATAR_ID;
}

export function useSelectedAvatar() {
  const [
    selectedAvatarId,
    setSelectedAvatarId,
  ] = useState<AvatarId>(
    readSelectedAvatarId,
  );

  useEffect(() => {
    const syncSelectedAvatar = () => {
      setSelectedAvatarId(
        readSelectedAvatarId(),
      );
    };

    window.addEventListener(
      AVATAR_CHANGE_EVENT,
      syncSelectedAvatar,
    );

    window.addEventListener(
      "storage",
      syncSelectedAvatar,
    );

    return () => {
      window.removeEventListener(
        AVATAR_CHANGE_EVENT,
        syncSelectedAvatar,
      );

      window.removeEventListener(
        "storage",
        syncSelectedAvatar,
      );
    };
  }, []);

  const selectAvatar = useCallback(
    (avatarId: AvatarId) => {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        avatarId,
      );

      setSelectedAvatarId(avatarId);

      window.dispatchEvent(
        new Event(
          AVATAR_CHANGE_EVENT,
        ),
      );
    },
    [],
  );

  const selectedAvatar =
    getAvatarById(selectedAvatarId);

  return {
    selectedAvatarId,
    selectedAvatar,
    selectAvatar,
  };
}