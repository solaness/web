import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  useAuth,
} from "../../contexts/AuthContext";

function HistoryMain() {
  const navigate = useNavigate();

  const {
    isGuest,
  } = useAuth();

  if (isGuest) {
    return (
      <Navigate
        to="/history/calendar"
        replace
      />
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[393px] bg-[#FFFDF6] px-[23px] pb-28 pt-5">
      <header>
        <h1 className="text-[24px] font-bold text-[#F78903]">
          Solaness
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="text-[20px] font-bold text-black">
          기록
        </h2>

        <button
          type="button"
          className="mt-5 h-[53px] w-full rounded-[25px] bg-[#FFAC27] text-[16px] font-bold text-white"
          onClick={() =>
            navigate(
              "/history/calendar",
            )
          }
        >
          캘린더 보기
        </button>
      </section>
    </main>
  );
}

export default HistoryMain;