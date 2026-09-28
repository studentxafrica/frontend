import React from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponClaimSuccessData, OfferKind } from "@/types/offerHooks";
import { toast } from "@/hooks/use-toast";

interface CouponPreviewProps {
    coupon: CouponClaimSuccessData;
}

export const CouponPreview: React.FC<CouponPreviewProps> = ({ coupon }) => {
    const [copied, setCopied] = React.useState(false);
    const isEvent = coupon.offerKind === OfferKind.EVENT;

    const handleCopy = () => {
        navigator.clipboard.writeText(isEvent ? (coupon.eventUrl || "") : (coupon.code || ""));
        setCopied(true);
        toast({
            title: "Copied!",
            description: isEvent ? "Event link copied to clipboard" : "Code copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="text-center space-y-6">
            <div className="space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-success/10 text-success rounded-full mb-2">
                    <Check size={24} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                    {isEvent ? "You're registered!" : "You're all set!"}
                </h3>
                <p className="text-text-secondary">
                    {isEvent
                        ? "Use the link below to join when the event starts."
                        : "Show this code at checkout to redeem."}
                </p>
            </div>

            <div className="p-6 bg-background-subtle rounded-xl border-2 border-dashed border-border-strong">
                <div className="bg-background p-4 rounded-lg shadow-sm mb-6 inline-block">
                    <img
                        src={coupon.qrCode}
                        alt={isEvent ? "Event QR code" : "QR Code"}
                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                    />
                </div>

                {isEvent ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
                        <a
                            href={coupon.eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                        >
                            <Button size="lg" className="w-full bg-brand-primary text-text-inverted hover:bg-brand-primary/90 font-bold">
                                Join event <ExternalLink className="ml-2" size={18} />
                            </Button>
                        </a>
                        <div
                            className="group bg-background border border-border-strong rounded-lg p-2 pl-3 flex items-center justify-between gap-2 cursor-pointer hover:border-brand-primary transition-colors w-full"
                            onClick={handleCopy}
                        >
                            <span className="text-sm text-text-secondary truncate">{coupon.eventUrl}</span>
                            <Button size="icon" variant="ghost" aria-label={copied ? "Event link copied" : "Copy event link"} className="shrink-0 text-text-tertiary group-hover:text-brand-primary">
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </Button>
                        </div>
                        <p className="text-xs text-text-tertiary">Click to copy the link</p>
                    </div>
                ) : (
                    <div className="relative group flex flex-col justify-center items-center w-full max-w-sm mx-auto">
                        <div className="bg-background border border-border-strong rounded-lg p-2 flex items-center justify-between gap-2 cursor-pointer hover:border-brand-primary transition-colors" onClick={handleCopy}>
                            <code className="text-lg sm:text-xl font-mono font-bold text-text-primary pl-2">
                                {coupon.code}
                            </code>
                            <Button size="icon" variant="ghost" aria-label={copied ? "Code copied" : "Copy code"} className="text-text-tertiary group-hover:text-brand-primary">
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </Button>
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">Click to copy code</p>
                    </div>
                )}
            </div>

            <div className="text-sm text-text-tertiary">
                {isEvent ? "Access until " : "Expires on "}
                {new Date(coupon.expiryDate).toLocaleDateString()}
            </div>
        </div>
    );
};
