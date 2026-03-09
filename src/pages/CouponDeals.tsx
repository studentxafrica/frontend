import * as React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Filter,
  X,
  Tag,
  Clock,
  Search
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import OfferCard from "@/components/offers/OfferCard";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";
import OfferCardSkeleton from "@/components/offers/OfferCardSkeleton";

interface Offer {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  discountType: string;
  discountValue: number;
  isStudentOwned?: boolean;
  merchant: {
    name: string;
    logo: string;
    isStudentOwned?: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug?: string;
  } | string | null;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
}

interface Category {
  id: string;
  slug?: string;
  label: string;
}

const useUpdateFilters = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const addFilterToURL = (newFilter: string) => {
    const params = new URLSearchParams(location.search);
    const existing = params.get("filters")?.split(",").filter(Boolean) || [];

    if (!existing.includes(newFilter)) {
      existing.push(newFilter);
      params.set("filters", existing.join(","));
      navigate(`${location.pathname}?${params.toString()}`, { replace: false });
    }
  };

  const removeFilterFromURL = (filterToRemove: string) => {
    const params = new URLSearchParams(location.search);
    const existing = params.get("filters")?.split(",").filter(Boolean) || [];
    const updated = existing.filter((filter) => filter !== filterToRemove);
    if (updated.length === 0) {
      params.delete("filters");
    } else {
      params.set("filters", updated.join(","));
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const clearFiltersFromURL = () => {
    const params = new URLSearchParams(location.search);
    params.delete("filters");
    params.delete("sort");
    params.delete("search");
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  return { addFilterToURL, removeFilterFromURL, clearFiltersFromURL };
};

const CouponDeals = () => {
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const location = useLocation();
  const urlQuery = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = React.useState<string>(urlQuery.get("search") || "");
  const [sortOption, setSortOption] = React.useState<string>(urlQuery.get("sort") || "newest");
  const [limit, setLimit] = React.useState<number>(urlQuery.get("limit") ? parseInt(urlQuery.get("limit")!) : 50);
  const [offset, setOffset] = React.useState<number>(urlQuery.get("offset") ? parseInt(urlQuery.get("offset")!) : 0);
  const navigate = useNavigate();
  const { addFilterToURL, removeFilterFromURL, clearFiltersFromURL } = useUpdateFilters();

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/offer/categories');
      if (response.status === 200) {
        setCategories(response.data.data.map((cat: any) => ({
          id: cat.id,
          slug: cat.slug,
          label: cat.name
        })));
      }
    } catch (error) {

    }
  };

  // Fetch offers with filters
  const fetchOffers = async (limitParam: number = limit, offsetParam: number = offset) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add filters
      const activeFilters = urlQuery.get("filters");
      if (activeFilters) {
        params.append("filters", activeFilters);
      }

      // Add search query
      const search = urlQuery.get("search");
      if (search) {
        params.append("search", search);
      }

      // Add sort option
      const sort = urlQuery.get("sort");
      if (sort) {
        params.append("sort", sort);
      }

      params.append("limit", limitParam.toString()); // Limit results to 20
      params.append("offset", offsetParam.toString()); // Start from the first page

      const response = await axiosInstance.get(`/offer/recommended?${params.toString()}`);
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch offers");
      }
      setOffers(response.data.data);
    } catch (error) {
      toast({
        title: "Error loading offers",
        description: "Could not load offers at this time. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  React.useEffect(() => {
    fetchOffers();
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    const params = new URLSearchParams(location.search);
    params.set("sort", value);
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
      addFilterToURL(filter);
    }
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
    removeFilterFromURL(filter);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery("");
    clearFiltersFromURL();
  };

  const discountTypes = [
    { id: "fixed_amount", label: "Fixed Amount Off" },
    { id: "percentage", label: "Percentage Off" },
    { id: "buy_one_get_one", label: "Buy One Get One" },
    { id: "free_item", label: "Free Item" }
  ];

  const initialFilters = urlQuery.get("filters") ? urlQuery.get("filters")!.split(",") : [];
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>(initialFilters);

  const getOfferCategoryId = (offer: Offer): string | undefined => {
    if (!offer.category) {
      return undefined;
    }
    if (typeof offer.category === "string") {
      return offer.category;
    }
    return offer.category.id;
  };

  // Filter offers based on search query
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = !urlQuery.get("search") ||
      offer.title.toLowerCase().includes(urlQuery.get("search")!.toLowerCase()) ||
      offer.description.toLowerCase().includes(urlQuery.get("search")!.toLowerCase()) ||
      offer.merchant.name.toLowerCase().includes(urlQuery.get("search")!.toLowerCase());

    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.some(filter => {
        const categoryId = getOfferCategoryId(offer);
        const categorySlug = typeof offer.category === "string" ? undefined : offer.category?.slug;

        if (filter === "student-owned") {
          return Boolean(offer.isStudentOwned || offer.merchant?.isStudentOwned || categorySlug === "student-owned");
        }

        return (
          categoryId === filter ||
          categorySlug === filter ||
          offer.discountType === filter ||
          (filter === 'expiring-soon' && new Date(offer.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
          (filter === 'new-arrivals' && new Date(offer.startDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        );
      });

    return matchesSearch && matchesFilters;
  });

  // Sort offers based on sort option
  const sortedOffers = React.useMemo(() => {
    const sort = urlQuery.get("sort") || "newest";
    return [...filteredOffers].sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case "highest-discount":
          return (b.discountValue || 0) - (a.discountValue || 0);
        case "expiring-soon":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default:
          return 0;
      }
    });
  }, [filteredOffers, urlQuery.get("sort")]);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center flex-col items-center">
      <Header />

      {/* Hero Banner */}
      <div className="bg-linear-to-r from-blue-900 to-black text-white pt-24 pb-12 w-full">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-4 bg-indigo-900 hover:bg-indigo-900">New Arrivals</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Student Deals</h1>
            <p className="text-lg text-blue-100 max-w-2xl mb-8">
              Fresh deals and discounts added just for students. Personalized with your favorite brands.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for deals..."
                className="w-full py-3 pl-10 pr-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 w-full">
        {/* Active Filters */}
        {selectedFilters.length > 0 || urlQuery.get("search") ? (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {urlQuery.get("search") && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                Search: {urlQuery.get("search")}
                <button onClick={() => {
                  setSearchQuery("");
                  const params = new URLSearchParams(location.search);
                  params.delete("search");
                  navigate(`${location.pathname}?${params.toString()}`, { replace: false });
                }}>
                  <X size={14} />
                </button>
              </Badge>
            )}
            {selectedFilters.map(filter => (
              <Badge
                key={filter}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {[...categories, ...discountTypes].find(c => c.id === filter)?.label ||
                  (filter === 'new-arrivals' && 'New Arrivals') ||
                  (filter === 'expiring-soon' && 'Expiring Soon') ||
                  filter}
                <button onClick={() => removeFilter(filter)}>
                  <X size={14} />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Mobile Collapsible */}
          <div className="lg:hidden w-full mb-4">
            <Collapsible open={expanded} onOpenChange={setExpanded} className="w-full border rounded-lg shadow-sm bg-white">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>Filter Deals</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "transform rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border-t">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.id}-mobile`}
                          checked={selectedFilters.includes(category.id)}
                          onCheckedChange={(checked) => {
                            checked ? addFilter(category.id) : removeFilter(category.id);
                          }}
                        />
                        <label htmlFor={`${category.id}-mobile`} className="text-sm">{category.label}</label>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-medium mb-3 mt-6">Discount Type</h3>
                  <div className="space-y-2">
                    {discountTypes.map(type => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${type.id}-mobile`}
                          checked={selectedFilters.includes(type.id)}
                          onCheckedChange={(checked) => {
                            checked ? addFilter(type.id) : removeFilter(type.id);
                          }}
                        />
                        <label htmlFor={`${type.id}-mobile`} className="text-sm">{type.label}</label>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-medium mb-3 mt-6">Expiration</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="expiring-soon-mobile"
                        checked={selectedFilters.includes('expiring-soon')}
                        onCheckedChange={(checked) => {
                          checked ? addFilter('expiring-soon') : removeFilter('expiring-soon');
                        }}
                      />
                      <label htmlFor="expiring-soon-mobile" className="text-sm">Expiring Soon</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-arrivals-mobile"
                        checked={selectedFilters.includes('new-arrivals')}
                        onCheckedChange={(checked) => {
                          checked ? addFilter('new-arrivals') : removeFilter('new-arrivals');
                        }}
                      />
                      <label htmlFor="new-arrivals-mobile" className="text-sm">New Arrivals</label>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-brand-primary text-white"
                    onClick={() => setExpanded(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Filters - Desktop Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filters</span>
                </h3>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Tag size={14} />
                    <span>Categories</span>
                  </h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedFilters.includes(category.id)}
                          onCheckedChange={(checked) => {
                            checked ? addFilter(category.id) : removeFilter(category.id);
                          }}
                        />
                        <label htmlFor={category.id} className="text-sm">{category.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <span>Discount Type</span>
                  </h4>
                  <div className="space-y-2">
                    {discountTypes.map(type => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={selectedFilters.includes(type.id)}
                          onCheckedChange={(checked) => {
                            checked ? addFilter(type.id) : removeFilter(type.id);
                          }}
                        />
                        <label htmlFor={type.id} className="text-sm">{type.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock size={14} />
                    <span>Expiration</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="expiring-soon"
                        checked={selectedFilters.includes('expiring-soon')}
                        onCheckedChange={(checked) => {
                          checked ? addFilter('expiring-soon') : removeFilter('expiring-soon');
                        }}
                      />
                      <label htmlFor="expiring-soon" className="text-sm">Expiring Soon</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-arrivals"
                        checked={selectedFilters.includes('new-arrivals')}
                        onCheckedChange={(checked) => {
                          checked ? addFilter('new-arrivals') : removeFilter('new-arrivals');
                        }}
                      />
                      <label htmlFor="new-arrivals" className="text-sm">New Arrivals</label>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-brand-primary text-white"
                  onClick={() => fetchOffers()}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Coupons Grid */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 id="deals-title" className="text-xl font-semibold">
                Showing <span className="text-blue-600">{sortedOffers.length}</span> deals
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  className="border rounded-md p-2 text-sm bg-white"
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest-discount">Highest Discount</option>
                  <option value="expiring-soon">Expiring Soon</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))
              ) : sortedOffers.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 xl:col-span-3">
                  <div className="text-center p-8">
                    <div className="mx-auto max-w-md">
                      <Search className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No matching deals found</h3>
                      <p className="mt-2 text-gray-500">
                        {selectedFilters.length > 0 || urlQuery.get("search")
                          ? "We couldn't find any deals matching your search. Try adjusting your filters or search terms."
                          : "Looks like we're fresh out of deals at the moment. Check back soon for new offers!"}
                      </p>
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="mx-auto"
                          onClick={clearFilters}
                        >
                          {selectedFilters.length > 0 || urlQuery.get("search")
                            ? "Clear all filters"
                            : "Browse all deals"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : sortedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            {!loading && sortedOffers.length > 0 && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="outline"
                  className="font-medium bg-gray-200"
                  onClick={() => {
                    const scrollTop = document.getElementById("deals-title");
                    scrollTop?.scrollIntoView({
                      behavior: "smooth",
                      block: "start"
                    });
                    setOffset(prev => prev + limit);
                    fetchOffers(limit, offset + limit);
                  }}
                >
                  Load More Deals
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CouponDeals;
