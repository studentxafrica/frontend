import * as React from "react";
import { Cta, QuietLink } from "@/components/ui/cta";
import axiosInstance from "@/api/axios";
import { Offer } from "@/types/offer";
import ServerError from "./ServerError";
import OfferCard from "./offers/OfferCard";
import OfferCardSkeleton from "./offers/OfferCardSkeleton";
import SectionHeading from "./SectionHeading";

const STUDENT_OWNED_FILTER = "student-owned";

const StudentOwnedOffers = () => {
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);

  const fetchStudentOwnedOffers = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const params = new URLSearchParams({
        filters: STUDENT_OWNED_FILTER,
        sort: "newest",
        limit: "8",
      });
      const response = await axiosInstance.get(`/offer/recommended?${params.toString()}`);
      setOffers(response.data?.data || []);
    } catch (error) {
      // Shown inline, so a failed request doesn't read as "no student businesses yet"
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudentOwnedOffers();
  }, []);

  return (
    <section className="w-full bg-neutral-50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Student-owned"
          title="Built and run by students"
          description="Get your campus side hustle listed."
          action={
            <QuietLink to={`/deals?filters=${STUDENT_OWNED_FILTER}`}>
              See all
            </QuietLink>
          }
        />

        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <OfferCardSkeleton key={idx} />
              ))}
            </div>
          ) : loadError ? (
            <ServerError
              title="We couldn't load student-owned offers"
              description="Check your connection and try again."
              onRetry={fetchStudentOwnedOffers}
            />
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-200 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                No student businesses listed yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
                Running something? Be the first on campus.
              </p>
              <div className="mt-8 flex justify-center">
                <Cta to="/me" tone="outline">
                  List what you sell
                </Cta>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudentOwnedOffers;
