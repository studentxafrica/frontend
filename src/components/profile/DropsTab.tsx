import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DropPick, formatDropDay, getMyPicks } from '@/api/drops';

const useBy = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' });

/** Perks the member was picked for in Festive Drops, with the next step for each. */
const DropsTab = () => {
	const [picks, setPicks] = useState<DropPick[] | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		getMyPicks().then(setPicks).catch(() => setFailed(true));
	}, []);

	if (failed) return <p className="text-text-secondary">We couldn't load your drops. Refresh to try again.</p>;
	if (!picks) return <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />;
	if (picks.length === 0) {
		return (
			<div className="border border-neutral-200 bg-white p-6 text-text-secondary">
				No perks yet. <Link to="/drops" className="text-text-link underline">See StudentXmas</Link> to join and see what's coming up.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{picks.map((pick) => {
				const { drop } = pick;
				const crewLeft = drop.crewSize ? drop.crewSize - 1 - pick.crew.filter((f) => f.status === 'verified').length : 0;
				return (
					<div key={pick.id} className="space-y-3 border border-neutral-200 bg-white p-5">
						<div className="flex justify-between gap-4">
							<div>
								<p className="text-xs text-neutral-500">{formatDropDay(drop.pickAt)} drop · {drop.brand}</p>
								<p className="text-base font-semibold text-neutral-900">{drop.title}</p>
							</div>
							<p className="whitespace-nowrap text-xs text-neutral-500">{pick.redeemedAt ? 'Used' : `Use by ${useBy(pick.expiresAt)}`}</p>
						</div>
						{drop.kind === 'airtime' && (
							<p className="text-sm font-semibold text-success">
								{pick.fulfilment === 'pending' ? `On its way to ${pick.phone ?? 'your number'}` : `Sent to ${pick.phone ?? 'your number'}`}
							</p>
						)}
						{drop.kind === 'voucher' && !pick.redeemedAt && (
							<Link to={`/drops/perks/${pick.id}/pass`} className="flex h-11 items-center justify-center rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">Show my StudentX pass</Link>
						)}
						{drop.kind === 'crew' && !pick.redeemedAt && (
							pick.crewComplete
								? <Link to={`/drops/perks/${pick.id}/pass`} className="flex h-11 items-center justify-center rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">Show crew pass</Link>
								: <Link to={`/drops/perks/${pick.id}/crew`} className="flex h-11 items-center justify-center rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">Add your crew ({crewLeft} to go)</Link>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default DropsTab;
