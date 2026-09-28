import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import axiosInstance from "@/api/axios";
import { Category } from "@/types/category";

interface ErrorPageProps {
	statusCode?: number;
	title?: string;
	message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
	statusCode = 404,
	title = "Page Not Found",
	message = "The page you are looking for doesn't exist or has been moved.",
}) => {
	const navigate = useNavigate();
	const [categories, setCategories] = React.useState<Category[]>([]);

	React.useEffect(() => {
		// Nice to have on an error page, so a failure just leaves the "All categories" tile
		axiosInstance
			.get("/offer/categories")
			.then((response) => setCategories(response.data?.data || []))
			.catch(() => {});
	}, []);

	const getErrorTitle = () => {
		switch (statusCode) {
			case 404:
				return "Page Not Found";
			case 500:
				return "Server Error";
			case 403:
				return "Access Denied";
			default:
				return title;
		}
	};

	const getErrorMessage = () => {
		switch (statusCode) {
			case 404:
				return "The page you are looking for doesn't exist or has been moved.";
			case 500:
				return "Our servers are experiencing issues right now. Please try again later.";
			case 403:
				return "You don't have permission to access this page.";
			default:
				return message;
		}
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="flex flex-col items-center w-full">
				<Header />
			</div>


			{/* Error Content */}
			<main className="container mx-auto px-4 py-12 pt-24">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-6xl font-bold text-gray-800 mb-2">
						{statusCode}
					</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-6">
						{getErrorTitle()}
					</h2>
					<p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
						{getErrorMessage()}
					</p>

					<div className="flex flex-wrap justify-center gap-4">
						<button
							onClick={() => navigate("/")}
							className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
						>
							<Home size={18} />
							Back to Homepage
						</button>

						<button
							onClick={() => navigate(-1)}
							className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium py-3 px-6 rounded-lg transition duration-300"
						>
							<ArrowLeft size={18} />
							Go Back
						</button>

						<button
							onClick={() => window.location.reload()}
							className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium py-3 px-6 rounded-lg transition duration-300"
						>
							<RefreshCw size={18} />
							Refresh Page
						</button>
					</div>

					<div className="mt-12 pt-8 border-t border-gray-200">
						<p className="text-gray-600">
							Need assistance?{" "}
							<a
								href="/support"
								className="text-pink-600 hover:text-pink-700 font-medium"
							>
								Contact our support team
							</a>
						</p>
					</div>
				</div>
			</main>

			{/* Search Section */}
			<section className="bg-pink-50 py-12 mt-8">
				<div className="container mx-auto px-4">
					<div className="max-w-2xl mx-auto text-center">
						<h3 className="text-xl font-semibold text-gray-800 mb-6">
							Find what you're looking for
						</h3>
						<form onSubmit={(e) => {
							e.preventDefault();
							navigate('/deals?search=' + encodeURIComponent(document.querySelector('input[type="text"]').value));
						}} className="flex w-full">
							<input
								type="text"
								placeholder="Search products, categories, and more..."
								className="flex-grow px-4 py-3 rounded-l-lg border-2 border-pink-300 focus:outline-none focus:border-pink-500"
							/>
							<button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-r-lg transition duration-300">
								Search
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Popular Categories */}
			<section className="container mx-auto px-4 py-12">
				<h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
					Popular Categories
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{/* Real categories, so every tile lands on results rather than another 404 */}
					{categories.slice(0, 3).map((category) => (
						<Link
							key={category.id}
							to={`/deals?filters=${category.id}`}
							className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition duration-300"
						>
							<div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-pink-600 text-xl font-bold">
									{category.name.charAt(0)}
								</span>
							</div>
							<span className="font-medium text-gray-700">{category.name}</span>
						</Link>
					))}
					<Link
						to="/categories"
						className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition duration-300"
					>
						<div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
							<ArrowRight className="text-pink-600" size={20} aria-hidden />
						</div>
						<span className="font-medium text-gray-700">All categories</span>
					</Link>
				</div>
			</section>

			{/* Footer */}
			{/* <footer className="bg-gray-900 text-white mt-12">
		<div className="container mx-auto px-4 py-8">
		  <div className="text-center">
			<p className="text-gray-400 text-sm">
			  &copy; 2025 GreenShop. All rights reserved.
			</p>
			<div className="flex justify-center space-x-6 mt-4">
			  <a
				href="/privacy"
				className="text-gray-400 hover:text-white text-sm transition duration-200"
			  >
				Privacy Policy
			  </a>
			  <a
				href="/terms"
				className="text-gray-400 hover:text-white text-sm transition duration-200"
			  >
				Terms of Service
			  </a>
			  <a
				href="/faq"
				className="text-gray-400 hover:text-white text-sm transition duration-200"
			  >
				FAQ
			  </a>
			</div>
		  </div>
		</div>
	  </footer> */}
			<Footer />
		</div>
	);
};

// Usage examples:
// <ErrorPage /> - Default 404 page
// <ErrorPage statusCode={500} /> - Server error page
// <ErrorPage statusCode={403} title="Access Forbidden" message="You don't have permission to view this page" />

export default ErrorPage;
