import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShoppingCart, Zap, BadgeCheck, Star } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import OfferCardSkeleton from "./offers/OfferCardSkeleton";
import OfferCard from "./offers/OfferCard";
import { Category } from "@/types/category";
import { Badge } from "./ui/badge";
import { Merchant } from "@/types/user";
import { Offer } from "@/types/offer";

// Common styles and configuration
const SECTION_STYLES = "py-16 w-full bg-background";
const CONTAINER_STYLES = "container px-4 mx-auto max-w-7xl";
const HEADING_STYLES = "text-3xl font-bold text-gray-900 mb-2";
const SUBTEXT_STYLES = "text-gray-600 text-base max-w-2xl";
const GRID_STYLES = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6";
const CARD_HOVER = "hover:shadow-md hover:border-brand-primary/50 transition-all";

// LatestOffers Component
const LatestOffers = () => {
  const [recentOffers, setRecentOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchRecentOffers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/offer/latest');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'An error occurred while fetching recent offers');
      }
      const offers = response.data.data;
      setRecentOffers(offers);
    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "An error occurred",
        description: error.response.data?.message || "Something went wrong while getting recent offers. It's not you it's us",
        variant: `${error.response.status.toLocaleString().startsWith(4) ? "warning" : "destructive"}`
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchRecentOffers();
  }, []);

  return (
    <section className={`${SECTION_STYLES} bg-linear-to-b from-background to-background-soft`}>
      <div className={CONTAINER_STYLES}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h2 className={HEADING_STYLES}>Fresh Deals</h2>
            <p className={SUBTEXT_STYLES}>
              Just added - don't miss these exclusive discounts
            </p>
          </div>
          {recentOffers.length > 0 && (
            <Link to="/deals">
              <Button
                variant="outline"
                className="mt-4 md:mt-0 border-brand-primary text-brand-primary hover:bg-brand-primary/5"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className={GRID_STYLES}>
            {[...Array(4)].map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : recentOffers.length > 0 ? (
          <div className={GRID_STYLES}>
            {recentOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-background-subtle rounded-xl min-h-[320px]">
            <video
              autoPlay
              loop
              muted
              playsInline
              src="/coming-soon.webm"
              className="w-28 mb-6 opacity-85"
            />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Hang tight!
            </h2>
            <p className="text-base mb-6 text-center max-w-[340px] text-gray-700">
              We're working hard to bring you the latest deals from our partners. Check back soon for exclusive offers just for you!
            </p>
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={() => fetchRecentOffers()}
            >
              Refresh Deals
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// CategoryList Component
const getCategoryInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const prioritizeStudentOwned = <T extends { slug?: string }>(items: T[]) => {
  const studentOwnedItems = items.filter((item) => item.slug === "student-owned");
  const rest = items.filter((item) => item.slug !== "student-owned");
  return [...studentOwnedItems, ...rest];
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/offer/categories');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'An error occurred while fetching offer categories');
      }
      const categories = response.data.data
      setCategories(categories);
    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "An error occurred",
        description: error.response.data?.message || "Something went wrong while getting offer categories. It's not you it's us",
        variant: `${error.response.status.toLocaleString().startsWith(4) ? "warning" : "destructive"}`
      })
    }
  }

  React.useEffect(() => {
    fetchCategories();
  }, [])

  const prioritizedCategories = prioritizeStudentOwned(categories).slice(0, 5);

  return (
    <section className={SECTION_STYLES}>
      <div className={CONTAINER_STYLES}>
        <div className="text-center mb-12">
          <h2 className={HEADING_STYLES}>Popular Categories</h2>
          <p className={SUBTEXT_STYLES}>
            Explore deals in your favorite categories
          </p>
        </div>

        <div className={GRID_STYLES}>
          {prioritizedCategories.map((category) => {
            const initials = getCategoryInitials(category.name);
            return (
              <Link
                to={`/deals?filters=${category.id}`}
                key={category.id}
                className="group outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-xl"
              >
                <div
                  className={`flex flex-col items-center justify-center p-6 border border-border rounded-xl ${CARD_HOVER} bg-background h-full`}
                >
                  <Badge
                    className="h-14 w-14 rounded-full flex items-center justify-center bg-background-subtle text-brand-primary group-hover:bg-brand-primary group-hover:text-white text-lg font-bold mb-3"
                  >
                    {initials}
                  </Badge>
                  <span className="text-sm font-medium text-center text-gray-900">
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            to="/categories"
            className="group outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-xl"
          >
            <div
              className={`flex flex-col items-center justify-center p-6 border border-border rounded-xl ${CARD_HOVER} bg-background h-full`}
            >
              <Badge
                className="h-14 w-14 rounded-full flex items-center justify-center bg-background-subtle text-brand-primary group-hover:bg-brand-primary group-hover:text-white mb-3"
              >
                <ArrowRight className="h-6 w-6" />
              </Badge>
              <span className="text-sm font-medium text-center text-gray-900">
                View All
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ProviderHighlights Component
const ProviderHighlights = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = React.useState<Merchant[]>([]);

  const fetchFeaturedMerchants = async () => {
    try {
      const response = await axiosInstance.get('/merchants/featured');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'An error occurred while fetching featured merchants');
      }
      const { data } = response.data;
      setMerchants(data);
    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "An error occurred",
        description: error.response.data?.message || "Something went wrong while getting featured merchants. It's not you it's us",
        variant: `${error.response.status.toLocaleString().startsWith(4) ? "warning" : "destructive"}`
      });
    }
  }

  React.useEffect(() => {
    fetchFeaturedMerchants();
  }, []);

  return (
    <section className={`${SECTION_STYLES} bg-background-soft`}>
      <div className={CONTAINER_STYLES}>
        <div className="text-center mb-12">
          <Badge className="px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
            <BadgeCheck className="h-5 w-5 mr-2" />
            Trusted Partners
          </Badge>
          <h2 className={HEADING_STYLES}>Featured Brands</h2>
          <p className={SUBTEXT_STYLES}>
            Discover exclusive student discounts from top companies
          </p>
        </div>

        <div className={GRID_STYLES}>
          {merchants.map((merchant) => (
            <Card
              key={merchant.id}
              className={`border border-border ${CARD_HOVER} bg-background`}
            >
              <CardContent className="flex flex-col items-center p-6">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-background-subtle flex items-center justify-center border-2 border-border-subtle group-hover:border-brand-primary/20 transition-colors">
                    <img
                      src={merchant.logo || "/placeholder.svg"}
                      alt={merchant.name}
                      className="object-contain rounded-full m-2"
                    />
                  </div>
                  {merchant.isApproved && (
                    <div className="absolute -top-2 -right-2 bg-brand-primary text-white rounded-full p-1">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-center text-gray-900">
                  {merchant.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { LatestOffers, CategoryList, ProviderHighlights };
