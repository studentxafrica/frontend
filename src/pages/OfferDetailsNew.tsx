import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";
import OfferLayout from "@/components/offer/OfferLayout";
import OfferHero from "@/components/offer/OfferHero";
import ClaimCard from "@/components/offer/ClaimCard";
import RecommendedOffers from "@/components/offer/RecommendedOffers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OfferDetails, AvailableClaims, CouponClaimSuccessData, RecommendedOffer } from "@/types/offerHooks";
import { Loader2 } from "lucide-react";

// Mock data fallback if API fails (for development/demo purposes)
// In a real scenario, we'd rely solely on the API or have a robust mock server.
const MOCK_OFFER: OfferDetails = {
    id: "1",
    title: "50% Off Premium Coffee Subscription",
    description: "Get half off your first 3 months of our premium single-origin coffee bean subscription. Delivered fresh to your door every week.",
    coverImage: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000",
    discountType: "percentage" as any,
    discountValue: 50,
    currency: "USD",
    usage_type: "single_use" as any,
    merchant: {
        id: "m1",
        name: "Bean & Brew",
        logo: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=100",
        website: "https://example.com"
    },
    coupons: { total: 500, redeemed: 120, claimed: 150 },
    status: "active",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    termsAndConditions: "<p>Valid for new customers only. Cannot be combined with other offers.</p>"
};

const OfferDetailsNew: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State
    const [offer, setOffer] = useState<OfferDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailableClaims | null>(null);
    const [recs, setRecs] = useState<RecommendedOffer[]>([]);

    // Claim State
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [claimedCoupon, setClaimedCoupon] = useState<CouponClaimSuccessData | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch for offer details and availability/recs

                // 1. Get Offer Details
                const offerRes = await axiosInstance.get(`/offer/${id} `);
                const offerData = offerRes.data.data || offerRes.data;
                setOffer(offerData);

                // 2. Get Availability
                try {
                    const availRes = await axiosInstance.get(`/ offer / ${id}/available-claims`);
                    setAvailability(availRes.data.data || availRes.data);
                } catch (e) {
                    console.warn("Failed to fetch availability", e);
                }

                // 3. Get Recommendations
                try {
                    const recRes = await axiosInstance.get(`/offer/recommended?limit=4`);
                    setRecs(recRes.data.data || recRes.data);
                } catch (e) {
                    console.warn("Failed to fetch recommendations", e);
                }

            } catch (error) {
                console.error("Error fetching offer:", error);
                toast({
                    title: "Could not load offer",
                    description: "Please check your connection and try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleClaim = async () => {
        if (!offer) return;
        setClaiming(true);
        setClaimError(null);

        try {
            const res = await axiosInstance.post(`/offer/${offer.id}/coupons/create`);
            const data = res.data.data || res.data;
            setClaimedCoupon(data);

            // Refresh availability stats
            try {
                const availRes = await axiosInstance.get(`/offer/${offer.id}/available-claims`);
                setAvailability(availRes.data.data || availRes.data);
            } catch (ignore) { }

            toast({
                title: "Coupon Claimed!",
                description: "Your code is ready to use.",
                variant: "default" // or success if available
            });

        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to claim coupon";
            setClaimError(msg);
            toast({
                title: "Claim Failed",
                description: msg,
                variant: "destructive"
            });
        } finally {
            setClaiming(false);
        }
    };

    const handleSave = async () => {
        if (!offer) return;
        try {
            // Optimistic update could happen here
            await axiosInstance.post(`/offer/${offer.id}/save`);
            toast({ title: "Offer Saved" });
            // Toggle local state if we tracked isSaved in the offer object
        } catch (e) {
            toast({ title: "Could not save offer", variant: "destructive" });
        }
    };

    const handleShare = async () => {
        if (!offer) return;
        if (navigator.share) {
            navigator.share({
                title: offer.title,
                text: offer.description,
                url: window.location.href
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: "Link copied to clipboard" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background-lighter">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="min-h-screen flex flex-col bg-background-lighter">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Offer Not Found</h2>
                    <p className="text-text-secondary mb-6">This offer may have expired or does not exist.</p>
                    <button onClick={() => navigate('/deals')} className="text-brand-primary font-medium hover:underline">
                        Back to Deals
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-lighter">
            <Header />
            <div className="flex-grow pt-20">
                <OfferLayout
                    hero={
                        <OfferHero
                            offer={offer}
                            onSave={handleSave}
                            onShare={handleShare}
                            isSaved={false} // TODO: Add isSaved to Offer type or fetch separately
                        />
                    }
                    claimCard={
                        <ClaimCard
                            offer={offer}
                            availability={availability}
                            onClaim={handleClaim}
                            isLoading={claiming}
                            claimError={claimError}
                            claimedCoupon={claimedCoupon}
                        />
                    }
                    recommendations={
                        <RecommendedOffers offers={recs} />
                    }
                />
            </div>
            <Footer />
        </div>
    );
};

export default OfferDetailsNew;
