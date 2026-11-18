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
	const winners = [...view.upcoming, ...view.ended].reduce((sum, d) => sum + d.quantity * (d.kind === 'crew' ? d.crewSize ?? 1 : 1), 0);

	return (
		<section aria-label="StudentXmas" className="w-full bg-white px-4 py-6">
			<Link
				to="/drops"
				className="group relative mx-auto flex max-w-5xl flex-col gap-4 overflow-hidden rounded-[28px] bg-brand-primary p-6 text-white shadow-[0_10px_0_#ead8e0] transition duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center motion-reduce:transition-none"
			>
				<span aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-[#ffdd70]/90" />
				<span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-primary">
					<Gift className="h-6 w-6" aria-hidden />
				</span>
				<span className="relative flex-1">
					<span className="inline-block rounded-full bg-[#ffdd70] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#24131d]">Now on · StudentXmas</span>
					<span className="mt-2 block text-xl font-extrabold tracking-[-0.02em]">
						{winners} Verified Student Winners • Airtime, vouchers, bowling and go-karting
					</span>
					<span className="mt-1 block text-sm text-white/85">
						Next: {view.nextDrop.title}, {formatDropWhen(view.nextDrop.pickAt)}
					</span>
				</span>
				<span className="relative inline-flex items-center gap-2 self-start rounded-full bg-[#24131d] px-5 py-2.5 text-sm font-bold text-white sm:self-auto">
					{joined ? 'See your drops' : 'Join StudentXmas'}<ArrowRight className="h-4 w-4" aria-hidden />
				</span>
			</Link>
		</section>
	);
};

export default CampaignBanner;
