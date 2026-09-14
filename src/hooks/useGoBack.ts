import { useNavigate } from "react-router-dom";

/**
 * navigate(-1) 대신 쓰는 뒤로가기. 이 화면이 북마크/공유 링크/PWA 바로가기처럼
 * 브라우저 히스토리의 첫 항목으로 열렸을 수 있는데, 그 상태에서 navigate(-1)은
 * 아무 동작도 안 하거나 앱 밖으로 나가버린다. history.state.idx(react-router가
 * 매 엔트리에 붙이는 순번)가 0이면 이전 엔트리가 없다는 뜻이므로 fallback으로 보낸다.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();

  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
