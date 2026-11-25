import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, X } from 'lucide-react';
import { Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CampaignView, campaignWinners, formatDropWhen, getCampaign } from '@/api/drops';

const SEEN_KEY = 'studentxmas_popup';
/** Shortest gap before the pop-up may open on its own again. */
const REOPEN_AFTER_MS = 4 * 24 * 60 * 60 * 1000;
/** Lets the page settle before the pop-up appears. */
const OPEN_DELAY_MS = 1200;

interface SeenRecord {
	at: number;
	dropId: string;
}

const readSeen = (): SeenRecord | null => {
	const raw = localStorage.getItem(SEEN_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as SeenRecord;
	} catch {
		return null;
	}
};

/**
 * Opens on a visitor's first visit, then again only when a new drop is up next
 * and a few days have passed. Members who've already joined aren't interrupted.
 */
const shouldOpen = (view: CampaignView): boolean => {
	if (!view.nextDrop || view.member.state === 'joined') return false;
	try {
		const seen = readSeen();
		if (!seen) return true;
		return seen.dropId !== view.nextDrop.id && Date.now() - seen.at >= REOPEN_AFTER_MS;
	} catch {
		// Without storage we can't tell how often it has shown, so don't show it
		return false;
	}
};

const markSeen = (dropId: string) => {
	try {
		localStorage.setItem(SEEN_KEY, JSON.stringify({ at: Date.now(), dropId } satisfies SeenRecord));
	} catch {
		// Nothing to remember it with; the launcher still works
	}
};

/**
 * StudentXmas announcement for the home page: a pop-up shown now and then, and
 * a small launcher that stays in the corner so the campaign is one tap away.
 */
const CampaignPopup = () => {
	const [view, setView] = useState<CampaignView | null>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		let active = true;
		let timer: ReturnType<typeof setTimeout> | undefined;
		getCampaign()
			.then((campaign) => {
				if (!active) return;
				setView(campaign);
				if (shouldOpen(campaign)) {
					timer = setTimeout(() => {
						if (!active) return;
						setOpen(true);
						markSeen(campaign.nextDrop!.id);
					}, OPEN_DELAY_MS);
				}
			})
			.catch(() => setView(null));
		return () => {
			active = false;
			if (timer) clearTimeout(timer);
		};
	}, []);

	if (!view || !view.nextDrop) return null;

	const next = view.nextDrop;
	const joined = view.member.state === 'joined';
	const winners = campaignWinners(view);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{!open && (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-primary py-2.5 pl-3 pr-4 text-sm font-bold text-white shadow-[0_6px_0_#ead8e0] transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
				>
					<span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#ffdd70] text-[#24131d]">
						<Gift className="h-4 w-4" aria-hidden />
						<span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
						</span>
					</span>
					StudentXmas
				</button>
			)}

			<DialogPortal>
				{/* Above the announcement strip, which sits over the header */}
				<DialogOverlay className="z-[70] bg-[#24131d]/70 backdrop-blur-sm" />
				<DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] bg-white shadow-[0_12px_0_#ead8e0] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:overflow-hidden">
					<div className="grid md:grid-cols-[1.05fr_1fr]">
						{/* Photos: the prizes, and the people winning them */}
						<div className="relative grid h-56 grid-cols-3 grid-rows-2 gap-1.5 bg-[#24131d] p-1.5 sm:h-64 md:h-auto md:min-h-[26rem]">
							<img
								src="/images/rewards/airtime.jpg"
								alt="Two students laughing over their phones"
								className="col-span-2 row-span-2 h-full w-full rounded-[22px] object-cover md:rounded-l-[22px] md:rounded-r-md"
							/>
							<img
								src="/images/rewards/bowling.jpg"
								alt="Bowling ball and pins"
								className="h-full w-full rounded-md rounded-tr-[22px] object-cover"
							/>
							<img
								src="/images/rewards/karting.jpg"
								alt="Go-kart on an indoor track"
								className="h-full w-full rounded-md rounded-br-[22px] object-cover md:rounded-br-md"
							/>
							<span className="absolute bottom-4 left-4 rounded-full bg-[#ffdd70] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#24131d] shadow">
								{winners} winners
							</span>
						</div>

						<div className="relative flex flex-col overflow-hidden p-6 sm:p-8">
							<span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-[#ffdd70]/80" />

							<span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
								<Gift className="h-3.5 w-3.5" aria-hidden />
								Now on · StudentXmas
							</span>

							<DialogTitle className="relative mt-4 text-2xl font-extrabold leading-tight tracking-[-0.02em] text-[#24131d] sm:text-3xl">
								{winners} verified winners this festive season
							</DialogTitle>
							<DialogDescription className="relative mt-3 text-base leading-relaxed text-neutral-600">
								Airtime, vouchers, bowling and go-karting, given away in drops all season long.
							</DialogDescription>

							<div className="relative mt-6 rounded-2xl bg-[#fdf1f6] p-4">
								<p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Next up</p>
								<p className="mt-1 font-bold text-[#24131d]">{next.title}</p>
								<p className="text-sm text-neutral-600">{formatDropWhen(next.pickAt)}</p>
							</div>

							<div className="relative mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
								<Link
									to="/drops"
									onClick={() => setOpen(false)}
									className="inline-flex items-center justify-center gap-2 rounded-full bg-[#24131d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24131d]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
								>
									{joined ? 'See your drops' : 'Join StudentXmas'}
									<ArrowRight className="h-4 w-4" aria-hidden />
								</Link>
								<DialogClose className="rounded-full px-4 py-3 text-sm font-semibold text-neutral-500 transition hover:text-[#24131d] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
									Maybe later
								</DialogClose>
							</div>
						</div>
					</div>

					<DialogClose className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#24131d] shadow transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:bg-white">
						<X className="h-4 w-4" aria-hidden />
						<span className="sr-only">Close</span>
					</DialogClose>
				</DialogPrimitive.Content>
			</DialogPortal>
		</Dialog>
	);
};

export default CampaignPopup;
