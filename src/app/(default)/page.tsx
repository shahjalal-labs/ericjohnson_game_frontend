import DownloadAppsSection from "@/components/home/DownloadAppsSection";
import GamesSection from "@/components/home/GameSection";

import HeroSection from "@/components/home/HeroSection";

function page() {
  return (
    <div className="relative min-h-screen w-full bg-black font-serif overflow-x-hidden">
      {/* Background gradients from StartGame */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]" />
      

      <div className="relative z-10">
        <HeroSection />
        <GamesSection />
        <div className="pb-20">
          <DownloadAppsSection />
        </div>
      </div>
    </div>
  );
}

export default page;
