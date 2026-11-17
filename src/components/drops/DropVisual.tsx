import { cn } from '@/lib/utils';
import type { Drop } from '@/api/drops';

/*
 * Default photos for drops without an uploaded cover, from Unsplash (free to use,
 * no attribution required):
 *   airtime      unsplash.com/photos/_t15AWPJNmg
 *   airtime-alt  unsplash.com/photos/_MExu0l-sCM
 *   dining       unsplash.com/photos/UEjjO-aJtZ8
 *   fashion      unsplash.com/photos/ubgAXY-HQZs
 *   bowling      unsplash.com/photos/YxiW_hx3lyA
 *   arcade       unsplash.com/photos/jnV3zZfTNuo
 *   karting      unsplash.com/photos/ALSyG2e6dd4
 */
export const dropPhoto = (drop: Pick<Drop, 'kind' | 'title'> & Partial<Pick<Drop, 'number' | 'description'>>) => {
	const text = `${drop.title} ${drop.description ?? ''}`;
	if (drop.kind === 'airtime') return (drop.number ?? 1) % 2 === 0 ? '/drops/airtime-alt.jpg' : '/drops/airtime.jpg';
	if (/arcade/i.test(drop.title)) return '/drops/arcade.jpg';
	if (/bowling/i.test(drop.title)) return '/drops/bowling.jpg';
	if (/kart/i.test(drop.title)) return '/drops/karting.jpg';
	if (/dining|food|restaurant|meal/i.test(text)) return '/drops/dining.jpg';
	if (/fashion|cloth|fit|shopzetu|wear/i.test(text)) return '/drops/fashion.jpg';
	return '/drops/airtime.jpg';
};

/** Cover for a drop: its uploaded photo, or a stock photo of the perk. Never a brand's logo. */
const DropVisual = ({ drop, label, labelTone = 'light', className }: {
	drop: Pick<Drop, 'kind' | 'title'> & Partial<Pick<Drop, 'number' | 'description'>> & { coverImage?: string | null };
	label?: string;
	labelTone?: 'light' | 'brand' | 'dark';
	className?: string;
}) => (
	<div className={cn('relative aspect-video w-full overflow-hidden bg-neutral-200', className)}>
		<img
			src={drop.coverImage || dropPhoto(drop)}
			alt=""
			loading="lazy"
			className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
		/>
		{label && (
			<span className={cn(
				'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide shadow-sm',
				labelTone === 'brand' && 'bg-[#ffdd70] text-[#24131d]',
				labelTone === 'dark' && 'bg-neutral-900 text-white',
				labelTone === 'light' && 'bg-white/95 text-text-primary',
			)}>
				{label}
			</span>
		)}
	</div>
);

export default DropVisual;
