import * as React from "react";
import Header from "@/components/Header";
import AnnouncementStrip from "@/components/AnnouncementStrip";
import Hero from "@/components/Hero";
import CategoryList from "@/components/CategoryList";
import FeaturedCoupons from "@/components/FeaturedCoupons";
import StudentOwnedOffers from "@/components/StudentOwnedOffers";
import HowItWorks from "@/components/HowItWorks";
import LatestOffers from "@/components/LatestCoupons";
import ProviderHighlights from "@/components/ProviderHighlights";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import CampaignBanner from "@/components/drops/CampaignBanner";

const Index = () => {
  const [stripVisible, setStripVisible] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <AnnouncementStrip onVisibilityChange={setStripVisible} />
      <Header offsetTop={stripVisible} />
      {/* Order runs: the promise, then the goods, then how to get them, then who vouches for it */}
      <main className="flex w-full flex-grow flex-col">
        <Hero />
        <CampaignBanner />
        <FeaturedCoupons />
        <CategoryList />
        <LatestOffers />
        <StudentOwnedOffers />
        <HowItWorks />
        <ProviderHighlights />
        <TestimonialsSection />
      </main>
      {/* Footer carries the closing sign-up CTA, so every page ends on it */}
      <Footer />
    </div>
  );
};

export default Index;
