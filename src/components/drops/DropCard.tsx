import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import DropVisual from './DropVisual';
import { Drop, DropResult, formatDropDay, formatDropWhen, kindLabel, quantityLabel } from '@/api/drops';

const RESULT_LABEL: Record<NonNullable<DropResult>, string> = {
	picked: 'You were picked',
	not_picked: 'Not picked this time',
	not_verified: 'Not verified in time',
	not_in: 'Before you joined',
};

/** A StudentXmas drop, in the same layout as the deals page cards. */
const DropCard = ({ drop }: { drop: Drop }) => {
	const ended = drop.status === 'ended';
	const label = drop.result === 'picked' ? 'PICKED FOR YOU'
		: ended ? 'ENDED'
		: drop.isNext ? 'NEXT DROP' : `DROP ${drop.number}`;
	const tone = drop.result === 'picked' ? 'dark' : drop.isNext ? 'brand' : 'light';

	return (
		<Link
			to={`/drops/${drop.id}`}
			className={`group flex h-full w-full flex-col border bg-white transition-colors hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${drop.isNext ? 'border-brand-primary' : 'border-neutral-200'}`}
		>
			<DropVisual drop={drop} label={label} labelTone={tone} className={ended ? 'grayscale-[40%]' : ''} />
			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-center justify-between gap-2.5">
					<span className="flex items-center gap-2.5">
						<span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white">
							<Zap className="h-4 w-4 fill-brand-primary text-brand-primary" aria-hidden />
						</span>
						<span className="truncate text-sm font-medium text-neutral-700">StudentX</span>
					</span>
					<span className="text-xs font-medium text-neutral-500">Drop {drop.number} of {drop.total}</span>
				</div>
				<h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-neutral-900 line-clamp-2">{drop.title}</h3>
				<p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-2">
					{drop.description}
				</p>
				<p className="mt-4 text-xs text-neutral-500">{kindLabel(drop.kind)} · StudentXmas</p>
				<div className="mt-5 flex-1" />
				<div className="flex items-end justify-between gap-4 border-t border-neutral-200 pt-4">
					<div>
						<p className="text-base font-semibold text-neutral-900">{quantityLabel(drop)}</p>
						<p className="mt-0.5 text-xs text-neutral-500">{ended && drop.result ? RESULT_LABEL[drop.result] : 'To be won'}</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-neutral-500">{ended ? 'Ended' : 'Drops on'}</p>
						<p className="text-sm font-semibold text-neutral-900">{ended ? formatDropDay(drop.pickAt) : formatDropWhen(drop.pickAt)}</p>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default DropCard;
