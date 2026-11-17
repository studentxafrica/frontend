import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Loader2, Share2, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResultCard from '@/components/drops/ResultCard';
import StatusCard from '@/components/drops/StatusCard';
import ServerError from '@/components/ServerError';
import { toast } from '@/hooks/use-toast';
import { CampaignView, Drop, formatDropWhen, getCampaign, quantityLabel } from '@/api/drops';

const HERO_TINTS: Record<string, string> = {
	airtime: 'from-[#3f6b55] to-[#1f3a2e]',
	voucher: 'from-[#8a5a3c] to-[#4a2f22]',
	crew: 'from-[#34507a] to-[#1b2740]',
};

/** A drop, in the same layout as an offer page. */
const DropDetails = () => {
	const { id } = useParams();
	const [view, setView] = useState<CampaignView | null>(null);
	const [failed, setFailed] = useState(false);

	const load = () => {
		setFailed(false);
		getCampaign().then(setView).catch(() => setFailed(true));
	};
	useEffect(load, [id]);

	const drop: Drop | undefined = view && [...view.upcoming, ...view.ended].find((d) => d.id === id);

	const share = async () => {
		const url = window.location.href;
		try {
			if (navigator.share) await navigator.share({ title: drop?.title, url });
			else { await navigator.clipboard.writeText(url); toast({ title: 'Link copied' }); }
		} catch { /* the student closed the share sheet */ }
	};

	return (
		<div className="flex min-h-screen flex-col bg-background-lighter">
			<Header />
			<div className="flex-grow pt-20">
				<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
					{failed && <ServerError onRetry={load} />}
					{!view && !failed && <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>}
					{view && !drop && (
						<div className="py-24 text-center">
							<h1 className="text-2xl font-bold text-text-primary">Drop not found</h1>
							<Link to="/drops" className="mt-4 inline-block text-text-link underline">See all StudentXmas drops</Link>
						</div>
					)}
					{view && drop && (
						<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
							<div className="space-y-8 lg:col-span-7 xl:col-span-8">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<span className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-background p-1 shadow-sm">
											<Zap className="h-8 w-8 fill-brand-primary text-brand-primary" aria-hidden />
										</span>
										<div>
											<p className="flex items-center gap-2 text-lg font-semibold text-text-primary">StudentX <BadgeCheck className="h-5 w-5 fill-brand-accent/10 text-brand-accent" aria-label="Verified" /></p>
											<Link to="/drops" className="mt-1 text-sm text-text-secondary hover:text-brand-primary">StudentXmas</Link>
										</div>
									</div>
									<button onClick={share} aria-label="Share this drop" className="flex h-10 w-10 items-center justify-center rounded-full text-text-tertiary hover:bg-brand-primary/10 hover:text-brand-primary">
										<Share2 className="h-5 w-5" />
									</button>
								</div>

								<div className={`relative aspect-video overflow-hidden rounded-xl bg-linear-to-br shadow-sm ${HERO_TINTS[drop.kind]}`}>
									{drop.coverImage && <img src={drop.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
									<div className="absolute inset-0 bg-neutral-950/30" />
									<div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
										<span className="mb-4 inline-block rounded-full bg-background/90 px-4 py-1 text-lg font-bold tracking-wide text-text-primary">
											{drop.status === 'ended' ? 'ENDED' : drop.isNext ? 'NEXT DROP' : `DROP ${drop.number} OF ${drop.total}`}
										</span>
										<h1 className="mb-2 text-3xl font-bold leading-tight text-text-inverted sm:text-4xl md:text-5xl">{drop.title}</h1>
									</div>
								</div>

								<p className="text-lg leading-relaxed text-text-secondary">{drop.description}</p>

								<div className="border-t border-border-subtle pt-8">
									<h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-primary">Terms &amp; Conditions</h2>
									<div className="rounded-lg border border-border-subtle bg-background-subtle p-6 text-sm leading-relaxed text-text-secondary">
										{quantityLabel(drop)}, picked at random at {formatDropWhen(drop.pickAt)} (EAT) from verified students who have joined StudentXmas. If you're picked, we'll tell you on StudentX and by email. Use within {drop.useWithinDays} days. <Link to="/drops/terms" className="text-text-link underline">StudentXmas terms</Link>
									</div>
								</div>
							</div>

							<div className="z-10 space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
								{drop.status === 'ended'
									? <ResultCard drop={drop} nextDrop={view.nextDrop} joined={view.member.state === 'joined'} />
									: view.member.state === 'joined' && view.member.verification === 'verified'
										? (
											<div className="space-y-3 rounded-xl border border-border-subtle bg-background p-6 text-center shadow-sm sm:p-8">
												<h2 className="text-2xl font-bold text-text-primary">You're in this drop</h2>
												<p className="text-text-secondary">Picked at random at {formatDropWhen(drop.pickAt)}. We'll tell you here and by email if it's you.</p>
												<p className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-tertiary"><span className="h-2 w-2 rounded-full bg-success" />Drop {drop.number} of {drop.total}</p>
											</div>
										)
										: <StatusCard view={view} onJoined={setView} returnTo={`/drops/${drop.id}`} />}
							</div>
						</div>
					)}
				</main>
			</div>
			<Footer />
		</div>
	);
};

export default DropDetails;
