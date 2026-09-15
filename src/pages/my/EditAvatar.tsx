import AppTitle from "../../components/shared/AppTitle";
import BackgroundBlobs from "../../components/shared/BackgroundBlobs";
import { useGoBack } from "../../hooks/useGoBack";

function EditAvatar() {
  const goBack = useGoBack("/my/edit");

  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-md overflow-hidden bg-[#FFFDF6] px-[19px] pb-28 pt-6"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="relative z-10 flex h-[78px] items-center">
        <AppTitle
          onBack={goBack}
          titleClassName="text-[24px] font-bold text-[#F78903]"
        />
      </header>

      <section className="relative z-10 mt-[27px] flex h-[187px] w-full flex-col items-center justify-center rounded-[20px] border border-[#FFAC27] bg-[#FFFDF4] px-5 text-center shadow-[4px_4px_6px_0_#FFE2B2]">
        <p className="text-[18px] font-bold leading-[26px] text-[#754308]">
          아직 기능 업데이트 전이에요
        </p>

        <p className="mt-[6px] text-[14px] leading-[20px] text-[#939393]">
          조금만 기다려 주세요 🐱
        </p>
      </section>
    </main>
  );
}

export default EditAvatar;