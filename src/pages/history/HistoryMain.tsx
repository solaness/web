import { useAuth } from "../../contexts/AuthContext";
import GuestNotice from "../../components/shared/GuestNotice";

function HistoryMain() {
  const { isGuest } = useAuth();

  if (isGuest) {
    return <GuestNotice message="기록은 로그인 후 확인할 수 있어요" />;
  }

  return <div className="p-4">기록 메인</div>;
}

export default HistoryMain;
