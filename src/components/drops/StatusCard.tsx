import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import JoinPanel from './JoinPanel';
import { CampaignView, INSTAGRAM_URL, formatDropWhen } from '@/api/drops';

/**
 * Where the student stands in StudentXmas, and the one thing to do
 * next: join, verify before the next pick, or nothing at all.
 */
const StatusCard = ({ view, onJoined, returnTo = '/drops' }: {
	view: CampaignView;
	onJoined: (view: CampaignView) => void;
	returnTo?: string;
}) => {
	const { member, nextDrop, upcoming } = view;
	const total = (view.upcoming[0] ?? view.ended[0])?.total ?? upcoming.length;
	const nextPick = nextDrop ? formatDropWhen(nextDrop.pickAt) : null;
	const cta = (to: string, label: string) => (
		<Link to={to} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">
			{label}<ArrowRight className="h-4 w-4" aria-hidden />
		</Link>
	);

	const shareCta = (
		<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary font-semibold text-white hover:bg-brand-primary/90">
			Share &amp; Tag Your Crew<ArrowRight className="h-4 w-4" aria-hidden />
		</a>
	);

	let title: string;
	let body: string;
	let action: React.ReactNode = null;

	if (member.state === 'visitor') {
		title = 'Join StudentXmas';
		body = `${total} drops of airtime, vouchers, bowling and go-karting. Create a free account and you're in every drop still to come.`;
		action = cta(`/auth?page=signup&next=${encodeURIComponent(returnTo)}`, 'Sign Up to Unlock');
	} else if (member.state === 'signed_in') {
		title = 'Join StudentXmas';
		body = `Join once and you're in all ${upcoming.length} drops still to come. Each one is picked at random at 12:00 on its day.`;
		action = <JoinPanel member={member} remaining={upcoming.length} onJoined={onJoined} />;
	} else if (member.verification === 'verified') {
		title = "You're in StudentXmas";
		body = nextDrop
			? `Next: ${nextDrop.title}, ${nextPick}. If you're picked, we'll tell you here and by email.`
			: 'Every drop has now been picked. Thanks for being part of StudentXmas.';
		action = shareCta;
	} else if (member.verification === 'in_review') {
		title = "You're in StudentXmas";
		body = "Your student ID is being checked. You'll be in every pick from the moment it's approved.";
		action = shareCta;
	} else {
		title = "You're in. One step left";
		body = nextPick
			? `Verify your student ID before ${nextPick} to be in the next pick. Only verified students can be picked.`
			: 'Verify your student ID so you can be picked.';
		action = cta('/me?tab=verification', 'Verify my student ID');
	}

	return (
		<div className="space-y-4 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
			<div className="space-y-2">
				<h2 className="text-xl font-bold text-text-primary">{title}</h2>
				<p className="text-text-secondary">{body}</p>
			</div>
			{action}
		</div>
	);
};

export default StatusCard;
