import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import { AuthProvider } from "./context/AuthContext";

// Lazy-loaded pages — enables code splitting and faster module switching
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const RestaurantProfilePage = lazy(() => import("./pages/profile/RestaurantProfilePage"));
const MenuPage = lazy(() => import("./pages/menu/MenuPage"));
const TablesAndQRPage = lazy(() => import("./pages/tables-qr/TablesAndQRPage"));
const PortalHandlerPage = lazy(() => import("./pages/portal-handler/PortalHandlerPage"));
const DesignRequestsPage = lazy(() => import("./pages/design-requests/DesignRequestsPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OffersPromosPage = lazy(() => import("./pages/offers-promos/OffersPromosPage"));
const WebsitePage = lazy(() => import("./pages/website/WebsitePage"));
const ReviewsPage = lazy(() => import("./pages/reviews/ReviewsPage"));
const SubscriptionPage = lazy(() => import("./pages/subscription/SubscriptionPage"));
const BizGrowthPage = lazy(() => import("./pages/biz-growth/BizGrowthPage"));
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));

// Simple inline fallback shown while a lazy page chunk loads
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

// Fallback redirect for restaurant website / preview URLs opened on the admin port (:3002)
function RestaurantWebsiteRedirect() {
  useEffect(() => {
    const mainDomain =
      import.meta.env.VITE_MAIN_WEBSITE_DOMAIN ||
      import.meta.env.VITE_BASE_DOMAIN ||
      "localhost:3000";
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const slug = pathParts[0] || "restaurant";
    const restOfPath = pathParts.slice(1).join("/");
    const destination = `${protocol}//${slug}.${mainDomain}${restOfPath ? `/${restOfPath}` : ""}${window.location.search}${window.location.hash}`;
    window.location.replace(destination);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-[#d9480f] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-700">Redirecting to restaurant website...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RestaurantProfilePage />
                  </Suspense>
                }
              />
              <Route
                path="/menu"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MenuPage />
                  </Suspense>
                }
              />
              <Route
                path="/tables"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TablesAndQRPage />
                  </Suspense>
                }
              />
              <Route
                path="/portal-handler"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PortalHandlerPage />
                  </Suspense>
                }
              />
              <Route
                path="/design-requests"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DesignRequestsPage />
                  </Suspense>
                }
              />
              <Route
                path="/orders"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <OrdersPage />
                  </Suspense>
                }
              />
              <Route
                path="/subscription"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SubscriptionPage />
                  </Suspense>
                }
              />
              <Route
                path="/offers-promos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <OffersPromosPage />
                  </Suspense>
                }
              />
              <Route
                path="/website"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <WebsitePage />
                  </Suspense>
                }
              />
              <Route
                path="/reviews"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ReviewsPage />
                  </Suspense>
                }
              />
              <Route
                path="/biz-growth"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <BizGrowthPage />
                  </Suspense>
                }
              />
              <Route
                path="/account"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AccountPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          {/* Public website fallback routes if accessed via admin port (:3002) */}
          <Route path="/restaurant" element={<RestaurantWebsiteRedirect />} />
          <Route path="/restaurant/*" element={<RestaurantWebsiteRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
