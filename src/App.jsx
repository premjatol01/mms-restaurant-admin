import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OffersPromosPage = lazy(() => import("./pages/offers-promos/OffersPromosPage"));
const WebsitePage = lazy(() => import("./pages/website/WebsitePage"));
const ReviewsPage = lazy(() => import("./pages/reviews/ReviewsPage"));
const SubscriptionPage = lazy(() => import("./pages/subscription/SubscriptionPage"));

// Simple inline fallback shown while a lazy page chunk loads
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
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
                path="/account"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PlaceholderPage title="Account" />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PlaceholderPage title="Settings" />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
