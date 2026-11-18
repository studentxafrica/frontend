import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiMessage, CampaignView, joinCampaign, Member } from '@/api/drops';

/** One step: agree to the drop terms and confirm where airtime goes. */
const JoinPanel = ({ member, remaining, onJoined }: {
	member: Member;
	remaining: number;
	onJoined: (view: CampaignView) => void;
}) => {
	const [agreed, setAgreed] = useState(false);
	const [phone, setPhone] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	const join = async () => {
		setSaving(true);
		setError('');
		try {
			onJoined(await joinCampaign(member.hasPhone ? undefined : phone));
		} catch (err) {
			setError(apiMessage(err, "We couldn't add you just now. Please try again."));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-5 text-left">
			<dl className="divide-y divide-border rounded-lg border border-border text-sm">
				<div className="flex justify-between px-4 py-3"><dt className="text-text-secondary">Drops you'll be in</dt><dd className="font-semibold text-text-primary">{remaining}</dd></div>
				{member.hasPhone && (
					<div className="flex justify-between px-4 py-3"><dt className="text-text-secondary">Airtime goes to</dt><dd className="font-semibold text-text-primary">{member.phone}</dd></div>
				)}
				<div className="flex justify-between px-4 py-3"><dt className="text-text-secondary">Rewards valid for</dt><dd className="font-semibold text-text-primary">10 days</dd></div>
			</dl>
			{!member.hasPhone && (
				<div className="space-y-1.5">
					<label htmlFor="drops-phone" className="text-sm font-medium text-text-primary">Safaricom number, for airtime rewards</label>
					<input id="drops-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="h-11 w-full rounded-lg border border-border-strong px-3 text-base focus:border-brand-primary focus:outline-none" />
				</div>
			)}
			<label className="flex items-start gap-3 text-sm leading-relaxed text-text-tertiary">
				<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#db0271]" />
				<span>I agree to the <Link to="/drops/terms" className="text-text-link underline">StudentXmas terms</Link>, including that my first name may be shown on StudentX's Instagram if I'm picked.</span>
			</label>
			{error && <p role="alert" className="text-sm text-text-danger">{error}</p>}
			<Button onClick={join} disabled={!agreed || saving || (!member.hasPhone && !phone)} className="h-12 w-full bg-brand-primary text-base font-semibold text-white hover:bg-brand-primary/90">
				{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Join StudentXmas
			</Button>
		</div>
	);
};

export default JoinPanel;
