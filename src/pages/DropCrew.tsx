import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { apiMessage, DropPick, getPick } from '@/api/drops';

const STATUS = {
	verified: { label: 'Verified', className: 'bg-success/10 text-success' },
	in_review: { label: 'In review', className: 'bg-warning/20 text-warning-foreground' },
	unverified: { label: 'Needs to verify', className: 'bg-background-subtle text-text-tertiary' },
};

/** The picked member gathers their crew; the pass is issued once all are verified. */
const DropCrew = () => {
	const { pickId } = useParams();
	const [pick, setPick] = useState<DropPick | null>(null);
	const [error, setError] = useState('');
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const load = () => getPick(pickId!).then(setPick).catch((err) => setError(apiMessage(err, "We couldn't load your crew.")));
		load();
		const poll = setInterval(load, 15000);
		return () => clearInterval(poll);
	}, [pickId]);

	if (!pick) {
		return (
			<div className="min-h-screen bg-background-lighter"><Header />
				<main className="flex justify-center px-4 pt-28">{error ? <p className="text-text-secondary">{error}</p> : <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />}</main>
			</div>
		);
	}

	const friendsNeeded = (pick.drop.crewSize ?? 1) - 1;
	const verified = pick.crew.filter((f) => f.status === 'verified').length;
	const link = `${window.location.origin}/crew/${pick.crewCode}`;
	const share = async () => {
		try {
			if (navigator.share) await navigator.share({ title: `Join my crew: ${pick.drop.title}`, url: link });
			else { await navigator.clipboard.writeText(link); setCopied(true); }
		} catch { /* closed */ }
	};
	const slots = Array.from({ length: friendsNeeded }, (_, i) => pick.crew[i]);

	return (
		<div className="min-h-screen bg-background-lighter">
			<Header />
			<main className="mx-auto max-w-lg space-y-6 px-4 pb-16 pt-28">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-text-primary">Add your crew</h1>
					<p className="text-text-secondary">
						{pick.drop.title} at {pick.drop.brand} covers you and {friendsNeeded} friends with verified StudentX accounts. {verified} of {friendsNeeded} verified so far.
					</p>
				</div>
				<ul className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
					<li className="flex items-center gap-3 px-4 py-3.5"><span className="flex-1 font-medium text-neutral-900">You</span><span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Verified</span></li>
					{slots.map((friend, i) => (
						<li key={i} className="flex items-center gap-3 px-4 py-3.5">
							<span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-600">{friend ? friend.initials : i + 2}</span>
							<span className="flex-1 font-medium text-neutral-900">{friend ? friend.firstName : 'Waiting for a friend'}</span>
							{friend
								? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[friend.status].className}`}>{STATUS[friend.status].label}</span>
								: <span className="rounded-full bg-background-subtle px-2.5 py-1 text-xs font-semibold text-text-tertiary">Open</span>}
						</li>
					))}
				</ul>
				<div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white py-1.5 pl-4 pr-1.5">
					<span className="flex-1 truncate text-sm text-text-primary">{link.replace(/^https?:\/\//, '')}</span>
					<button onClick={share} className="h-10 rounded-lg border border-border-strong px-4 text-sm font-semibold text-text-primary hover:bg-background-subtle">{copied ? 'Copied' : 'Share invite'}</button>
				</div>
				{pick.crewComplete
					? <Link to={`/drops/perks/${pick.id}/pass`} className="flex h-12 items-center justify-center rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">Get the crew pass</Link>
					: <p className="rounded-lg bg-background-subtle p-4 text-sm text-text-secondary">The crew pass is issued when all {friendsNeeded} friends have joined and are verified. Use it by {new Date(pick.expiresAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}.</p>}
			</main>
		</div>
	);
};

export default DropCrew;
