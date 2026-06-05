export enum OfferType {
	PERCENTAGE = "percentage",
	FIXED_AMOUNT = "fixed_amount",
	BUY_ONE_GET_ONE = "buy_one_get_one",
	FREE_ITEM = "free_item"
}

export enum UsageType {
	SINGLE_USE = "single_use",
	MULTI_USE = "multi_use",
	UNLIMITED = "unlimited",
	TIERED = "tiered"
}

export interface TierRule {
	min_usage: number;
	discount_multiplier: number;
	name: string;
}

export interface TierProgression {
	tiers: TierRule[];
}

export interface UsageStats {
	usage_count: number;
	total_savings: number;
	total_redemptions: number;
	first_claimed_at: string | null;
	last_claimed_at: string | null;
	last_redemption_at: string | null;
	average_days_between_usage: number | null;
}

export interface DiscountInfo {
	discount_type: string;
	discount_value: number;
	base_discount_value?: number;
	tier?: number;
	tier_name?: string;
	tier_multiplier?: number;
}

export interface ClaimAvailability {
	can_claim_now: boolean;
	reason: string | null;
	remaining_claims: number | string;
	current_usage_count: number;
	next_available_claim: string | null;
	offer_details: {
		usage_type: UsageType;
		max_claims_per_user: number | null;
		cooldown_period_hours: number | null;
	};
}

export interface Offer {
	id: string;
	title: string;
	description: string;
	slug: string;
	coverImage: string;
	discountType: OfferType;
	discountValue: number;
	currency: string;
	isSaved: boolean;
	isStudentOwned?: boolean;
	redemptionType?: string;
	couponLimit?: number;
	category?: {
		id: string;
		name: string;
		slug?: string;
	} | null;
	merchant: {
		id: string;
		name: string;
		logo: string;
		website: string;
		isApproved: boolean;
		isStudentOwned?: boolean;
	};
	coupons: {
		total: number;
		claimed: number;
		redeemed: number;
	}
	status: string;
	startDate: Date;
	endDate: Date;
	termsAndConditions: string;
	// New flexible usage system fields
	usage_type?: UsageType;
	max_claims_per_user?: number;
	cooldown_period_hours?: number;
	tier_progression?: TierProgression;
	// Optional usage statistics for current user
	user_usage_stats?: UsageStats;
	claim_availability?: ClaimAvailability;
}
