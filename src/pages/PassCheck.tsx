import { useState } from 'react';
import Header from '@/components/Header';
import { apiMessage, checkPass, redeemPass } from '@/api/drops';

type Result = Awaited<ReturnType<typeof checkPass>>;

/** For venues: check a student's StudentX pass code, then mark it as used. */
const PassCheck = () => {
	const [code, setCode] = useState('');
	const [result, setResult] = useState<Result | null>(null);
	const [pin, setPin] = useState('');
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	const check = async (e: React.FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setMessage('');
		try {
			setResult(await checkPass(code));
		} catch (err) {
			setMessage(apiMessage(err, "We couldn't check that code. Try again."));
		} finally {
			setBusy(false);
		}
	};

	const redeem = async () => {
		setBusy(true);
		setMessage('');
		try {
			await redeemPass(code, pin);
			setResult((r) => (r ? { ...r, valid: false, reason: 'Already used' } : r));
			setMessage('Marked as used. Enjoy!');
		} catch (err) {
			setMessage(apiMessage(err, "We couldn't mark this pass as used."));
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="min-h-screen bg-background-lighter">
			<Header />
			<main className="mx-auto max-w-md space-y-6 px-4 pb-16 pt-28">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-bold text-text-primary">Check a StudentX pass</h1>
					<p className="text-text-secondary">Ask the student to open their StudentX pass, and enter the code shown on it.</p>
				</div>
				<form onSubmit={check} className="flex gap-2">
					<label htmlFor="pass-code" className="sr-only">Pass code</label>
					<input id="pass-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoComplete="off" maxLength={7}
						placeholder="ABC 123" className="h-12 flex-1 rounded-lg border border-border-strong px-4 font-mono text-lg tracking-widest focus:border-brand-primary focus:outline-none" />
					<button type="submit" disabled={busy || code.replace(' ', '').length !== 6} className="h-12 rounded-lg bg-brand-primary px-5 font-semibold text-white disabled:opacity-50">Check</button>
				</form>

				{result && (
					<div className={`space-y-3 rounded-xl border p-5 ${result.valid ? 'border-success bg-success/5' : 'border-border-strong bg-white'}`}>
						<p className={`text-lg font-bold ${result.valid ? 'text-success' : 'text-text-primary'}`}>{result.valid ? 'Valid pass' : result.reason}</p>
						{result.firstName && (
							<dl className="grid grid-cols-[6rem_1fr] gap-1.5 text-sm">
								<dt className="text-text-secondary">Name</dt><dd className="font-semibold text-text-primary">{result.firstName}</dd>
								<dt className="text-text-secondary">Perk</dt><dd className="font-semibold text-text-primary">{result.perk}</dd>
								{result.crewSize && (<><dt className="text-text-secondary">Crew</dt><dd className="font-semibold text-text-primary">{result.crewSize} people</dd></>)}
								<dt className="text-text-secondary">Reference</dt><dd className="font-semibold text-text-primary">{result.reference}</dd>
							</dl>
						)}
						{result.valid && (
							<div className="space-y-2 border-t border-border pt-3">
								<label htmlFor="venue-pin" className="text-sm font-medium text-text-primary">Venue PIN</label>
								<div className="flex gap-2">
									<input id="venue-pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)}
										className="h-11 flex-1 rounded-lg border border-border-strong px-3 focus:border-brand-primary focus:outline-none" />
									<button onClick={redeem} disabled={busy || pin.length < 4} className="h-11 rounded-lg bg-neutral-900 px-4 font-semibold text-white disabled:opacity-50">Mark as used</button>
								</div>
							</div>
						)}
					</div>
				)}
				{message && <p role="status" className="text-center text-sm font-medium text-text-primary">{message}</p>}
			</main>
		</div>
	);
};

export default PassCheck;
