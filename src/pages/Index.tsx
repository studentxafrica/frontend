import { useState } from "react";
import AnnouncementStrip from "@/components/AnnouncementStrip";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCoupons from "@/components/FeaturedCoupons";
import LatestOffers from "@/components/LatestCoupons";
import Footer from "@/components/Footer";
import CampaignPopup from "@/components/drops/CampaignPopup";

const Index = () => {
  const [stripVisible, setStripVisible] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <AnnouncementStrip onVisibilityChange={setStripVisible} />
      <Header offsetTop={stripVisible} />
      {/* The promise, then the offers; what's on now arrives as a pop-up */}
      <main className="flex w-full flex-grow flex-col">
        <Hero />
        <FeaturedCoupons />
        <LatestOffers />
      </main>
      {/* Footer carries the closing sign-up CTA, so every page ends on it */}
      <Footer />
      <CampaignPopup />
    </div>
  );
};

export default Index;
