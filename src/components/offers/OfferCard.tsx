import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Star, Repeat, Infinity, Trophy, Users, GraduationCap } from 'lucide-react';
import Countdown from './Countdown';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UsageType } from '@/types/offer';

const DICOUNT_TYPES = {
	percentage: 'percentage',
	fixed: 'fixed_amount',
	bogo: 'buy_one_get_one',
	free: 'free',
};

const OfferCard = ({ offer }) => {
	const navigate = useNavigate();

	// Get usage type display info
	const getUsageTypeInfo = (usageType: UsageType) => {
		switch (usageType) {
			case UsageType.SINGLE_USE:
				return { icon: Users, label: "One-time use", color: "bg-blue-100 text-blue-700" };
			case UsageType.MULTI_USE:
				return { icon: Repeat, label: `Up to ${offer.max_claims_per_user}x`, color: "bg-green-100 text-green-700" };
			case UsageType.UNLIMITED:
				return { icon: Infinity, label: "Unlimited", color: "bg-purple-100 text-purple-700" };
			case UsageType.TIERED:
				return { icon: Trophy, label: "Loyalty rewards", color: "bg-yellow-100 text-yellow-700" };
			default:
				return { icon: Users, label: "One-time use", color: "bg-blue-100 text-blue-700" };
		}
	};

	// Get user's current usage status
	const getUserUsageStatus = () => {
		if (!offer.user_usage_stats || !offer.claim_availability) return null;

		const { usage_count } = offer.user_usage_stats;
		const { can_claim_now, remaining_claims } = offer.claim_availability;

		if (usage_count === 0) {
			return { status: "available", message: "Available to claim" };
		} else if (can_claim_now) {
			return { status: "can_claim_more", message: `${remaining_claims} claims left` };
		} else {
			return { status: "limit_reached", message: "Limit reached" };
		}
	};

	const formatCurrency = (value, currency) => {
		const locale = window.navigator.language || 'en-US';
		const formatted = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
			currencyDisplay: 'symbol',
			useGrouping: true,
		}).formatToParts(1)
			.find(x => x.type === "currency")
			.value;
		return formatted + ' ' + value.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
	};

	const sym = (currency, locale) =>
		new Intl.NumberFormat(locale, { style: 'currency', currency })
			.formatToParts(1)
			.find(x => x.type === "currency")
			.value;

	const usageTypeInfo = getUsageTypeInfo(offer.usage_type || UsageType.SINGLE_USE);
	const userUsageStatus = getUserUsageStatus();
	const UsageIcon = usageTypeInfo.icon;

	return (
		<div onClick={() => navigate(`/offer/${offer.id}`)} className="bg-white min-w-[90%] md:min-w-[33%] xl:min-w-[25%] rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all overflow-hidden group">
			<div className="relative">
				<div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden">
					<img
						src={offer.coverImage || 'https://via.placeholder.com/600x400?text=Offer+Image'}
						alt={offer.title}
						className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
					/>
				</div>
				<div className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
					{offer.discountType === DICOUNT_TYPES.percentage
						? `${offer.discountValue}% OFF`
						: offer.discountType === DICOUNT_TYPES.fixed ? `${formatCurrency(offer.discountValue, offer.currency)} OFF`
							: offer.discountType === DICOUNT_TYPES.bogo ? 'Buy 1 Get 1 Free'
								: 'Free'}
				</div>
				<div className="absolute bottom-3 right-3 bg-white/90 text-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center">
					<Clock className="h-3 w-3 mr-1" />
					<Countdown endDate={offer.endDate} />
				</div>
			</div>

			<div className="p-5">
				<div className="flex items-center mb-3">
					<div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden mr-3">
						<Avatar>
							<AvatarImage src={offer.merchant.logo} alt={offer.merchant.name} className="w-full h-full object-cover" />
							<AvatarFallback className="bg-gray-200 text-gray-500">
								{offer.merchant.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</div>
					<div>
						<h3 className="font-bold text-lg text-gray-900">{offer.merchant.name}</h3>
						<div className="flex items-center text-xs text-gray-500">
							<Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
							<span>4.8 • {offer.couponLimit} coupons</span>
						</div>
					</div>
				</div>

				<h4 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h4>
				<p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

				{/* Usage type and status indicators */}
				<div className="flex flex-wrap gap-2 mb-3">
					{offer.isStudentOwned && (
						<Badge className="text-xs font-medium bg-amber-100 text-amber-900 border-0">
							<GraduationCap className="h-3 w-3 mr-1" />
							Student-Owned
						</Badge>
					)}

					{/* Usage type badge */}
					<Badge className={`text-xs font-medium ${usageTypeInfo.color} border-0`}>
						<UsageIcon className="h-3 w-3 mr-1" />
						{usageTypeInfo.label}
					</Badge>

					{/* User usage status badge */}
					{userUsageStatus && (
						<Badge 
							variant="outline" 
							className={`text-xs font-medium ${
								userUsageStatus.status === 'available' ? 'border-green-200 text-green-700 bg-green-50' :
								userUsageStatus.status === 'can_claim_more' ? 'border-blue-200 text-blue-700 bg-blue-50' :
								'border-gray-200 text-gray-700 bg-gray-50'
							}`}
						>
							{userUsageStatus.message}
						</Badge>
					)}

					{/* Show savings for users with usage history */}
					{offer.user_usage_stats && offer.user_usage_stats.total_savings > 0 && (
						<Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700 bg-green-50">
							Saved ${(offer.user_usage_stats.total_savings / 100).toFixed(2)}
						</Badge>
					)}
				</div>

				{/* Category tag */}
				<div className="inline-flex text-nowrap items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
					{offer.category?.name} <span className={`${!offer.category?.name ? 'hidden' : ''} mx-2`}>•</span> {offer.redemptionType === 'online' ? 'Online' : offer.redemptionType === 'in-store' ? 'In-store' : 'In-Store/Online'}
				</div>
			</div>
		</div>
	)
};

export default OfferCard;
