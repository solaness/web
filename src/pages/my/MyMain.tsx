import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function MyMain() {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  const handleSave = () => {
    if (isGuest) {
      navigate("/onboarding/login");
      return;
    }

    // TODO: 실제 저장 로직은 이후 작업에서 구현
  };

  return (
    <div className="p-4">
      <p>마이페이지</p>
      <button
        onClick={handleSave}
        className="mt-4 rounded-[25px] bg-[#FFAC27] px-6 py-2 text-sm font-bold text-white"
      >
        저장
      </button>
      {isGuest && (
        <p className="mt-2 text-xs text-gray-400">
          로그인하면 저장 기능을 사용할 수 있어요
        </p>
      )}
    </div>
  );
}

export default MyMain;
