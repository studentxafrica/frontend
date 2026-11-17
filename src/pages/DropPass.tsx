import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { apiMessage, getLivePass, LivePass } from '@/api/drops';

const CODE_SECONDS = 30;
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' });

/**
 * The StudentX live pass, styled on the StudentX card in the profile. The code
 * comes from the server and changes every 30 seconds; the running clock shows
 * the screen is live rather than a screenshot.
 */
const DropPass = () => {
	const { pickId } = useParams();
	const [pass, setPass] = useState<LivePass | null>(null);
	const [error, setError] = useState('');
	const [secondsLeft, setSecondsLeft] = useState(CODE_SECONDS);
	const [now, setNow] = useState(() => new Date());
	const offset = useRef(0);

	const load = useCallback(async () => {
		try {
			const fresh = await getLivePass(pickId!);
			offset.current = new Date(fresh.serverTime).getTime() - Date.now();
			setPass(fresh);
			setSecondsLeft(fresh.secondsLeft);
			setError('');
		} catch (err) {
			setError(apiMessage(err, "We couldn't load your pass. Check your connection."));
		}
	}, [pickId]);

	useEffect(() => { load(); }, [load]);

	useEffect(() => {
		const tick = setInterval(() => {
			setNow(new Date(Date.now() + offset.current));
			setSecondsLeft((s) => {
				if (s <= 1) { load(); return CODE_SECONDS; }
				return s - 1;
			});
		}, 1000);
		return () => clearInterval(tick);
	}, [load]);

	const clock = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' });

	return (
		<div className="flex min-h-screen flex-col bg-background-lighter">
			<Header />
			<main className="flex flex-grow flex-col items-center gap-5 px-4 pb-16 pt-28">
				{error && !pass && <p className="max-w-sm text-center text-text-secondary">{error} <Link to="/me?tab=drops" className="text-text-link underline">Back to my drops</Link></p>}
				{!pass && !error && <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />}
				{pass && (
					<>
						<div className="relative w-full max-w-[20rem] overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(38,38,40,0.35)] ring-1 ring-black/5">
							<div className="relative h-28 bg-brand-primary px-4 pt-3.5 text-white">
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1.5 text-sm font-bold tracking-tight"><Zap className="h-4 w-4 fill-white" aria-hidden />StudentX</span>
									<span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">Live pass</span>
								</div>
								<div className="absolute bottom-0 left-0 h-1 bg-white/80 transition-[width] duration-1000 ease-linear" style={{ width: `${(secondsLeft / CODE_SECONDS) * 100}%` }} />
							</div>
							<div className="relative -mt-9 flex justify-center">
								<span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 ring-2 ring-brand-primary">
									<span className="flex h-full w-full items-center justify-center rounded-full bg-background-subtle text-lg font-bold text-text-primary">
										{pass.holder.firstName[0]}{pass.holder.lastName?.[0] ?? ''}
									</span>
								</span>
							</div>
							<div className="flex flex-col items-center gap-3 px-5 pb-5 pt-2 text-center">
								<div>
									<p className="text-lg font-bold text-text-primary">{pass.holder.firstName} {pass.holder.lastName}</p>
									<p className="text-xs font-semibold text-success">Verified student{pass.holder.school ? ` · ${pass.holder.school}` : ''}</p>
								</div>
								<div className="w-full border-t border-border pt-3">
									<p className="font-bold text-text-primary">{pass.drop.title}</p>
									<p className="text-xs text-text-secondary">{pass.drop.brand}</p>
								</div>
								{pass.redeemedAt ? (
									<p className="w-full rounded-lg bg-background-subtle p-4 font-semibold text-text-secondary">Used on {day(pass.redeemedAt)}</p>
								) : (
									<div className="flex w-full flex-col items-center gap-2 rounded-lg bg-background-subtle p-3" aria-live="polite">
										<span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Show at the counter</span>
										<span className="font-mono text-3xl font-bold tracking-[0.12em] text-text-primary">{pass.code.slice(0, 3)} {pass.code.slice(3)}</span>
										<span className="text-sm font-bold tabular-nums text-text-primary">{clock}</span>
									</div>
								)}
								<dl className="grid w-full grid-cols-[5rem_1fr] gap-1.5 text-left text-[11px]">
									<dt className="font-semibold text-text-primary">Reference</dt><dd className="text-text-secondary">{pass.reference}</dd>
									<dt className="font-semibold text-text-primary">Use by</dt><dd className="text-text-secondary">{day(pass.expiresAt)}</dd>
									{pass.crew.length > 0 && (<><dt className="font-semibold text-text-primary">With</dt><dd className="text-text-secondary">{pass.crew.join(', ')}</dd></>)}
								</dl>
							</div>
						</div>
						<p className="max-w-xs text-center text-sm text-text-secondary">Show this screen at the counter when you use your perk.</p>
					</>
				)}
			</main>
		</div>
	);
};

export default DropPass;
