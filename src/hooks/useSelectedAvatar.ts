import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_AVATAR_ID,
  getAvatarById,
  isAvatarId,
  type AvatarId,
} from "../data/avatarOptions";
import { useAuth } from "../contexts/AuthContext";
import { updateAvatarId } from "../firebase/firestore";

const STORAGE_KEY =
  "solaness:selected-avatar-id";

const AVATAR_CHANGE_EVENT =
  "solaness:avatar-change";

interface AvatarChangeDetail {
  avatarId: AvatarId;
  ownerKey: string;
}

function readGuestAvatarId(): AvatarId {
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

export function useSelectedAvatar(accountAvatarId?: AvatarId) {
  const { user, isGuest } = useAuth();
  const ownerKey = isGuest || !user ? "guest" : user.uid;
  const ownerKeyRef = useRef(ownerKey);
  ownerKeyRef.current = ownerKey;
  const [
    selectedAvatarId,
    setSelectedAvatarId,
  ] = useState<AvatarId>(
    () =>
      isGuest
        ? readGuestAvatarId()
        : accountAvatarId ?? DEFAULT_AVATAR_ID,
  );

  useEffect(() => {
    if (isGuest) {
      setSelectedAvatarId(readGuestAvatarId());
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
      setSelectedAvatarId(
        accountAvatarId ?? DEFAULT_AVATAR_ID,
      );
    }

    const syncSelectedAvatar = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        typeof event.detail === "object" &&
        event.detail !== null
      ) {
        const detail = event.detail as Partial<AvatarChangeDetail>;

        if (
          detail.ownerKey === ownerKey &&
          typeof detail.avatarId === "string" &&
          isAvatarId(detail.avatarId)
        ) {
          setSelectedAvatarId(detail.avatarId);
        }

        return;
      }

      if (isGuest) {
        setSelectedAvatarId(readGuestAvatarId());
      }
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
  }, [accountAvatarId, isGuest, ownerKey]);

  const selectAvatar = useCallback(
    async (avatarId: AvatarId) => {
      const requestedOwnerKey = ownerKey;

      if (isGuest || !user) {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          avatarId,
        );
      } else {
        await updateAvatarId(user.uid, avatarId);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }

      if (ownerKeyRef.current !== requestedOwnerKey) {
        return;
      }

      setSelectedAvatarId(avatarId);

      window.dispatchEvent(
        new CustomEvent(
          AVATAR_CHANGE_EVENT,
          {
            detail: {
              avatarId,
              ownerKey: requestedOwnerKey,
            } satisfies AvatarChangeDetail,
          },
        ),
      );
    },
    [isGuest, ownerKey, user],
  );

  const selectedAvatar =
    getAvatarById(selectedAvatarId);

  return {
    selectedAvatarId,
    selectedAvatar,
    selectAvatar,
  };
}
