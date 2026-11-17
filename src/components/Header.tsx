import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, User, Menu, X, Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state";
import { setLogout } from "@/state/auth";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";
import { Category } from "@/types/category";
import ServerError from "./ServerError";

type HeaderProps = {
  sx?: string;
  /** Drops the header below the announcement strip while it is on screen. */
  offsetTop?: boolean;
};

const Header: React.FC<HeaderProps> = ({ sx, offsetTop }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => !!state.auth.user
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categoryError, setCategoryError] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const fetchCategories = async () => {
    try {
      setCategoryError(null);
      setFetchingCategories(true);
      const response = await axiosInstance.get('/offer/categories');
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch categories");
      }
      setCategories(response.data.data);
    } catch (error) {

      // If status is 5xx, set categoryError with a generic message
      if (error.response && error.response.status >= 500) {
        setCategoryError({
          title: error.response?.data?.message || error.message || "Internal Server Error",
          description: error.response?.data?.description || "Something went wrong while fetching categories. Please try again or contact support.",
        });
      } else {
        toast({
          title: error.response?.data?.message || error.message || "Error fetching categories",
          description: error.response?.data?.description || "Something went wrong",
          variant: "warning",
        });
      }

    } finally {
      setFetchingCategories(false);
    }
  }
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className={`${sx} fixed ${offsetTop ? 'top-9' : 'top-0'} z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-100 shadow-sm w-full' : 'bg-slate-100/90 w-[96%] mt-4 rounded-xl backdrop-blur-sm'}`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo with better visual hierarchy */}
          <Link to="/" className="flex items-center space-x-2 min-w-max">
            <Zap className="h-6 w-6 text-brand-primary" />
            <h1 className="text-xl font-bold text-gray-900">
              Student<span className="text-brand-primary">X</span>
            </h1>
          </Link>

          {/* Desktop Navigation with improved dropdowns */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm lg:text-base text-gray-900 hover:text-brand-primary data-[state=open]:text-brand-primary">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="rounded-xl border border-gray-200 bg-white w-[280px] md:w-[400px] p-4">
                    <div className="grid grid-cols-2 gap-3 z-40">
                      {categoryError ? (
                        <div className="text-center text-red-600 col-span-2">
                          <ServerError title={categoryError.title} description={categoryError.description} onRetry={fetchCategories} />
                        </div>
                      ) : categories.length === 0 && fetchingCategories ? (
                        <div className="text-center text-gray-500 col-span-2">
                          Loading categories...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="text-center text-gray-500 col-span-2">
                          No categories available
                        </div>
                      ) : categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/deals?filters=${category.id}`}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors text-sm lg:text-base"
                        >
                          <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-3">
                            {(category.name[0])}
                          </span>
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              to="/deals"
              className="text-sm lg:text-base font-medium text-gray-900 hover:text-brand-primary transition-colors px-3 py-2 whitespace-nowrap"
            >
              Browse Offers
            </Link>
            <Link
              to="/drops"
              className="text-sm lg:text-base font-medium text-gray-900 hover:text-brand-primary transition-colors px-3 py-2 whitespace-nowrap"
            >
              StudentXmas
            </Link>
            {/* <Link
              to="/deals"
              className="text-sm lg:text-base font-medium text-gray-900 hover:text-brand-primary transition-colors px-3 py-2 whitespace-nowrap"
            >
              New Deals
            </Link> */}
          </nav>

          {/* Search and Auth with better thumb zone placement */}
          <div className="flex items-center space-x-3">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search deals..."
                className="pl-10 w-32 lg:w-48 text-sm h-10 border-gray-300 focus:border-brand-primary rounded-lg"
              />
            </div> */}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Account menu"
                    className="hover:bg-gray-100 rounded-full w-10 h-10"
                  >
                    <User className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-gray-200 bg-white min-w-[200px] rounded-xl shadow-lg p-2"
                >
                  <DropdownMenuLabel className="text-gray-900 font-medium">
                    <Link to="/me" className="w-full text-gray-700">
                      {currentUser.first_name} {currentUser.last_name}
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  {/* <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">
                    <Link to="/dashboard" className="w-full text-gray-700">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">
                    <Link to="/saved" className="w-full text-gray-700">
                      Saved Deals
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    onClick={() => dispatch(setLogout())}
                    className="text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                {/* On narrow screens Log In moves into the menu so the bar doesn't overflow */}
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth?page=login')}
                  className="hidden sm:inline-flex border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap text-sm h-10 px-4 rounded-lg"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/auth?page=signup')}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white whitespace-nowrap text-sm h-10 px-4 rounded-lg shadow-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile navigation: the desktop nav above is hidden below md */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="md:hidden rounded-full w-10 h-10 hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85%] flex-col gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b border-neutral-200 px-6 py-5 text-left">
                  <SheetTitle className="text-lg font-semibold text-neutral-900">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Browse offers, categories and your account</SheetDescription>
                </SheetHeader>

                <nav aria-label="Main" className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="divide-y divide-neutral-200">
                    <li>
                      <Link
                        to="/deals"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3 text-base font-medium text-neutral-900 hover:text-brand-primary"
                      >
                        Browse Offers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/drops"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3 text-base font-medium text-neutral-900 hover:text-brand-primary"
                      >
                        StudentXmas
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/categories"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3 text-base font-medium text-neutral-900 hover:text-brand-primary"
                      >
                        All Categories
                      </Link>
                    </li>
                  </ul>

                  {categories.length > 0 && (
                    <>
                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                        Categories
                      </p>
                      <ul className="mt-2">
                        {categories.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={`/deals?filters=${category.id}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2.5 text-sm text-neutral-700 hover:text-brand-primary"
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </nav>

                <div className="border-t border-neutral-200 px-6 py-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-1">
                      <Link
                        to="/me"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 text-base font-medium text-neutral-900 hover:text-brand-primary"
                      >
                        My Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          dispatch(setLogout());
                        }}
                        className="py-2.5 text-left text-base font-medium text-red-600 hover:text-red-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/auth?page=login');
                        }}
                        className="h-11 rounded-lg"
                      >
                        Log In
                      </Button>
                      <Button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate('/auth?page=signup');
                        }}
                        className="h-11 rounded-lg"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>

  );
};

export default Header;