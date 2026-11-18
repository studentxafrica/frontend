import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import DropVisual from './DropVisual';
import { Drop, countdownLabel, formatDropDay, formatDropWhen, kindLabel } from '@/api/drops';

/** The card badge: the reward's own badge, or "UNLOCKED ✓" once every drop of it has been picked. */
export const rewardBadge = (drop: Drop, unlocked: boolean) =>
	unlocked ? 'UNLOCKED ✓' : drop.badge || countdownLabel(drop.pickAt).toUpperCase();

/**
 * A StudentXmas reward, in the same layout as the deals page cards. `drop` is
 * the reward's next drop (or its last, once `unlocked`).
 */
const DropCard = ({ drop, unlocked = drop.status === 'ended' }: { drop: Drop; unlocked?: boolean }) => (
	<Link
		to={`/drops/${drop.id}`}
		className={`group flex h-full w-full flex-col overflow-hidden rounded-[22px] border bg-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_0_#f1dfe7] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${drop.isNext && !unlocked ? 'border-brand-primary' : 'border-[#ead8e0]'}`}
	>
		<DropVisual
			drop={drop}
			label={rewardBadge(drop, unlocked)}
			labelTone={unlocked ? 'muted' : drop.isNext ? 'brand' : 'light'}
			className={unlocked ? 'grayscale-[60%]' : ''}
		/>
		<div className="flex flex-1 flex-col p-5">
			<div className="flex items-center justify-between gap-2.5">
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white">
						<Zap className="h-4 w-4 fill-brand-primary text-brand-primary" aria-hidden />
					</span>
					<span className="truncate text-sm font-medium text-neutral-700">StudentX</span>
				</span>
				<span className="text-xs font-medium text-neutral-500">{kindLabel(drop.kind)}</span>
			</div>
			<h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-neutral-900 line-clamp-2">{drop.title}</h3>
			{drop.subtext && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{drop.subtext}</p>}
			<p className="mt-4 text-xs text-neutral-500">StudentXmas</p>
			<div className="mt-5 flex-1" />
			<div className="border-t border-neutral-200 pt-4 text-right">
				<p className="text-xs text-neutral-500">{unlocked ? 'Unlocked' : 'Drops on'}</p>
				<p className="text-sm font-semibold text-neutral-900">{unlocked ? formatDropDay(drop.pickAt) : formatDropWhen(drop.pickAt)}</p>
			</div>
		</div>
	</Link>
);

export default DropCard;
