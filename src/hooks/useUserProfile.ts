import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, type UserProfile } from "../firebase/firestore";

/**
 * 로그인 사용자의 Firestore users/{uid} 문서(닉네임/지역/유형)를 한 번 읽어온다.
 * MyMain, EditProfile, EditRegion이 각자 따로 getUserProfile을 호출하면서 cancelled
 * 플래그·에러 로깅을 중복 구현하던 걸 여기로 모았다. 게스트/비로그인이면 fetch 자체를
 * 안 하고 profile을 null로 둔다.
 */
export function useUserProfile() {
  const { user, isGuest } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // 첫 렌더 시점에 이미 게스트/비로그인인지 알 수 있으니, 그 경우는 애초에 로딩 상태로
  // 시작하지 않는다 (스켈레톤이 게스트한테 잠깐이라도 깜빡이는 걸 방지).
  const [isLoading, setIsLoading] = useState(() => !isGuest && Boolean(user));

  useEffect(() => {
    if (isGuest || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getUserProfile(user.uid)
      .then((result) => {
        if (!cancelled) {
          setProfile(result);
        }
      })
      .catch((error) => {
        console.error("프로필 정보를 불러오지 못했어요:", error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, isGuest]);

  return { profile, isLoading };
}
