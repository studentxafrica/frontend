import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { INSTAGRAM_HANDLE } from '@/api/drops';

/** The StudentXmas terms students agree to when they join. */
const DropTerms = () => (
	<div className="flex min-h-screen flex-col bg-white">
		<Header />
		<main className="mx-auto w-full max-w-2xl flex-grow space-y-6 px-4 pb-16 pt-28 text-text-secondary">
			<h1 className="text-3xl font-bold text-text-primary">StudentXmas terms</h1>
			<p>Version 2026-11-17. These terms cover StudentXmas, 18 November to 18 December 2026.</p>
			<ol className="list-decimal space-y-3 pl-5">
				<li>StudentXmas is run by StudentX, which pays for every perk. Brand names describe what the perk is; those brands are not involved in StudentXmas.</li>
				<li>Taking part is free. Join StudentXmas on this site with a StudentX account; joining once puts you in every drop that has not yet been picked. To be picked, your student ID must be verified by the drop's pick time.</li>
				<li>Each drop is picked at 12:00 East Africa Time on its date. Recipients are chosen at random from verified students who joined before that time. Each student can be picked at most once during StudentXmas.</li>
				<li>If you're picked, we tell you on StudentX and by email. Airtime is sent to the Safaricom number on your profile. Vouchers and experiences are used with your StudentX live pass within 10 days of the pick.</li>
				<li>Crew perks cover the picked member and the stated number of friends. Every friend needs a verified StudentX account before the crew pass is issued, and the pass must be used within the same 10 days.</li>
				<li>Perks can't be exchanged for cash or transferred. A perk that isn't used in time lapses.</li>
				<li>By joining you agree that, if you're picked, your first name may be shown on StudentX's Instagram ({INSTAGRAM_HANDLE}). No other details are shared.</li>
				<li>Your information is handled as described in our <Link to="/privacy" className="text-text-link underline">Privacy Policy</Link>.</li>
			</ol>
		</main>
		<Footer />
	</div>
);

export default DropTerms;
