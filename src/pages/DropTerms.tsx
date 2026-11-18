import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Must match the version the backend records when a student joins (app/drops/studentxmas.py). */
export const STUDENTXMAS_TERMS_VERSION = '2026-11-18';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="space-y-3">
		<h2 className="text-lg font-bold text-text-primary">{title}</h2>
		{children}
	</section>
);

const Item = ({ label, children }: { label: string; children: ReactNode }) => (
	<li><strong className="font-semibold text-text-primary">{label}:</strong> {children}</li>
);

/** The StudentXmas terms students agree to when they join. */
const DropTerms = () => (
	<div className="flex min-h-screen flex-col bg-white">
		<Header />
		<main className="mx-auto w-full max-w-2xl flex-grow space-y-8 px-4 pb-16 pt-28 leading-relaxed text-text-secondary">
			<div className="space-y-3">
				<h1 className="text-3xl font-bold text-text-primary">StudentXmas terms</h1>
				<p>
					Version {STUDENTXMAS_TERMS_VERSION}. These terms cover StudentXmas, the StudentX Festive Access Series,
					running from 18 November to 18 December 2026. By joining StudentXmas you agree to them.
				</p>
			</div>

			<Section title="1. Who runs StudentXmas">
				<p>
					StudentXmas is run by StudentX, which provides every reward. Brand and venue names show where a reward
					is used and remain the property of their owners.
				</p>
			</Section>

			<Section title="2. Taking part">
				<ul className="list-disc space-y-2 pl-5">
					<li>Taking part is free. You need a StudentX account, and you must join StudentXmas on this site. Joining once enters you into every drop that hasn't been picked yet.</li>
					<li>To be picked for a drop, your StudentX account must be verified by that drop's pick time.</li>
					<li>Each member can unlock at most one reward during StudentXmas.</li>
				</ul>
			</Section>

			<Section title="3. How rewards are picked">
				<ul className="list-disc space-y-2 pl-5">
					<li>Each drop is picked at random on its drop date, from 12:00 East Africa Time, from verified members who joined StudentXmas before then.</li>
					<li>The rewards, drop dates and number of winners for each drop are shown on the <Link to="/drops" className="text-text-link underline">StudentXmas page</Link>.</li>
				</ul>
			</Section>

			<Section title="4. If you unlock a reward">
				<ul className="list-disc space-y-2 pl-5">
					<li>We email you a confirmation with your reward, the brand or venue, your voucher or reference code, and the date it's valid until. It also appears in your StudentX profile.</li>
					<li>Airtime is credited directly to the Safaricom number on your StudentX profile when you're picked, so keep that number up to date.</li>
					<li>Your first name may be announced on StudentX's social media.</li>
				</ul>
			</Section>

			<Section title="5. How to redeem your reward">
				<ol className="list-decimal space-y-2 pl-5">
					<Item label="Verify your account">Make sure your StudentX profile is fully verified before heading out.</Item>
					<Item label="Group packages">
						If you unlocked a group experience (bowling or go-karting), every member of your group must be signed up
						and verified on StudentX before redemption. Add them with the crew link in your confirmation email, or
						reply to that email with the full names and registered StudentX emails of your guests at least 24 hours
						before your visit.
					</Item>
					<Item label="Present your StudentX ID at checkout">
						At the venue or store, present your digital StudentX ID to the cashier at the point of purchase,
						alongside your voucher or reference code. Airtime needs no redemption: it is credited to your
						registered mobile number.
					</Item>
				</ol>
			</Section>

			<Section title="6. Terms & Conditions">
				<ul className="list-disc space-y-2 pl-5">
					<Item label="10-Day Validity Window">
						All rewards and vouchers are strictly valid for 10 calendar days from the date of your confirmation
						email. Any reward not redeemed on or before the date in that email will automatically expire.
					</Item>
					<Item label="StudentX Verification Required">
						The primary recipient, and all accompanying guests for group packages, must hold an active, verified
						account on the StudentX platform.
					</Item>
					<Item label="Proof of ID at Point of Purchase">
						You must display your valid StudentX ID and National ID to the cashier or venue attendant at the point
						of purchase or check-in. The attendant will countercheck with your National ID. Screenshots of another
						user's ID will not be accepted.
					</Item>
					<Item label="Final & Non-Transferable">
						All rewards are final. No cash refunds, no exchanges, no transfers to third parties, and no validity
						extensions will be granted under any circumstances.
					</Item>
					<Item label="Social Media Feature">
						By redeeming a reward, you grant StudentX permission to repost or share public tags and mentions
						celebrating your experience.
					</Item>
				</ul>
			</Section>

			<Section title="7. Fair play and changes">
				<ul className="list-disc space-y-2 pl-5">
					<li>StudentX may withhold or cancel a reward if an account gives false details, belongs to someone who already has another StudentX account, or breaks these terms.</li>
					<li>If a reward becomes unavailable for reasons outside StudentX's control, StudentX may replace it with a reward of similar value.</li>
					<li>Each venue's own rules, such as safety briefings, apply when you use a reward there.</li>
					<li>StudentX may update these terms during StudentXmas. The version at the top shows the date of the latest change.</li>
				</ul>
			</Section>

			<Section title="8. Your information">
				<p>
					To pick winners and deliver rewards, we use your name, email address, phone number and verification
					status. We share your name with a venue only when a booking needs it. Everything else is handled as described
					in our <Link to="/privacy" className="text-text-link underline">Privacy Policy</Link>.
				</p>
			</Section>

			<Section title="9. Questions">
				<p>
					Reply to your confirmation email, or contact us at{' '}
					<a href="mailto:support@studentx.co.ke" className="text-text-link underline">support@studentx.co.ke</a>.
				</p>
			</Section>
		</main>
		<Footer />
	</div>
);

export default DropTerms;
