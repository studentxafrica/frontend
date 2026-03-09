import * as React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Store } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { Offer } from "@/types/offer";
import OfferCard from "./offers/OfferCard";
import OfferCardSkeleton from "./offers/OfferCardSkeleton";

const STUDENT_OWNED_FILTER = "student-owned";

const StudentOwnedOffers = () => {
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchStudentOwnedOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filters: STUDENT_OWNED_FILTER,
        sort: "newest",
        limit: "8",
      });
      const response = await axiosInstance.get(`/offer/recommended?${params.toString()}`);
      setOffers(response.data?.data || []);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || error.message || "Error",
        description: "Unable to load student-owned offers right now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudentOwnedOffers();
  }, []);

  return (
    <section className="w-full py-16 bg-linear-to-b from-amber-50 via-orange-50 to-white">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <Badge className="mb-3 bg-amber-100 text-amber-900 hover:bg-amber-100 border-0">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Built by Students
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-950">Student-Owned Offers</h2>
            <p className="text-amber-900/80 mt-2">
              Discover products and freelance services created by students in your community.
            </p>
          </div>
          <Link to={`/deals?filters=${STUDENT_OWNED_FILTER}`}>
            <Button className="bg-amber-900 hover:bg-amber-800 text-white">
              Explore Student-Owned
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <OfferCardSkeleton key={idx} />
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
            <Store className="h-8 w-8 mx-auto text-amber-700" />
            <h3 className="text-xl font-semibold text-amber-950 mt-3">No student-owned offers yet</h3>
            <p className="text-amber-900/80 mt-2">
              Check back soon or be the first student entrepreneur to launch on StudentX.
            </p>
            <Link to="/me">
              <Button variant="outline" className="mt-5 border-amber-300 text-amber-900 hover:bg-amber-50">
                Learn How to Launch
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentOwnedOffers;
