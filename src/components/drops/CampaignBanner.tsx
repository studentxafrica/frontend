import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { CampaignView, formatDropWhen, getCampaign } from '@/api/drops';

/**
 * Announces the running campaign on the home and deals pages. Every drop in it
 * lives on the campaign's own pages, so there is one place for each.
 */
const CampaignBanner = () => {
	const [view, setView] = useState<CampaignView | null>(null);

	useEffect(() => {
		getCampaign().then(setView).catch(() => setView(null));
	}, []);

	if (!view || !view.nextDrop) return null;
	const joined = view.member.state === 'joined';
	const total = view.upcoming.length + view.ended.length;

	return (
		<section aria-label="StudentXmas" className="w-full bg-white px-4 py-6">
			<Link
				to="/drops"
				className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-5 transition-colors hover:bg-brand-primary/10 sm:flex-row sm:items-center"
			>
				<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
					<Gift className="h-6 w-6" aria-hidden />
				</span>
				<span className="flex-1">
					<span className="block text-xs font-semibold uppercase tracking-wider text-brand-primary">Now on · StudentXmas</span>
					<span className="mt-1 block text-lg font-semibold text-text-primary">
						Airtime, vouchers, bowling and go-karting: {total} drops, every Mon, Wed and Fri
					</span>
					<span className="mt-0.5 block text-sm text-text-secondary">
						Next: {view.nextDrop.title}, {formatDropWhen(view.nextDrop.pickAt)}
					</span>
				</span>
				<span className="inline-flex items-center gap-2 font-semibold text-brand-primary">
					{joined ? 'See your drops' : 'Join StudentXmas'}<ArrowRight className="h-4 w-4" aria-hidden />
				</span>
			</Link>
		</section>
	);
};

export default CampaignBanner;
