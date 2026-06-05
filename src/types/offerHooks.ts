// Types based on the provided backend contract assumptions

export interface Merchant {
  id: string;
  name: string;
  logo: string;
  website: string;
  isApproved?: boolean; // Optional based on existing usage
  isStudentOwned?: boolean;
}

export interface CouponStats {
  total: number;
  redeemed: number;
  claimed: number;
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  BUY_ONE_GET_ONE = "buy_one_get_one",
  FREE_ITEM = "free_item",
}

export enum OfferUsageType {
  SINGLE_USE = "single_use",
  MULTI_USE = "multi_use",
  UNLIMITED = "unlimited",
  TIERED = "tiered",
}

export interface OfferDetails {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  discountType: DiscountType;
  discountValue: number;
  currency: string;
  usage_type: OfferUsageType;
  merchant: Merchant;
  coupons: CouponStats;
  status: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  termsAndConditions: string;
  isStudentOwned?: boolean;
  max_claims_per_user?: number;
  cooldown_period_hours?: number;
}

export interface CouponClaimSuccessData {
  code: string;
  qrCode: string;
  expiryDate: string;
  status: string;
  usage_stats: {
    total_claims: number;
    total_savings: number;
    can_claim_more: boolean;
    next_available_claim: string | null;
  };
}

export interface AvailableClaims {
  can_claim_now: boolean;
  reason: string | null;
  remaining_claims: number | string;
  current_usage_count: number;
  next_available_claim: string | null;
  offer_details: {
    usage_type: OfferUsageType;
    max_claims_per_user: number | null;
    cooldown_period_hours: number | null;
  };
}

export interface RecommendedOffer {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  discountType: DiscountType;
  discountValue: number;
  currency: string;
  merchant: {
    id: string;
    name: string;
    logo: string;
  };
  category?: {
    id: string;
    name: string;
  };
  status: string;
  startDate: string;
  endDate: string;
  termsAndConditions?: string;
  isStudentOwned?: boolean;
  usage_type?: OfferUsageType;
  max_claims_per_user?: number;
  cooldown_period_hours?: number;
}
