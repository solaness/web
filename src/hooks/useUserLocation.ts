import { useEffect, useState } from "react";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export type UserLocationStatus = "loading" | "success" | "error";

export interface UserLocationState {
  coords: UserCoordinates | null;
  status: UserLocationStatus;
  // GeolocationPositionError.code: 1=권한 거부, 2=위치 확인 불가, 3=타임아웃.
  // 브라우저가 geolocation 자체를 지원하지 않으면 null로 둔다.
  errorCode: number | null;
}

const GEOLOCATION_TIMEOUT_MS = 10_000;
// 새로고침마다 다시 요청하지 않도록, 이 시간 이내 브라우저가 갖고 있던 위치는 그대로 재사용한다.
const GEOLOCATION_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * 지도 화면의 "근처에서 가볼만한 곳"에 쓸 사용자의 실제 위치를 가져온다.
 * 컴포넌트 마운트 시 한 번만 요청하고(권한 프롬프트도 그때 한 번), 이후로는
 * 성공/실패 결과를 그대로 들고 있는다 — 검색을 여러 번 해도 위치 권한을 매번 다시 묻지 않는다.
 */
export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    coords: null,
    status: "loading",
    errorCode: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ coords: null, status: "error", errorCode: null });
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          status: "success",
          errorCode: null,
        });
      },
      (error) => {
        if (cancelled) return;
        setState({ coords: null, status: "error", errorCode: error.code });
      },
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
