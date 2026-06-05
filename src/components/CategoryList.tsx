import * as React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/offer/categories');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
      setCategories(response.data.data);
    } catch (error) {
      toast({
        title: error.response?.data?.message || error.message || "Error",
        description: error.response?.data?.message || "Couldn't load categories. Please try again later.",
        variant: `${error.response?.status?.toString().startsWith('4') ? "warning" : "destructive"}`
      });
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const visibleCategories = prioritizeStudentOwned(categories).slice(0, 5);

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Popular Categories
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
            Discover amazing deals across your favorite categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
          {visibleCategories.map((category) => {
            const initials = getCategoryInitials(category.name);
            return (
              <Link
                to={`/deals?filters=${category.id}`}
                key={category.id}
                className="group outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-xl transition-transform hover:-translate-y-1"
                aria-label={`Browse ${category.name} deals`}
              >
                <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-brand-primary/50 transition-all bg-white hover:bg-gray-50 h-full shadow-sm hover:shadow-md">
                  <div className="relative mb-4">
                    <Badge className="h-16 w-16 rounded-full flex items-center justify-center bg-gray-100 text-brand-primary text-xl font-bold group-hover:bg-brand-primary group-hover:text-white transition-colors shadow-inner">
                      {initials}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900 group-hover:text-brand-primary transition-colors">
                    {category.name}
                  </span>
                  {/* <span className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View deals
                  </span> */}
                </div>
              </Link>
            );
          })}

          <Link
            to="/categories"
            className="group outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-xl transition-transform hover:-translate-y-1"
            aria-label="View all categories"
          >
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-primary/50 transition-all bg-white hover:bg-gray-50 h-full">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gray-100 text-brand-primary mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <ArrowRight className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-center text-gray-900 group-hover:text-brand-primary transition-colors">
                View All
              </span>
              <span className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore more
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
