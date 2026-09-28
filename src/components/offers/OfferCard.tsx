import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ImagePreview from '@/components/ui/image-preview';
import Countdown from './Countdown';
import { UsageType, OfferKind } from '@/types/offer';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/currency';

/**
 * Only what the card actually renders. Kept separate from the full `Offer` so
 * listing screens can pass their own trimmed-down payloads.
 */
export interface OfferCardOffer {
	id: string;
	title: string;
	description?: string;
	coverImage?: string;
	offerKind?: OfferKind;
	discountType: string;
	discountValue: number;
	currency?: string;
	isStudentOwned?: boolean;
	redemptionType?: string;
	usage_type?: UsageType;
	max_claims_per_user?: number;
	category?: { name?: string } | string | null;
	merchant: {
		name: string;
		logo?: string;
	};
	endDate: Date | string;
}

const DISCOUNT_TYPES = {
	percentage: 'percentage',
	fixed: 'fixed_amount',
	bogo: 'buy_one_get_one',
	free: 'free',
};

/** The headline number a student scans for first. */
const formatReward = (offer: OfferCardOffer) => {
	switch (offer.discountType) {
		case DISCOUNT_TYPES.percentage:
			return `${offer.discountValue}% off`;
		case DISCOUNT_TYPES.fixed:
			return `${formatCurrency(offer.discountValue, offer.currency || DEFAULT_CURRENCY)} off`;
		case DISCOUNT_TYPES.bogo:
			return 'Buy one, get one';
		default:
			return 'Free';
	}
};

const describeUsage = (offer: OfferCardOffer) => {
	switch (offer.usage_type) {
		case UsageType.MULTI_USE:
			return offer.max_claims_per_user ? `Up to ${offer.max_claims_per_user} claims` : 'Multiple claims';
		case UsageType.UNLIMITED:
			return 'Unlimited claims';
		case UsageType.TIERED:
			return 'Loyalty rewards';
		default:
			return 'One claim per student';
	}
};

const describeRedemption = (offer: OfferCardOffer) => {
	if (offer.offerKind === OfferKind.EVENT) return 'Event access';
	if (offer.redemptionType === 'online') return 'Online';
	if (offer.redemptionType === 'in-store') return 'In store';
	return 'In store or online';
};

const OfferCard = ({ offer }: { offer: OfferCardOffer }) => {
	const isEvent = offer.offerKind === OfferKind.EVENT;

	// Listing screens send the category either whole or already flattened to a name
	const categoryName =
		typeof offer.category === 'string' ? offer.category : offer.category?.name;

	const meta = [
		categoryName,
		describeRedemption(offer),
		offer.isStudentOwned ? 'Student-owned' : null,
	].filter(Boolean);

	return (
		<Link
			to={`/offer/${offer.id}`}
			className="group flex h-full w-full flex-col border border-neutral-200 bg-white transition-colors hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
		>
			<ImagePreview
				src={offer.coverImage}
				alt={offer.title}
				caption={`${offer.title} — ${offer.merchant.name}`}
				expandable
			/>

			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-center gap-2.5">
					<Avatar className="h-7 w-7 border border-neutral-200">
						<AvatarImage src={offer.merchant.logo} alt="" className="object-cover" />
						<AvatarFallback className="bg-neutral-100 text-[11px] font-semibold text-neutral-600">
							{offer.merchant.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="truncate text-sm font-medium text-neutral-700">
						{offer.merchant.name}
					</span>
				</div>

				<h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-neutral-900 line-clamp-2">
					{offer.title}
				</h3>

				{offer.description && (
					<p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-2">
						{offer.description}
					</p>
				)}

				{meta.length > 0 && (
					<p className="mt-4 text-xs text-neutral-500">{meta.join(' · ')}</p>
				)}

				{/* Absorbs the slack so the reward line sits level across a row of cards */}
				<div className="mt-5 flex-1" />

				<div className="flex items-end justify-between gap-4 border-t border-neutral-200 pt-4">
					<div>
						<p className="text-base font-semibold text-neutral-900">
							{isEvent && !offer.discountValue ? 'Reserve a spot' : formatReward(offer)}
						</p>
						<p className="mt-0.5 text-xs text-neutral-500">
							{isEvent ? 'Register once' : describeUsage(offer)}
						</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-neutral-500">
							{isEvent ? 'Closes in' : 'Ends in'}
						</p>
						<Countdown endDate={offer.endDate} />
					</div>
				</div>
			</div>
		</Link>
	);
};

export default OfferCard;
