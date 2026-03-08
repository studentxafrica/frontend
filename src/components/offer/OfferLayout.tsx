import React from "react";

interface OfferLayoutProps {
    hero: React.ReactNode;
    claimCard: React.ReactNode;
    recommendations: React.ReactNode;
}

const OfferLayout: React.FC<OfferLayoutProps> = ({ hero, claimCard, recommendations }) => {
    return (
        <div className="min-h-screen bg-background-lighter font-sans text-text-primary pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Hero & Details */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        {hero}
                        <div className="hidden lg:block pt-12">
                            {/* Desktop Recommendations placement if desired, or keep separate */}
                        </div>
                    </div>

                    {/* Right Column: Sticky Claim Card */}
                    <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 z-10">
                        {claimCard}
                    </div>
                </div>

                {/* Recommendations Section (Full width on mobile, typically below or aside) */}
                <div className="mt-16 lg:mt-24">
                    <h3 className="text-2xl font-bold text-text-primary mb-6">
                        More offers you might like
                    </h3>
                    {recommendations}
                </div>
            </main>
        </div>
    );
};

export default OfferLayout;
