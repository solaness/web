import googleLogo from "../../assets/images/google-logo-color.svg";

const buttonStyle =
  "flex h-[53px] w-full max-w-[322px] items-center justify-center gap-2 rounded-[25px] text-[14px] font-bold leading-[22px]";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
}

export default function GoogleLoginButton({
  onClick,
  isLoading = false,
  label = "Google로 로그인",
}: GoogleLoginButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`${buttonStyle} border-[0.5px] border-[#FFAC27] bg-white text-black shadow-[4px_4px_4px_0px_#FAC775] disabled:opacity-50`}
    >
      <img src={googleLogo} alt="Google 로고" className="h-5 w-5" />
      {isLoading ? "로그인 중..." : label}
    </button>
  );
}
