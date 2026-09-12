import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminLayout from "./layouts/AdminLayout";
import PlaceholderPage from "./pages/PlaceholderPage";
import RestaurantProfilePage from "./pages/profile/RestaurantProfilePage";
import MenuPage from "./pages/menu/MenuPage";
import TablesAndQRPage from "./pages/tables-qr/TablesAndQRPage";

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
          <Route path="/orders" element={<PlaceholderPage title="Order & Session Management" />} />
          <Route path="/customers" element={<PlaceholderPage title="Customer Management" />} />
          <Route path="/offers" element={<PlaceholderPage title="Offer & Promotion Management" />} />
          <Route path="/website" element={<PlaceholderPage title="Restaurant Website" />} />
          <Route path="/reviews" element={<PlaceholderPage title="Google Review Configuration" />} />
          <Route path="/account" element={<PlaceholderPage title="Account" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
