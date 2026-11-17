import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import DropCard from '@/components/drops/DropCard';
import ResultCard from '@/components/drops/ResultCard';
import StatusCard from '@/components/drops/StatusCard';
import OfferCardSkeleton from '@/components/offers/OfferCardSkeleton';
import ServerError from '@/components/ServerError';
import { CampaignView, getCampaign } from '@/api/drops';

/**
 * The StudentXmas campaign page. Everyone sees the drops;
 * a student who joins sees it as theirs, with their progress and results.
 */
const FestiveDrops = () => {
	const [view, setView] = useState<CampaignView | null>(null);
	const [failed, setFailed] = useState(false);

	const load = () => {
		setFailed(false);
		getCampaign().then(setView).catch(() => setFailed(true));
	};
	useEffect(load, []);

	const joined = view?.member.state === 'joined';
	const total = view ? view.upcoming.length + view.ended.length : 0;
	// A drop picked before the student joined says nothing about them; leave it out.
	const showResult = joined && view?.latestResult && view.latestResult.result !== 'not_in';

	return (
		<div className="flex min-h-screen w-full flex-col items-center bg-gray-50">
			<Header />

			<div className="w-full bg-linear-to-r from-blue-900 to-black pb-12 pt-24 text-white">
				<div className="container px-4">
					<div className="flex flex-col items-center text-center">
						<Badge className="mb-4 bg-indigo-900 hover:bg-indigo-900">{joined ? "You're in" : 'Now on · 18 Nov – 18 Dec'}</Badge>
						<h1 className="mb-4 text-4xl font-bold md:text-5xl">StudentXmas</h1>
						<p className="max-w-2xl text-lg text-blue-100">
							Airtime, vouchers, bowling and go-karting: {total || 12} drops, every Mon, Wed and Fri at 12:00. Join once and you're in every drop still to come.
						</p>
						{view && joined && (
							<div className="mt-8 w-full max-w-md">
								<div className="mb-2 flex justify-between text-sm text-blue-100">
									<span>Your StudentXmas</span>
									<span>{view.ended.length} of {total} drops picked · {view.upcoming.length} to go</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-white/20">
									<div className="h-full bg-brand-primary" style={{ width: `${(view.ended.length / Math.max(total, 1)) * 100}%` }} />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<main className="container w-full max-w-5xl px-4 py-10">
				{failed && <ServerError onRetry={load} />}
				{!view && !failed && (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <OfferCardSkeleton key={i} />)}</div>
				)}

				{view && (
					<div className="space-y-10">
						<div className="mx-auto grid max-w-2xl gap-6">
							{view.member.picks > 0 && view.latestResult?.result !== 'picked' && (
								<Link to="/me?tab=drops" className="flex items-center justify-between gap-4 rounded-xl border border-brand-primary bg-brand-primary/5 p-5 text-left hover:bg-brand-primary/10">
									<span>
										<span className="block font-semibold text-text-primary">You have {view.member.picks === 1 ? 'a perk' : `${view.member.picks} perks`} from StudentXmas</span>
										<span className="text-sm text-text-secondary">See what to do next in your profile.</span>
									</span>
									<span className="font-semibold text-brand-primary">View</span>
								</Link>
							)}
							{showResult && <ResultCard drop={view.latestResult!} nextDrop={view.nextDrop} />}
							<StatusCard view={view} onJoined={setView} />
						</div>

						<section aria-labelledby="upcoming-heading" className="space-y-5">
							<div className="flex items-baseline justify-between">
								<h2 id="upcoming-heading" className="text-2xl font-bold text-text-primary">Coming up</h2>
								<span className="text-sm text-text-secondary">{view.upcoming.length} to go</span>
							</div>
							{view.upcoming.length === 0 ? (
								<p className="border border-neutral-200 bg-white p-6 text-text-secondary">Every drop has been picked. Thanks for being part of StudentXmas.</p>
							) : (
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{view.upcoming.map((drop) => <DropCard key={drop.id} drop={drop} />)}
								</div>
							)}
						</section>

						{view.ended.length > 0 && (
							<section aria-labelledby="ended-heading" className="space-y-5">
								<div className="flex items-baseline justify-between border-t border-neutral-200 pt-8">
									<h2 id="ended-heading" className="text-2xl font-bold text-text-primary">Ended drops</h2>
									<span className="text-sm text-text-secondary">{view.ended.length} picked</span>
								</div>
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{view.ended.map((drop) => <DropCard key={drop.id} drop={drop} />)}
								</div>
							</section>
						)}

						<p className="text-xs leading-relaxed text-text-secondary">
							Each drop is picked at random from verified students who have joined. <Link to="/drops/terms" className="text-text-link underline">StudentXmas terms</Link>
						</p>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
};

export default FestiveDrops;
