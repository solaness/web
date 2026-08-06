import { useNavigate } from "react-router-dom";

interface GuestNoticeProps {
  message?: string;
}

export default function GuestNotice({
  message = "로그인이 필요한 기능이에요",
}: GuestNoticeProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-base font-bold text-gray-800">{message}</p>
      <button
        onClick={() => navigate("/onboarding/login")}
        className="rounded-[25px] bg-[#FFAC27] px-6 py-3 text-sm font-bold text-white"
      >
        로그인하러 가기
      </button>
    </div>
  );
}
