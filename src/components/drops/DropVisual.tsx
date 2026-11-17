import { ShoppingBag, Smartphone, Users, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Drop } from '@/api/drops';

const TINTS: Record<string, string> = {
	airtime: 'bg-[#e6f2ea]',
	voucher: 'bg-[#f6ece2]',
	crew: 'bg-background-soft',
};

/** Cover for a drop. Drops show the perk itself, never a brand's logo. */
const DropVisual = ({ drop, label, labelTone = 'light', className }: {
	drop: Pick<Drop, 'kind' | 'title'> & { coverImage?: string | null };
	label?: string;
	labelTone?: 'light' | 'brand' | 'dark';
	className?: string;
}) => {
	const Icon = drop.kind === 'airtime' ? Smartphone
		: drop.kind === 'crew' ? Users
		: /dining|food/i.test(drop.title) ? UtensilsCrossed : ShoppingBag;
	return (
		<div className={cn('relative flex aspect-video w-full items-center justify-center', TINTS[drop.kind], className)}>
			{drop.coverImage
				? <img src={drop.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
				: <Icon className="h-14 w-14 text-neutral-800" strokeWidth={1.2} aria-hidden />}
			{label && (
				<span className={cn(
					'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide',
					labelTone === 'brand' && 'bg-brand-primary text-white',
					labelTone === 'dark' && 'bg-neutral-900 text-white',
					labelTone === 'light' && 'bg-white/90 text-text-primary',
				)}>
					{label}
				</span>
			)}
		</div>
	);
};

export default DropVisual;
