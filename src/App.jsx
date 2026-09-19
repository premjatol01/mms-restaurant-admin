import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminLayout from "./layouts/AdminLayout";
import PlaceholderPage from "./pages/PlaceholderPage";
import RestaurantProfilePage from "./pages/profile/RestaurantProfilePage";
import MenuPage from "./pages/menu/MenuPage";
import TablesAndQRPage from "./pages/tables-qr/TablesAndQRPage";
import OrdersPage from "./pages/orders/OrdersPage";
import OffersPromosPage from "./pages/offers-promos/OffersPromosPage";
import WebsitePage from "./pages/website/WebsitePage";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import SubscriptionPage from "./pages/subscription/SubscriptionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/profile" element={<RestaurantProfilePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/tables" element={<TablesAndQRPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/offers-promos" element={<OffersPromosPage />} />
          <Route path="/website" element={<WebsitePage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/account" element={<PlaceholderPage title="Account" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
