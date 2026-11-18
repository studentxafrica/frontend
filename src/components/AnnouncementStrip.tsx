import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, X } from "lucide-react";
import { CampaignView, campaignBannerText, getCampaign } from "@/api/drops";

const DISMISSED_KEY = "announcement_strip_dismissed";

interface AnnouncementStripProps {
    /** Lets the page shift content down while the strip occupies the top of the viewport. */
    onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Thin bar pinned above the header announcing StudentXmas (the tracker's banner line).
 * Hidden once the campaign has no drops left, or after the visitor closes it
 * (until the next drop comes round).
 */
const AnnouncementStrip: React.FC<AnnouncementStripProps> = ({ onVisibilityChange }) => {
    const [view, setView] = React.useState<CampaignView | null>(null);
    const [dismissed, setDismissed] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        getCampaign()
            .then((campaign) => {
                if (!active || !campaign.nextDrop) return;
                let closedFor: string | null = null;
                try {
                    closedFor = sessionStorage.getItem(DISMISSED_KEY);
                } catch {
                    // Storage can be unavailable (private windows); show the strip
                }
                if (closedFor === campaign.nextDrop.id) return;
                setView(campaign);
            })
            .catch(() => {
                // A quiet strip is better than a broken one
            });
        return () => {
            active = false;
        };
    }, []);

    const next = view?.nextDrop;
    const visible = !!next && !dismissed;

    React.useEffect(() => {
        onVisibilityChange?.(visible);
    }, [visible, onVisibilityChange]);

    if (!view || !next || dismissed) return null;

    const joined = view.member.state === "joined";

    const handleDismiss = () => {
        try {
            sessionStorage.setItem(DISMISSED_KEY, next.id);
        } catch {
            // Closing still works for this page view
        }
        setDismissed(true);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-9 flex items-center text-white bg-brand-primary">
            <div className="container mx-auto px-4 flex items-center justify-between gap-3 h-full">
                <Link to="/drops" className="flex items-center gap-2 min-w-0 flex-1 group">
                    <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold uppercase tracking-wider bg-[#ffdd70] text-[#24131d] rounded-full px-2.5 py-0.5">
                        <Gift className="h-3 w-3" aria-hidden />
                        StudentXmas
                    </span>
                    <span className="relative flex h-2 w-2 shrink-0 sm:hidden" aria-hidden>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#ffdd70] opacity-75 animate-ping motion-reduce:animate-none" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffdd70]" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold truncate">{campaignBannerText(view)}</span>
                    <span className="hidden md:inline-flex items-center gap-1 shrink-0 text-xs font-semibold underline-offset-2 group-hover:underline">
                        {joined ? "See your drops" : "Join StudentXmas"}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Close"
                    className="shrink-0 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementStrip;
