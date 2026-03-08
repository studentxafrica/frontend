import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { RecommendedOffer, DiscountType } from "@/types/offerHooks";

interface RecommendedOffersProps {
    offers: RecommendedOffer[];
}

const RecommendedOffers: React.FC<RecommendedOffersProps> = ({ offers }) => {
    if (!offers.length) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
                <Link
                    key={offer.id}
                    to={`/offer-new/${offer.id}`} // Using the new route for consistency in this demo
                    className="group block bg-background rounded-lg overflow-hidden border border-border-subtle shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
                >
                    <div className="aspect-[4/3] relative overflow-hidden bg-background-subtle">
                        <img src={offer.coverImage} alt={offer.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                        {/* Discount Badge */}
                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur text-brand-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {offer.discountType === DiscountType.PERCENTAGE ? `${offer.discountValue}% OFF` : 'DEAL'}
                        </div>
                    </div>

                    <div className="p-4">
                        <p className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                            {offer.merchant.name}
                        </p>
                        <h4 className="font-bold text-text-primary line-clamp-2 mb-3 group-hover:text-brand-primary transition-colors">
                            {offer.title}
                        </h4>

                        <div className="flex items-center text-brand-primary text-sm font-medium mt-auto">
                            View Deal <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default RecommendedOffers;
