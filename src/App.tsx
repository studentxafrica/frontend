import { useEffect } from "react";
// Import feature flags to ensure it initializes
import "@/config/featureFlags";
import { useSelector } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./context/ProtectedRoute";
import { RootState } from "./state";

import DefaultLayout from "./layout/DefaultLayout";

import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/Categories";
import CouponDeals from "./pages/CouponDeals";
import AuthPage from "./pages/Login";
import AuthNew from "./pages/AuthNew";
import OfferDetails from "./pages/OfferDetails";
import OfferDetailsNew from "./pages/OfferDetailsNew";
import Profile from "./pages/ProfilePage";
import ResetPassword from "./pages/ResetPassword";
import ConfirmPasswordReset from "./pages/ConfirmPasswordReset";
import TermsOfUse from "./pages/legal/TermsOfUse";
import PrivacyPolicy from "./pages/legal/Privacy";
import DataConsent from "./pages/legal/DataConsent";
import ErrorPage from "./pages/ErrorPage";
import HelpCenter from "./pages/HelpCenter";
import NetworkStatus from "./components/NetworkStatus";

const queryClient = new QueryClient();

const App = () => {
  const user = useSelector((state: RootState) => state.auth.user);


  useEffect(() => {
    // Initialize Tawk.to script
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();
    // @ts-ignore
    window.Tawk_API.visitor = {
      name: user?.first_name || 'Guest',
      email: user?.email || 'N/A',
    };

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/686f5e8c8ef240190cec467f/1ivpgilck';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    const s0 = document.getElementsByTagName("script")[0];
    if (s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }

    return () => {
      // Cleanup
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
      // @ts-ignore
      delete window.Tawk_API;
      // @ts-ignore
      delete window.Tawk_LoadStart;
    };
  }, [user]);
  return (

    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={
              // Check feature flag for new auth flow
              // We use a small wrapper or just inline check if simple
              // accessing window directly for now as per our simple implementation
              true ? <AuthNew /> : <AuthPage />
            } />
            <Route path="/categories" element={<Categories />} />
            <Route path="/deals" element={<CouponDeals />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/user/confirm-reset-password" element={<ConfirmPasswordReset />} />
            <Route path="/support" element={<HelpCenter />} />

            {/* Main public routes */}
            <Route element={<DefaultLayout />}>

              <Route path="/offer/:id" element={
                <ProtectedRoute allowedRoles={["consumer"]}>
                  <OfferDetailsNew />
                </ProtectedRoute>
              } />

              <Route path="/offer-new/:id" element={
                <ProtectedRoute allowedRoles={["consumer"]}>
                  <OfferDetailsNew />
                </ProtectedRoute>
              } />

              <Route path="/me" element={
                // <ProtectedRoute allowedRoles={["consumer"]}>
                <Profile />
                // </ProtectedRoute>
              } />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Route>

            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/data-consent" element={<DataConsent />} />

            <Route path="*" element={<ErrorPage statusCode={404} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
