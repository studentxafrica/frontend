import React from "react";
import { MapPin, Globe, Share2, Bookmark, CheckCircle2, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Assuming this exists from prev file analysis
import { ImageLightbox } from "@/components/ui/image-preview";
import { OfferDetails, DiscountType, OfferKind } from "@/types/offerHooks";
import { motion } from "framer-motion";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface OfferHeroProps {
    offer: OfferDetails;
    onSave: () => void;
    onShare: () => void;
    isSaved?: boolean;
}

const OfferHero: React.FC<OfferHeroProps> = ({ offer, onSave, onShare, isSaved }) => {
    const [previewOpen, setPreviewOpen] = React.useState(false);

    const discountLabel = React.useMemo(() => {
        if (offer.offerKind === OfferKind.EVENT) return "EVENT";
        switch (offer.discountType) {
            case DiscountType.PERCENTAGE: return `${offer.discountValue}% OFF`;
            case DiscountType.FIXED_AMOUNT: return `${formatCurrency(offer.discountValue, offer.currency || DEFAULT_CURRENCY)} OFF`;
            case DiscountType.BUY_ONE_GET_ONE: return "BOGO";
            case DiscountType.FREE_ITEM: return "Free Item";
            default: return `${offer.discountValue}% OFF`;
        }
    }, [offer]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Merchant Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-background p-1 border border-border-subtle shadow-sm overflow-hidden">
                        <img src={offer.merchant.logo} alt={offer.merchant.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                            {offer.merchant.name}
                            {offer.merchant.isApproved && <CheckCircle2 size={16} className="text-brand-accent fill-brand-accent/10" />}
                            {offer.isStudentOwned && (
                                <Badge className="bg-amber-100 text-amber-900 border-0">Student-Owned</Badge>
                            )}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                            {/* Assuming website is a URL, strip for display if needed or show 'Website' */}
                            <a href={offer.merchant.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors flex items-center gap-1">
                                <Globe size={14} /> Website
                            </a>
                            {/* Placeholder for location if we had it */}
                            {/* <span className="flex items-center gap-1"><MapPin size={14} /> Local</span> */}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={onShare} aria-label="Share offer" className="text-text-tertiary hover:text-brand-primary hover:bg-brand-primary/10 rounded-full">
                        <Share2 size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onSave} aria-label="Save offer" aria-pressed={isSaved} className={`${isSaved ? 'text-brand-primary bg-brand-primary/10' : 'text-text-tertiary'} hover:text-brand-primary hover:bg-brand-primary/10 rounded-full`}>
                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                    </Button>
                </div>
            </div>

            {/* Hero Content */}
            <div className="relative group rounded-xl overflow-hidden aspect-video shadow-sm">
                <img src={offer.coverImage} alt={offer.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-neutral-darkest/40" />

                {/* The banner is cropped to fit, so keep the untouched image one click away */}
                <button
                    type="button"
                    aria-label={`View full image: ${offer.title}`}
                    onClick={() => setPreviewOpen(true)}
                    className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                >
                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
                        <Expand className="h-4 w-4" />
                    </span>
                </button>

                <div className="pointer-events-none absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                    <Badge className="mb-4 bg-background/90 text-text-primary border-none text-lg py-1 px-4 font-bold tracking-wide">
                        {discountLabel}
                    </Badge>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-inverted leading-tight mb-2 text-shadow-sm">
                        {offer.title}
                    </h1>
                </div>
            </div>

            <ImageLightbox
                src={offer.coverImage}
                alt={offer.title}
                caption={offer.title}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
            />
            {/* Description & Terms */}
            <div className="prose prose-slate max-w-none text-text-secondary leading-relaxed">
                <p className="text-lg">{offer.description}</p>

                <div className="mt-8 pt-8 border-t border-border-subtle">
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Terms & Conditions</h4>
                    {offer.termsAndConditions ? (
                        <div className="text-sm bg-background-subtle p-6 rounded-lg border border-border-subtle" dangerouslySetInnerHTML={{ __html: offer.termsAndConditions }} />
                    ) : (
                        <p className="text-sm text-text-secondary">No specific terms and conditions provided for this offer. Platform <a className="text-brand-secondary underline" href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> apply</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default OfferHero;
