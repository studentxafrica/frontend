import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Download, Loader2, Zap } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface StudentXCardProps {
    user: {
        id?: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        university?: string;
        major?: string;
        graduationYear?: string;
        joinDate: string;
        isVerified: boolean;
    };
}

const formatMemberNumber = (id: string) => {
    const digits = id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase().padStart(8, '0');
    return `SX ${digits.slice(0, 4)} ${digits.slice(4)}`;
};

// Stable bar widths seeded from the member number so every card looks different
const barcodeBars = (seed: string) => {
    let hash = 2166136261;
    const bars: number[] = [];
    for (let i = 0; i < 71; i++) {
        hash ^= seed.charCodeAt(i % seed.length) + i;
        hash = Math.imul(hash, 16777619) >>> 0;
        bars.push(hash % 5 === 0 ? 2.5 : (hash % 2) + 1);
    }
    let x = 0;
    return bars.map((width, i) => {
        const bar = { x, width, filled: i % 2 === 0 };
        x += width;
        return bar;
    });
};

const Barcode: React.FC<{ seed: string }> = ({ seed }) => {
    const bars = useMemo(() => barcodeBars(seed), [seed]);
    const total = bars.reduce((sum, bar) => sum + bar.width, 0);
    return (
        <svg viewBox={`0 0 ${total} 28`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden="true">
            {bars.filter(bar => bar.filled).map(bar => (
                <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={28} fill="currentColor" />
            ))}
        </svg>
    );
};

const DetailRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[4.75rem_1fr] gap-2 text-[11px] leading-snug">
            <dt className="font-semibold text-text-primary">{label}</dt>
            <dd className="text-text-secondary truncate" title={value}>{value}</dd>
        </div>
    );
};

export const StudentXCard: React.FC<StudentXCardProps> = ({ user }) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const memberNumber = user.id ? formatMemberNumber(user.id) : undefined;
    const memberSince = new Date(user.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

    const cardRef = useRef<HTMLElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            setDownloading(true);
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 3,
                cacheBust: true,
                style: { boxShadow: 'none' },
            });
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `studentx-card-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
            link.click();
        } catch {
            toast({
                title: "Couldn't download your card",
                description: 'Please try again in a moment.',
                variant: 'destructive',
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex w-full max-w-[18rem] flex-col gap-3">
            <article
                ref={cardRef}
                aria-label={`StudentX card for ${fullName}`}
                className="relative w-full aspect-[54/86] overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(38,38,40,0.35)] ring-1 ring-black/5 flex flex-col"
            >
                {/* Header band */}
                <div className="relative h-[34%] shrink-0 bg-brand-primary text-white">
                    <svg
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full"
                        aria-hidden="true"
                    >
                        <path d="M0 0H100V22C78 38 58 18 30 26C18 29 8 34 0 36Z" fill="#b8015f" />
                        <path d="M62 0H100V14C90 22 76 16 62 0Z" fill="#ffffff" fillOpacity="0.12" />
                    </svg>
                    <div className="relative flex items-center justify-between px-4 pt-3.5">
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-4 w-4 fill-white" />
                            <span className="text-sm font-bold tracking-tight">StudentX</span>
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">Member</span>
                    </div>
                    {/* White curve the avatar sits on */}
                    <svg
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                        className="absolute -bottom-px left-0 h-[42%] w-full"
                        aria-hidden="true"
                    >
                        <path d="M0 20V14C30 -2 70 -2 100 14V20Z" fill="#ffffff" />
                    </svg>
                </div>

                {/* Avatar */}
                <div className="relative -mt-[22%] flex justify-center">
                    <div className="rounded-full bg-white p-1 ring-2 ring-brand-primary">
                        <Avatar className="h-[5.5rem] w-[5.5rem] bg-slate-200">
                            <AvatarImage src={user.avatar} alt="" className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold bg-brand-primary/10 text-brand-primary">
                                {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Identity */}
                <div className="mt-2.5 px-4 text-center">
                    <h3 className="text-lg font-bold leading-tight text-text-primary truncate" title={fullName}>
                        {fullName}
                    </h3>
                    {user.isVerified ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            <BadgeCheck className="h-3 w-3" />
                            Verified Student
                        </span>
                    ) : (
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-neutral-lightest px-2.5 py-0.5 text-[10px] font-semibold text-text-secondary">
                            Not yet verified
                        </span>
                    )}
                </div>

                {/* Details */}
                <dl className="mt-3 space-y-1 px-5">
                    <DetailRow label="Member No" value={memberNumber} />
                    <DetailRow label="University" value={user.university} />
                    <DetailRow label="Course" value={user.major} />
                    <DetailRow label="Class of" value={user.graduationYear} />
                </dl>

                {/* Footer */}
                <div className="mt-auto flex items-end justify-between gap-3 px-4 pb-3.5 pt-2">
                    <div className="min-w-0 flex-1 text-text-primary">
                        {memberNumber && <Barcode seed={memberNumber} />}
                        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-text-secondary">
                            Member since {memberSince}
                        </p>
                    </div>
                </div>
                <div className="h-1.5 shrink-0 bg-gradient-to-r from-brand-primary via-brand-primary to-brand-accent" aria-hidden="true" />
            </article>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download card
            </Button>
        </div>
    );
};
