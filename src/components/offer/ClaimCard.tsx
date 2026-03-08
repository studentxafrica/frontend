import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferDetails, AvailableClaims, CouponClaimSuccessData } from "@/types/offerHooks";
import { CouponPreview } from "./CouponPreview";

interface ClaimCardProps {
    offer: OfferDetails;
    availability: AvailableClaims | null;
    onClaim: () => void;
    isLoading: boolean;
    claimError: string | null;
    claimedCoupon: CouponClaimSuccessData | null;
}

const ClaimCard: React.FC<ClaimCardProps> = ({
    offer,
    availability,
    onClaim,
    isLoading,
    claimError,
    claimedCoupon
}) => {
    const isClaimed = !!claimedCoupon;
    const canClaim = availability?.can_claim_now ?? true; // Default to true if loading

    return (
        <div className="relative">
            <div className="relative bg-background rounded-xl p-6 sm:p-8 shadow-sm border border-border-subtle">

                <AnimatePresence mode="wait">
                    {!isClaimed ? (
                        <motion.div
                            key="claim-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-text-primary">Ready to save?</h3>
                                <p className="text-text-secondary">Claim this deal now to get your unique code.</p>
                            </div>

                            {/* Status / Availability Info */}
                            {availability && !availability.can_claim_now && (
                                <div className="bg-warning/10 text-warning-foreground text-sm p-4 rounded-lg flex items-start gap-3">
                                    <Clock className="shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-semibold">Not available right now</p>
                                        <p className="mt-1 opacity-90">{availability.reason}</p>
                                        {availability.next_available_claim && (
                                            <p className="mt-2 text-xs font-mono bg-warning/20 inline-block px-2 py-1 rounded">
                                                Next available: {new Date(availability.next_available_claim).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {claimError && (
                                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <p>{claimError}</p>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className={`w-full h-14 text-lg font-bold rounded-lg transition-all ${!canClaim ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99] bg-brand-primary text-text-inverted hover:bg-brand-primary/90'}`}
                                onClick={onClaim}
                                disabled={isLoading || !canClaim}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <>
                                        Claim Offer <ArrowRight className="ml-2 group-hover:translate-x-1" size={20} />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-6 text-xs font-medium text-text-tertiary">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-success" /> Verified
                                </span>
                                <span>•</span>
                                <span>{offer.coupons.total - offer.coupons.claimed} codes left</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                        >
                            <CouponPreview coupon={claimedCoupon} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ClaimCard;
