import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Offer, OfferType } from "@/types/offer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { Clock, Code, ChevronLeft, QrCode, Copy, Link2, Bookmark, Share2, Loader2, BookmarkCheck, BadgeCent, BadgeCheck, Verified, Repeat, Infinity, Trophy, Users, TrendingUp, Calendar } from "lucide-react";
import axiosInstance from "@/api/axios";
import { Coupon, CouponClaimResponse } from "@/types/coupon";
import { UsageType, ClaimAvailability, UsageStats } from "@/types/offer";
import { ConfirmModal } from "@/components/confirmModal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";

interface RecommendedOffer {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  merchant: {
    id: string;
    name: string;
    logo: string;
    isApproved: boolean;
  };
  discountType: number;
  discountValue: number;
}

const OfferDetails: React.FC = () => {
  const { id } = useParams();
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [savingDeal, setSavingDeal] = React.useState(false);
  const [savedDeal, setSavedDeal] = React.useState(false);
  const [similarOffers, setSimilarOffers] = React.useState<RecommendedOffer[]>([]);
  const [loadingPage, setLoadingPage] = React.useState(true);
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();
  const [alert, setAlert] = React.useState<boolean>(false);

  const getSimilarOffers = async (offerId: string): Promise<RecommendedOffer[]> => {
    try {
      const response = await axiosInstance.get(`/offer/${offerId}/similar`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch similar offers");
      }
      setSimilarOffers(response.data.data);
    } catch (error) {

      toast({
        title: "Error fetching similar offers",
        description: error.message || "An error occurred while fetching similar offers.",
        variant: "destructive",
      });
      return [];
    }
  }

  async function shareContent(title, text, url) {


    try {
      await navigator.share({
        title: title,
        text: text,
        url: url,
      });
    } catch (err) {

      // Fallback to custom share dialog
      // showCustomShareDialog(title, url);
    }
  }

  const handleSaveDeal = async () => {
    // Logic to save the deal (e.g., add to favorites)
    try {
      setSavingDeal(true);
      const response = await axiosInstance.post(`/offer/${id}/save`);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data.message || "Failed to save deal");
      }
      setSavedDeal(true);
      toast({
        title: "Deal Saved!",
        description: "This deal has been saved to your favorites.",
        variant: "success",
      });
    } catch (error) {

      toast({
        title: error.response.data?.message || "Error Saving Deal",
        description: error.message || "An error occurred while saving the deal.",
        variant: "destructive",
      });
    } finally {
      setSavingDeal(false);
      setSavedDeal(false);
    }
  };

  const [offer, setOffer] = React.useState<Offer | null>(null);
  const [coupon, setCoupon] = React.useState<Coupon | null>(null);
  const [fetchingCoupon, setFetchingCoupon] = React.useState(false);
  const [usageStats, setUsageStats] = React.useState<UsageStats | null>(null);
  const [claimAvailability, setClaimAvailability] = React.useState<ClaimAvailability | null>(null);
  const [loadingUsageInfo, setLoadingUsageInfo] = React.useState(false);

  const fetchUsageInfo = async () => {
    if (!id) return;

    try {
      setLoadingUsageInfo(true);
      const [usageResponse, availabilityResponse] = await Promise.all([
        axiosInstance.get(`/offer/${id}/usage-stats`),
        axiosInstance.get(`/offer/${id}/available-claims`)
      ]);

      if (usageResponse.data) {
        setUsageStats(usageResponse.data.data.usage_stats);
      }

      if (availabilityResponse.data) {
        setClaimAvailability(availabilityResponse.data.data);
      }
    } catch (error) {
      // Usage info is optional, don't show error toast for missing data
    } finally {
      setLoadingUsageInfo(false);
    }
  };

  const fetchOffer = async () => {
    try {
      setLoadingPage(true);
      const couponData = await axiosInstance.get(`/offer/${id}`);
      if (!couponData) {
        throw new Error("Offer not found");
      }
      const { data } = couponData.data;
      setOffer(data);

      // Fetch usage info after getting offer
      await fetchUsageInfo();
    } catch (error) {
      toast({
        title: "Error fetching offer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const fetchCoupon = async () => {
    try {
      setFetchingCoupon(true);
      const response = await axiosInstance.post(`/offer/${offer.id}/coupons/create`);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data.message || "Failed to fetch coupon");
      }
      const { message, description, data } = response.data;
      setCoupon(data);
      setIsRevealed(true);
      offer.coupons.total -= 1;

      // Update usage stats after successful claim
      await fetchUsageInfo();

      toast({
        title: message || "Coupon generated",
        description: description || "Coupon code has been generated successfully",
        variant: "success",
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setIsRevealed(true);
        setCoupon(error.response.data.data);
      } else if (error.response && error.response.status === 403) {
        setAlert(true);
        openModal({
          title: error.response.data.message || "Action Not Allowed",
          message: error.response.data.description || "You are not allowed to perform this action.",
          confirmText: "Continue",
          cancelText: "Cancel",
          variant: "destructive",
          onConfirm: () => {
            window.location.href = "/me";
          },
          onClose: () => {
            closeModal();
            setAlert(false);
          }
        });
      } else {
        toast({
          title: error.response?.data?.message || error.message || "Error fetching coupon",
          description: error.response?.data?.description || "An error occurred while fetching the coupon code. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setFetchingCoupon(false);
    }
  }
  React.useEffect(() => {
    fetchOffer();
    if (id) {
      getSimilarOffers(id);
    }
  }, [id]);

  const recommendedOffers: RecommendedOffer[] = React.useMemo(() => {
    if (!offer) return [];
    return similarOffers.filter((rec: RecommendedOffer) => rec.id !== offer.id);
  }, [similarOffers, offer]);

  const formatValue = (offer: Offer | RecommendedOffer) => {
    switch (offer.discountType) {
      case OfferType.PERCENTAGE:
        return `${offer.discountValue}% OFF`;
      case OfferType.FIXED_AMOUNT:
        return `$${offer.discountValue} OFF`;
      case OfferType.BUY_ONE_GET_ONE:
        return `BUY 1 GET 1 ${offer.discountValue ? `${offer.discountValue}% OFF` : 'FREE'}`;
      case OfferType.FREE_ITEM:
        return 'FREE ITEM';
      default:
        return '';
    }
  };

  const daysRemaining = () => {
    if (!offer) return 0;
    const today = new Date();
    const end = new Date(offer.endDate);
    const diff = end.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleRevealCode = async () => {
    await fetchCoupon();
  };

  const handleCopyCode = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code);
      setIsCopied(true);
      toast({
        title: "Code Copied!",
        description: "The coupon code has been copied to your clipboard",
      });
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // Get usage type display info
  const getUsageTypeInfo = (usageType: UsageType) => {
    switch (usageType) {
      case UsageType.SINGLE_USE:
        return { icon: Users, label: "Your claimed coupon can only be used once", color: "bg-blue-100 text-blue-700" };
      case UsageType.MULTI_USE:
        return { icon: Repeat, label: `Up to ${offer?.max_claims_per_user}x`, color: "bg-green-100 text-green-700" };
      case UsageType.UNLIMITED:
        return { icon: Infinity, label: "Unlimited", color: "bg-purple-100 text-purple-700" };
      case UsageType.TIERED:
        return { icon: Trophy, label: "Loyalty rewards", color: "bg-yellow-100 text-yellow-700" };
      default:
        return { icon: Users, label: "One-time use", color: "bg-blue-100 text-blue-700" };
    }
  };

  // Format next available claim time
  const formatNextClaimTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours <= 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `${diffDays} days`;
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-background-lighter">
        <Header />
        <main className="flex-grow flex items-center justify-center w-full min-h-screen mx-auto px-4 py-6 pt-20 sm:pt-24">
          <div className="text-center flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-brand-primary mb-4" />
            <h2 className="text-xl font-bold mb-2 text-text-primary">Loading Offer Details...</h2>
            <p className="text-text-secondary">Please wait while we fetch the offer details.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col bg-background-lighter">
        <Header />
        <main className="flex-grow flex-col flex justify-center w-full min-h-screen mx-auto px-4 py-6 pt-20 sm:pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-text-primary">Offer not found</h2>
            <p className="text-text-secondary mb-6">The offer you are looking for doesn't exist or has expired.</p>
            <Link to="/">
              <Button className="bg-brand-primary hover:bg-brand-primary/90">Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background-lighter">
      <Header />
      <ConfirmModal
        isOpen={alert}
        onClose={() => setAlert(false)}
        {...modalProps}
      />
      <main className="flex-grow w-full mx-auto px-4 py-6 pt-20 sm:pt-24">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/deals" className="text-brand-primary hover:text-brand-accent hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Deals</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Offer Details */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-border-subtle shadow-sm hover:shadow-md transition-shadow">
              {/* Hero Image with Badge */}
              <div className="relative h-48 md:h-56 bg-background-soft">
                <img
                  src={offer.coverImage}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-brand-primary text-text-inverted text-lg font-bold px-3 py-1.5 shadow-md">
                  {formatValue(offer)}
                </Badge>
              </div>

              <CardContent className="p-4 sm:p-6">
                {/* Provider Info */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={offer.merchant.logo}
                      alt={offer.merchant.name}
                      className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border border-border-subtle"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium text-text-primary">{offer.merchant.name}</h3>
                        {offer.merchant.isApproved && (
                          <Verified size={20} className=" font-bold" fill="blue" stroke="white" />
                        )}
                      </div>

                      <Link to={offer.merchant.website} target="blank" className="text-sm flex items-center text-brand-primary hover:text-brand-accent hover:underline">
                        <Link2 className="h-4 w-4 inline-block mr-1 -rotate-45" />
                        Visit Website
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button onClick={() =>
                      shareContent(offer.title, offer.description, window.location.href)
                    } className="hover:bg-brand-primary/10 rounded-full transition-colors duration-300">
                      <Share2 className="h-4 w-4 rounded-full text-brand-primary" />
                    </Button>
                    <Button disabled={savingDeal} onClick={handleSaveDeal} className="hover:bg-brand-primary/10 rounded-full transition-colors duration-300">
                      {savingDeal ? (
                        <span className="animate-spin">
                          <Loader2 className="h-6 w-6 text-brand-primary" />
                        </span>
                      ) : savedDeal || offer.isSaved ? (
                        <BookmarkCheck className="h-8 w-8 text-green-700" />
                      ) : (
                        <Bookmark className="h-6 w-6 text-brand-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Offer Title and Description */}
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-text-primary">{offer.title}</h1>
                <p className="text-text-secondary mb-4">{offer.description}</p>

                {/* Usage Type and Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Usage Type Info */}
                  <Card className="border-border-subtle">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const usageTypeInfo = getUsageTypeInfo(offer.usage_type || UsageType.SINGLE_USE);
                          const UsageIcon = usageTypeInfo.icon;
                          return (
                            <>
                              <div className={`p-2 rounded-full ${usageTypeInfo.color.replace('text-', 'bg-').replace('-700', '-200')}`}>
                                <UsageIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">Usage Type</p>
                                <p className="text-text-secondary text-sm">{usageTypeInfo.label}</p>
                                {offer.cooldown_period_hours && (
                                  <p className="text-xs text-text-tertiary">
                                    This offer is currently unavailable come back after {offer.cooldown_period_hours} {offer.cooldown_period_hours === 1 ? 'hour' : 'hours'}.
                                  </p>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Usage Statistics */}
                  {usageStats && (
                    <Card className="border-border-subtle">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100">
                            <TrendingUp className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Your Stats</p>
                            <div className="flex gap-4 text-sm text-text-secondary">
                              <span>{usageStats.usage_count} claimed</span>
                              {usageStats.total_savings > 0 && (
                                <span>${(usageStats.total_savings / 100).toFixed(2)} saved</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Claim Availability Alert */}
                {claimAvailability && !claimAvailability.can_claim_now && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-700" />
                      <p className="text-sm font-medium text-yellow-700">Claim Not Available</p>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      {claimAvailability.reason}
                      {claimAvailability.next_available_claim && (
                        <span className="block mt-1">
                          Next claim available in {formatNextClaimTime(claimAvailability.next_available_claim)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Remaining Claims Info */}
                {claimAvailability && claimAvailability.can_claim_now && claimAvailability.remaining_claims !== "unlimited" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-blue-700" />
                      <p className="text-sm font-medium text-blue-700">
                        {claimAvailability.remaining_claims} {claimAvailability.remaining_claims === 1 ? 'claim' : 'claims'} remaining for you
                      </p>
                    </div>
                  </div>
                )}

                {/* Tabs for Details and Terms */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="bg-background-subtle w-full sm:w-auto">
                    <TabsTrigger value="details" className="flex-1 sm:flex-none data-[state=active]:bg-brand-primary data-[state=active]:text-text-inverted">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="flex-1 sm:flex-none data-[state=active]:bg-brand-primary data-[state=active]:text-text-inverted">
                      Terms & Conditions
                    </TabsTrigger>
                  </TabsList>

                  {/* Details Tab Content */}
                  <TabsContent value="details" className="mt-4">
                    <Card className="border-border-subtle shadow-sm">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-xl font-bold mb-4 text-text-primary">Get Your Discount</h3>

                        {/* Offer Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column - Offer Stats */}
                          <div className="space-y-4">
                            {/* Available Coupons */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col space-y-2 bg-background-subtle rounded-lg px-3 py-2 border border-border-subtle">
                                <div className="flex items-center gap-2">
                                  <Code className="h-4 w-4 text-brand-primary" />
                                  <span className="text-sm font-medium text-text-primary">Available</span>
                                </div>
                                <div>
                                  <Badge variant="outline" className="bg-green-50 text-base border-green-200 text-green-700">
                                    {offer.coupons.total - offer.coupons.claimed} left
                                  </Badge>
                                </div>
                              </div>

                              {/* Expiration Display */}
                              <div className="flex flex-col space-y-2 bg-background-subtle rounded-lg px-3 py-2 border border-border-subtle">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-brand-primary" />
                                  <span className="text-sm font-medium text-text-primary">Expires in</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-base font-bold text-text-primary">{daysRemaining()}</span>
                                  <span className="text-sm text-text-secondary">days</span>
                                </div>
                              </div>
                            </div>

                            {/* Redeemed Count */}
                            <div className="flex justify-between gap-4 bg-white rounded-lg px-3 py-2 border border-border-subtle">
                              <div className="flex w-full h-full p-3 bg-background-subtle items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">Redeemed</span>
                                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                                  {offer.coupons.redeemed} times
                                </Badge>
                              </div>
                              <div className="flex w-full p-3 h-full bg-background-subtle items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">Claimed</span>
                                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                                  {offer.coupons.claimed} times
                                </Badge>
                              </div>
                            </div>

                            {/* Coupon Code Display */}
                            <div className="relative mt-2">
                              <div className="flex items-center gap-0">
                                <div className="bg-background-subtle border border-brand-primary/20 rounded-l-md p-3 flex-grow text-center font-mono font-bold text-lg text-text-primary">
                                  {isRevealed ? (
                                    <span>{coupon.code}</span>
                                  ) : (
                                    <span className="blur-sm select-none">********</span>
                                  )}
                                </div>
                                <Button
                                  disabled={!isRevealed}
                                  size="sm"
                                  onClick={handleCopyCode}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-brand-primary text-white disabled:bg-gray-400"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  {isCopied ? "Copied" : "Copy"}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - QR Code */}
                          <div className="flex justify-center items-center">
                            <div className="bg-background-subtle border border-brand-primary/20 rounded-lg p-4 flex flex-col items-center w-full max-w-xs">
                              {isRevealed ? (
                                <div className="w-full aspect-square max-w-xs flex items-center justify-center p-2">
                                  <img src={coupon.qrCode} alt={coupon.code} />
                                </div>
                              ) : (
                                <div className="relative w-full aspect-square flex items-center justify-center">
                                  <div className="absolute inset-0 blur-sm bg-linear-to-br from-gray-300 to-gray-200 rounded flex items-center justify-center">
                                    <QrCode className="w-1/2 h-1/2 text-gray-400" />
                                  </div>
                                  <Button
                                    onClick={handleRevealCode}
                                    disabled={claimAvailability && !claimAvailability.can_claim_now}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white z-10 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    {fetchingCoupon ? (
                                      <Loader2 className="animate-spin h-4 w-4" />
                                    ) : claimAvailability && !claimAvailability.can_claim_now ? (
                                      <span>Cannot Claim</span>
                                    ) : (
                                      <span>Reveal Code</span>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Usage Instructions */}
                        <div className="text-center text-sm text-text-tertiary mt-4">
                          <p>Use this code at checkout on the <a href={`${offer.merchant.website}`}>{offer.merchant.name}</a> website or in store.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Terms Tab Content */}
                  <TabsContent value="terms" className="mt-4">
                    <div className="prose prose-sm max-w-none text-text-secondary p-4">
                      <p>{offer.termsAndConditions || "No specific terms provided for this deal. Please check with the provider for any restrictions or limitations that may apply."}</p>
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 text-brand-primary flex-shrink-0">⊙</div>
                          <span>Valid for students with verified accounts only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 text-brand-primary flex-shrink-0">⊙</div>
                          <span>Cannot be combined with other promotions unless specified</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-0.5 text-brand-primary flex-shrink-0">⊙</div>
                          <span>The provider reserves the right to modify or end this promotion</span>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recommended Deals for Desktop */}
          <div className="hidden lg:block">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Recommended Deals</h3>
            <div className="space-y-4 overflow-y-auto h-full max-h-screen pr-2 gap-4">
              {recommendedOffers.map((rec: RecommendedOffer) => {
                // const recProvider = getProviderById(rec.providerId);
                return (
                  <Link to={`/offer/${rec.id}`} key={rec.id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <div className="relative h-32">
                          <img
                            src={rec.coverImage}
                            alt={rec.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-brand-primary text-text-inverted font-medium">
                            {formatValue(rec)}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={rec.merchant?.logo}
                              alt={rec.merchant?.name}
                              className="w-6 h-6 object-cover rounded-full"
                            />
                            <p className="text-sm text-text-secondary">{rec.merchant?.name}</p>
                          </div>
                          <h4 className="font-medium text-text-primary line-clamp-2">{rec.title}</h4>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Recommendations Carousel */}
        <div className="mt-8 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-text-primary">Recommended Deals</h3>
            <Link to="/deals" className="text-sm text-brand-primary hover:text-brand-accent">
              View all
            </Link>
          </div>

          {/* Single row scrollable recommendations for mobile/tablet */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {recommendedOffers.map((rec: RecommendedOffer) => {
              // const recProvider = getProviderById(rec.mer);
              return (
                <Link to={`/offer/${rec.id}`} key={rec.id} className="min-w-[260px] w-[260px] snap-start">
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <div className="flex flex-col h-full">
                      <div className="relative h-32">
                        <img
                          src={rec.coverImage}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-brand-primary text-text-inverted font-medium">
                          {formatValue(rec)}
                        </Badge>
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={rec.merchant?.logo || "/placeholder.svg"}
                            alt={rec.merchant?.name}
                            className="w-6 h-6 object-cover rounded-full"
                          />
                          <p className="text-sm text-text-secondary">{rec.merchant?.name}</p>
                        </div>
                        <h4 className="font-medium text-text-primary line-clamp-2">{rec.title}</h4>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfferDetails;