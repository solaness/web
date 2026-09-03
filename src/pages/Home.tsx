import RecommendList from "../components/home/RecommendList";
import SunshineCardSlider from "../components/home/SunshineCardSlider";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";
import {
  HOME_RECOMMENDATIONS,
} from "../data/homeRecommendations";

function Home() {
  return (
    <main
      className="relative mx-auto min-h-[852px] w-full max-w-[393px] overflow-hidden bg-[#FFFDF6] px-[11px] pb-28 pt-5"
      style={{
        fontFamily:
          '"Pretendard Variable", Pretendard, sans-serif',
      }}
    >
      <BackgroundBlobs />

      <header className="mb-5">
        <h1 className="text-[24px] font-bold text-[#F78903]">
          Solaness
        </h1>
      </header>

      <SunshineCardSlider />

      <RecommendList
        places={HOME_RECOMMENDATIONS}
      />
    </main>
  );
}

export default Home;