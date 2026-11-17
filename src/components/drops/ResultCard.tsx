import { Link } from 'react-router-dom';
import { Check, PartyPopper } from 'lucide-react';
import { Drop, formatDropDay, formatDropWhen, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/api/drops';

/** The member's result for a drop that has been picked. */
const ResultCard = ({ drop, nextDrop, onJoin, joined = false }: {
	drop: Drop; nextDrop: Drop | null; onJoin?: () => void; joined?: boolean;
}) => {
	const next = nextDrop ? `${nextDrop.title}, ${formatDropWhen(nextDrop.pickAt)}` : null;

	if (drop.result === 'picked') {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
				<span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10"><Check className="h-7 w-7 text-success" /></span>
				<div className="space-y-1">
					<p className="text-sm text-text-secondary">{formatDropDay(drop.pickAt)} drop · {drop.title}</p>
					<h2 className="text-2xl font-bold text-text-primary">You were picked!</h2>
				</div>
				<p className="text-text-secondary">Find your perk and what to do next in your profile.</p>
				<Link to="/me?tab=drops" className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 font-semibold text-white hover:bg-brand-primary/90">See my perk</Link>
			</div>
		);
	}

	if (drop.result === 'not_picked') {
		const picked = drop.pickedCount ?? drop.quantity;
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
				<span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10"><PartyPopper className="h-7 w-7 text-brand-primary" /></span>
				<div className="space-y-1">
					<p className="text-sm text-text-secondary">{formatDropDay(drop.pickAt)} drop · {drop.title}</p>
					<h2 className="text-2xl font-bold text-text-primary">Not this time</h2>
				</div>
				<p className="text-text-secondary">
					{picked === 1 ? 'One member was' : `${picked} members were`} picked. Head to our Instagram to celebrate them, and to catch every upcoming drop as it's announced.
				</p>
				<a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 font-semibold text-white hover:bg-brand-primary/90">
					Celebrate them on {INSTAGRAM_HANDLE}
				</a>
				<p className="text-sm text-text-secondary">You're still in every remaining drop.{next ? ` Next: ${next}.` : ''}</p>
			</div>
		);
	}

	if (drop.result === 'not_verified') {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
				<p className="text-sm text-text-secondary">{formatDropDay(drop.pickAt)} drop · {drop.title}</p>
				<h2 className="text-xl font-bold text-text-primary">You weren't verified in time</h2>
				<p className="text-text-secondary">
					Only verified students are picked. Verify your student ID to be in the next{next ? `: ${next}` : ''}.
				</p>
				<Link to="/me?tab=verification" className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 font-semibold text-white hover:bg-brand-primary/90">Verify my student ID</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
			<p className="text-sm text-text-secondary">{formatDropDay(drop.pickAt)} drop · {drop.title}</p>
			<h2 className="text-xl font-bold text-text-primary">This drop has ended</h2>
			<p className="text-text-secondary">
				{joined
					? `It was picked before you joined. You're in the next one${next ? `: ${next}` : ''}.`
					: `It was picked before you joined. Join StudentXmas to be in the next${next ? `: ${next}` : ''}.`}{' '}Follow{' '}
				<a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-text-link underline">{INSTAGRAM_HANDLE}</a> to see who was picked.
			</p>
			{onJoin && <button onClick={onJoin} className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 font-semibold text-white hover:bg-brand-primary/90">Join StudentXmas</button>}
		</div>
	);
};

export default ResultCard;
