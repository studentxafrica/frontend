import * as React from "react";
import { RotateCw } from "lucide-react";
import { Cta, QuietLink } from "@/components/ui/cta";
import axiosInstance from "@/api/axios";
import OfferCard from "./offers/OfferCard";
import ServerError from "./ServerError";
import { Offer } from "@/types/offer";
import OfferCardSkeleton from "./offers/OfferCardSkeleton";
import SectionHeading from "./SectionHeading";

const LatestOffers = () => {
  const [recentOffers, setRecentOffers] = React.useState<Offer[]>([]);
  // Starts true so the empty state doesn't flash before the first request
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);

  const fetchRecentOffers = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await axiosInstance.get('/offer/latest');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'An error occurred while fetching recent offers');
      }
      const offers = response.data.data;
      setRecentOffers(offers);
    } catch (error) {
      // Shown inline, so a failed request doesn't pass for "nothing new"
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchRecentOffers();
  }, []);

  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Just added"
          title="New this week"
          action={
            recentOffers.length > 0 && (
              <QuietLink to="/deals">See every offer</QuietLink>
            )
          }
        />

        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <OfferCardSkeleton key={i} />
              ))}
            </div>
          ) : loadError ? (
            <ServerError
              title="We couldn't load the newest offers"
              description="Check your connection and try again."
              onRetry={fetchRecentOffers}
            />
          ) : recentOffers.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recentOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center border border-neutral-200 px-6 py-16 text-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                src="/coming-soon.webm"
                className="mb-6 w-24 opacity-80"
              />
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                Nothing new since your last visit
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                The next batch is being lined up.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Cta onClick={fetchRecentOffers} tone="outline" icon={RotateCw}>
                  Check again
                </Cta>
                <Cta to="/deals">Browse all offers</Cta>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LatestOffers;
