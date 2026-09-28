import * as React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ArrowRight, Cat } from "lucide-react";
import axiosInstance from "@/api/axios";
import { Category } from "@/types/category";
import EmptyState from "@/components/EmptyState";
import ServerError from "@/components/ServerError";

const CategoriesSkeleton = () => (
  <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {Array.from({ length: 8 }).map((_, index) => (
      <Card className="h-full border bg-gray-50 hover:border-brand-primary/30 transition-all animate-pulse overflow-hidden">
                    <div className="relative aspect-square overflow-hidden h-48 w-full">
          <div className="absolute inset-0 bg-linear-to-t from-black to-gray-300 z-10" />
          <div

            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          ></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="bg-gray-400 text-xl h-8 w-48 rounded-lg font-bold text-text-inverted mb-2"></div>
            <div className="flex items-center text-text-inverted/90">
              <span className="text-sm">LOADING...</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-neutral-medium h-6 w-3/4 bg-gray-300 rounded-md mb-2"></p>
        </CardContent>
      </Card>
    ))}
  </div>
);

const Categories = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await axiosInstance.get('/category/all');
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
      const categoryData = response.data.data;
      setCategories(categoryData);
    } catch (error) {
      // Shown in place of the grid, so a failed request doesn't read as "no categories"
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-background-soft">
      <Header />
      <main className="flex-grow w-full pt-24">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-brand-primary/5 to-brand-secondary/5 py-6">
          <div className="container  px-4 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Student Discounts
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Browse by category
            </h1>
            <p className="text-neutral-medium text-lg w-full ">
              Discover exclusive student deals sorted by your interests
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container  px-4 py-6">
          {loading ? (
            <CategoriesSkeleton />
          ) : loadError ? (
            <ServerError
              title="We couldn't load categories"
              description="Check your connection and try again."
              onRetry={fetchCategories}
            />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={<Cat className="h-8 w-8 text-gray-400" />}
              title="No Categories Found"
              description="It seems we don't have any categories available at the moment."
              action={
                <Link to="/">
                  <button className="btn btn-primary">Go Back Home</button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

              {categories.map((category: Category) => (
                <Link
                  key={category.id}
                  to={`/deals?filters=${category.id}`}
                  className="group"
                >
                  <Card className="h-full border bg-gray-50 hover:border-brand-primary/30 transition-all overflow-hidden">
                    <div className="relative aspect-square overflow-hidden h-48 w-full">
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                      <img
                        src={category.imageURL || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <h3 className="text-xl font-bold text-text-inverted mb-2">
                          {category.name}
                        </h3>
                        <div className="flex items-center text-text-inverted/90">
                          <span className="text-sm">Explore deals</span>
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-neutral-medium">
                        {`${category.offers?.toLocaleString() || 0} discounts available from ${category.merchants?.toLocaleString() || 0}+ brands`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
              )}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Categories;