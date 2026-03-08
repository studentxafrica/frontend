
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Star,
  Percent,
  DollarSign,
  Eye,
  ShoppingBag,
  Repeat,
  Trophy,
  Users,
  Infinity
} from "lucide-react";
import { Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface CouponTrackerProps {
  user: {
    totalSavings: number;
    dealsUsed: number;
    coupons: Coupon[];
  };
}

interface Coupon {
  id: string;
  code: string;
  title: string;
  brand: string;
  brandLogo: string;
  discount: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  description: string;
  expiryDate: string;
  status: 'active' | 'redeemed' | 'expired';
  category: {
    id: string;
    name: string;
  };
  savings?: number;
  usedDate?: string;
  originalPrice?: number;
  finalPrice?: number;
  redemptionType?: string; // 'online' or 'in-store'
  // New flexible system fields
  offer?: {
    id: string;
    usage_type?: 'single_use' | 'multi_use' | 'unlimited' | 'tiered';
    max_claims_per_user?: number;
    cooldown_period_hours?: number;
  };
  usage_stats?: {
    total_claims: number;
    total_savings: number;
    can_claim_more: boolean;
    next_available_claim: string | null;
  };
  tier_info?: {
    tier: number;
    tier_name: string;
    tier_multiplier: number;
  };
}

export const CouponTracker: React.FC<CouponTrackerProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();
  const [copied, setIsCopied] = useState(false);

  const coupons: Coupon[] = user.coupons;

  const activeCoupons = coupons.filter(coupon => coupon.status === 'active');
  const usedCoupons = coupons.filter(coupon => coupon.status === 'redeemed');
  const expiredCoupons = coupons.filter(coupon => coupon.status === 'expired');

  const totalSavingsFromCoupons = usedCoupons.reduce((total, coupon) => total + (coupon.savings || 0), 0);

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getUsageTypeIcon = (usageType: string) => {
    switch (usageType) {
      case 'single_use':
        return <Users className="h-3 w-3" />;
      case 'multi_use':
        return <Repeat className="h-3 w-3" />;
      case 'unlimited':
        return <Infinity className="h-3 w-3" />;
      case 'tiered':
        return <Trophy className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getUsageTypeLabel = (usageType: string, maxClaims?: number) => {
    switch (usageType) {
      case 'single_use':
        return 'One-time use';
      case 'multi_use':
        return `Up to ${maxClaims}x`;
      case 'unlimited':
        return 'Unlimited';
      case 'tiered':
        return 'Loyalty rewards';
      default:
        return 'One-time use';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'used':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'expired':
        return 'bg-neutral-light/10 text-neutral-medium border-neutral-light/20';
      default:
        return 'bg-neutral-lighter text-neutral-medium border-neutral-lighter';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Code Copied!",
      description: "The coupon code has been copied to your clipboard",
    });
    setTimeout(() => setIsCopied(false), 3000);
    // You could add a toast notification here
  };

  const renderCouponCard = (coupon: Coupon) => (
    <Card key={coupon.id} className="border-neutral-lighter hover:border-brand-primary/30 transition-all">
      <CardContent className="p-4 sm:p-6">
        {/* Top row: Logo + Title/Brand + Action button */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Brand Logo */}
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-neutral-lighter shrink-0">
            <AvatarImage
              src={coupon.brandLogo}
              alt={coupon.brand}
              className="object-cover"
            />
            <AvatarFallback className="bg-background-subtle rounded-xl text-sm">
              {coupon.brand.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Title + Brand */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-semibold text-text-primary truncate">{coupon.title}</h3>
            <p className="text-sm text-neutral-medium">{coupon.brand}</p>
          </div>

          {/* Action button — always visible top-right */}
          <div className="shrink-0">
            {coupon.status === 'active' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">
                    <ExternalLink className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Redeem</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>How to Claim</DialogTitle>
                    <DialogDescription>
                      Here are the steps to use this coupon:
                    </DialogDescription>
                  </DialogHeader>
                  <Card className="border-neutral-lighter mb-4">
                    <CardContent className="p-4">
                      <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-medium">
                        {coupon.redemptionType === 'online' ? (
                          <>
                            <li>Visit the <strong>{coupon.brand}</strong> website or app.</li>
                            <li>Enter the code <span className="font-mono font-bold">{coupon.code}</span> at checkout.</li>
                            <li>Enjoy your discount!</li>
                          </>
                        ) : (
                          <>
                            <li>Visit a <strong>{coupon.brand}</strong> store near you.</li>
                            <li>Show the coupon code <span className="font-mono font-bold">{coupon.code}</span> to the cashier.</li>
                            <li>Enjoy your discount!</li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            )}
            {coupon.status === 'redeemed' && (
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">View Details</span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-medium mt-3 mb-3">{coupon.description}</p>

        {/* Coupon Code + Discount */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="font-mono font-bold text-brand-primary text-sm">{coupon.code}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:bg-brand-primary/20 outline-none focus:outline-none"
              onClick={() => copyToClipboard(coupon.code)}
            >
              {copied ? <CheckCircle className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-1 text-brand-primary font-semibold text-sm">
            {getDiscountIcon(coupon.discountType)}
            <span>{coupon.discount}</span>
          </div>
        </div>

        {/* Usage Type and Stats */}
        {(coupon.offer?.usage_type || coupon.usage_stats) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {coupon.offer?.usage_type && (
              <Badge variant="outline" className="text-xs">
                {getUsageTypeIcon(coupon.offer.usage_type)}
                <span className="ml-1">
                  {getUsageTypeLabel(coupon.offer.usage_type, coupon.offer.max_claims_per_user)}
                </span>
              </Badge>
            )}
            {coupon.usage_stats && (
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                {coupon.usage_stats.total_claims} claims
              </Badge>
            )}
            {coupon.tier_info && (
              <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                <Trophy className="h-3 w-3 mr-1" />
                {coupon.tier_info.tier_name}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata: Expiry + Category */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-medium">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Expires {formatDate(coupon.expiryDate)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {coupon.category.name}
          </Badge>
        </div>

        {/* Used Coupon Details */}
        {coupon.status === 'redeemed' && coupon.usedDate && (
          <div className="mt-3 p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-neutral-medium">Used on {formatDate(coupon.usedDate)}</span>
              {coupon.originalPrice && coupon.finalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-medium line-through">${coupon.originalPrice}</span>
                  <span className="text-success font-semibold">${coupon.finalPrice}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">{activeCoupons.length}</div>
            <div className="text-sm text-neutral-medium">Active Coupons</div>
          </CardContent>
        </Card>
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success mb-1">{usedCoupons.length}</div>
            <div className="text-sm text-neutral-medium">Used Coupons</div>
          </CardContent>
        </Card>
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-brand-accent mb-1">${totalSavingsFromCoupons.toFixed(2)}</div>
            <div className="text-sm text-neutral-medium">Total Savings</div>
          </CardContent>
        </Card>
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning mb-1">{expiredCoupons.length}</div>
            <div className="text-sm text-neutral-medium">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-neutral-lighter">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium h-4 w-4" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            Active ({activeCoupons.length})
          </TabsTrigger>
          <TabsTrigger value="used" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            Used ({usedCoupons.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
            Expired ({expiredCoupons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCoupons.length > 0 ? (
            activeCoupons.map(renderCouponCard)
          ) : (
            <Card className="border-neutral-lighter">
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Active Coupons</h3>
                <p className="text-neutral-medium mb-4">Discover new deals to add coupons to your collection</p>
                <Button onClick={() => navigate('/deals')} className="bg-brand-primary hover:bg-brand-primary/90">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Deals
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4">
          {usedCoupons.length > 0 ? (
            usedCoupons.map(renderCouponCard)
          ) : (
            <Card className="border-neutral-lighter">
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Used Coupons</h3>
                <p className="text-neutral-medium mb-4">
                  You haven't used any coupons yet. Start saving with our exclusive deals!
                </p>
                <Button onClick={() => navigate('/deals')} className="bg-brand-primary hover:bg-brand-primary/90">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Deals
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredCoupons.length > 0 ? (
            expiredCoupons.map(renderCouponCard)
          ) : (
            <Card className="border-neutral-lighter">
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Expired Coupons</h3>
                <p className="text-neutral-medium mb-4">
                  You have no expired coupons. Keep an eye on your active deals!
                </p>
                <Button onClick={() => navigate('/deals')} className="bg-brand-primary hover:bg-brand-primary/90">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Deals
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};