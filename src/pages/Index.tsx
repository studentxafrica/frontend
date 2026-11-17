import { useState } from "react";
import AnnouncementStrip from "@/components/AnnouncementStrip";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCoupons from "@/components/FeaturedCoupons";
import LatestOffers from "@/components/LatestCoupons";
import Footer from "@/components/Footer";
import CampaignBanner from "@/components/drops/CampaignBanner";

const Index = () => {
  const [stripVisible, setStripVisible] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <AnnouncementStrip onVisibilityChange={setStripVisible} />
      <Header offsetTop={stripVisible} />
      {/* The promise, what's on now, then the offers */}
      <main className="flex w-full flex-grow flex-col">
        <Hero />
        <CampaignBanner />
        <FeaturedCoupons />
        <LatestOffers />
      </main>
      {/* Footer carries the closing sign-up CTA, so every page ends on it */}
      <Footer />
    </div>
  );
};

export default Index;
