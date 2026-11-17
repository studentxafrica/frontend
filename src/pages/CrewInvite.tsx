import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { RootState } from '@/state';
import { apiMessage, getCrewInvite, joinCrew } from '@/api/drops';

type Invite = Awaited<ReturnType<typeof getCrewInvite>>;

/** What a friend sees when they open a crew invite link. */
const CrewInvite = () => {
	const { code } = useParams();
	const user = useSelector((state: RootState) => state.auth.user);
	const [invite, setInvite] = useState<Invite | null>(null);
	const [error, setError] = useState('');
	const [joined, setJoined] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		getCrewInvite(code!).then(setInvite).catch((err) => setError(apiMessage(err, "This invite link isn't valid.")));
	}, [code]);

	const join = async () => {
		setSaving(true);
		setError('');
		try {
			await joinCrew(code!);
			setJoined(true);
		} catch (err) {
			setError(apiMessage(err, "We couldn't add you to the crew."));
		} finally {
			setSaving(false);
		}
	};

	const back = encodeURIComponent(`/crew/${code}`);

	return (
		<div className="min-h-screen bg-background-lighter">
			<Header />
			<main className="mx-auto max-w-md px-4 pb-16 pt-28">
				{!invite && !error && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>}
				{!invite && error && <p className="text-center text-text-secondary">{error}</p>}
				{invite && (
					<div className="space-y-5 rounded-xl border border-border-subtle bg-white p-6 text-center shadow-sm">
						<p className="text-sm text-text-secondary">StudentXmas</p>
						<h1 className="text-2xl font-bold text-text-primary">{invite.inviterFirstName} invited you to {invite.drop.title}</h1>
						<p className="text-text-secondary">
							{invite.inviterFirstName} was picked for a crew of {invite.drop.crewSize} at {invite.drop.brand}. Join with a verified StudentX account to come along. {invite.spotsLeft} {invite.spotsLeft === 1 ? 'spot' : 'spots'} left.
						</p>
						{joined ? (
							<div className="space-y-3">
								<p className="font-semibold text-success">You're in the crew.</p>
								<p className="text-sm text-text-secondary">If you haven't verified your student ID yet, do it now so the crew pass can be issued.</p>
								<Link to="/me?tab=verification" className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 font-semibold text-white">Check my verification</Link>
							</div>
						) : user ? (
							<button onClick={join} disabled={saving || invite.spotsLeft === 0} className="h-12 w-full rounded-lg bg-brand-primary font-semibold text-white disabled:opacity-50">
								{saving ? 'Joining…' : invite.spotsLeft === 0 ? 'This crew is full' : 'Join the crew'}
							</button>
						) : (
							<div className="space-y-2">
								<Link to={`/auth?page=signup&next=${back}`} className="flex h-12 items-center justify-center rounded-lg bg-brand-primary font-semibold text-white">Sign up to join</Link>
								<Link to={`/auth?page=login&next=${back}`} className="block text-sm text-text-link underline">I already have an account</Link>
							</div>
						)}
						{error && <p role="alert" className="text-sm text-text-danger">{error}</p>}
					</div>
				)}
			</main>
		</div>
	);
};

export default CrewInvite;
