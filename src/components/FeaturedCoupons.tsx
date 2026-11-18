import * as React from "react";
import { Cta, QuietLink } from "@/components/ui/cta";
import { Offer } from "@/types/offer";
import axiosInstance from "@/api/axios";
import OfferCardSkeleton from "./offers/OfferCardSkeleton";
import ServerError from "./ServerError";
import OfferCard from "./offers/OfferCard";
import SectionHeading from "./SectionHeading";
import DropCard from "./drops/DropCard";
import { Drop, getCampaign, nextOfEachReward } from "@/api/drops";

const FeaturedOffers = () => {
  const [featuredOffers, setFeaturedOffers] = React.useState<Offer[]>([]);
  // StudentXmas leads the row: the next drop of each reward, soonest first
  const [drops, setDrops] = React.useState<Drop[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<{
    title: string;
    description: string;
  } | null>(null);

  const fetchFeaturedOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/offer/featured');
      setFeaturedOffers(response.data);
    } catch (error) {
      // Any failure, including no network, is shown inline rather than as "nothing featured"
      setError({
        title: "We couldn't load featured offers",
        description: "Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFeaturedOffers();
    getCampaign().then((campaign) => setDrops(nextOfEachReward(campaign.upcoming))).catch(() => setDrops([]));
  }, []);

  const hasItems = drops.length > 0 || featuredOffers.length > 0;

  // Nothing featured: leave the section out rather than show an empty box.
  if (!loading && !error && !hasItems) return null;

  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Featured"
          title="Worth your attention first"
          description="A short list, checked by hand."
          action={
            featuredOffers.length > 0 ? (
              <QuietLink to="/deals">See every offer</QuietLink>
            ) : drops.length > 0 ? (
              <QuietLink to="/drops">See all StudentXmas drops</QuietLink>
            ) : null
          }
        />

        <div className="mt-12">
          {error && drops.length === 0 ? (
            <ServerError title={error.title} description={error.description} onRetry={fetchFeaturedOffers} />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <OfferCardSkeleton key={i} />
              ))}
            </div>
          ) : hasItems ? (
            <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {drops.map((drop) => (
                <div
                  key={drop.id}
                  className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
                >
                  <DropCard drop={drop} />
                </div>
              ))}
              {featuredOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]"
                >
                  <OfferCard offer={offer} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-neutral-200 px-6 py-16 text-center">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                Nothing featured right now
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                The full catalogue is open in the meantime.
              </p>
              <div className="mt-8 flex justify-center">
                <Cta to="/deals">Browse all offers</Cta>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOffers;
