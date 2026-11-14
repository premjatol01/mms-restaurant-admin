import { useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const ROUTE_TITLES = {
  "/": { title: "Dashboard", desc: "Overview of your restaurant" },
  "/profile": { title: "Restaurant Profile", desc: "Manage your restaurant information" },
  "/menu": { title: "Menu", desc: "Manage your restaurant menu, categories, items and combos." },
  "/tables": { title: "Tables & QR", desc: "Manage your restaurant tables, assign QR codes and download them." },
  "/qr-config": { title: "QR Configuration", desc: "Manage QR codes and control who they're visible to." },
  "/orders": { title: "Orders", desc: "Manage incoming orders" },
  "/subscription": { title: "Subscription", desc: "Manage your subscription" },
  "/offers-promos": { title: "Offers & Promos", desc: "Manage discounts and offers" },
  "/website": { title: "Website", desc: "Manage your online presence" },
  "/reviews": { title: "Reviews", desc: "Manage customer reviews" },
  "/biz-growth": { title: "Biz Growth", desc: "Masterclasses, playbooks, and strategies to grow and scale your restaurant" },
  "/portal-handler": { title: "Portal Handler", desc: "Configure customer portal and landing behavior" },
  "/design-requests": { title: "Design Requests", desc: "Request and track custom QR and branding designs" },
  "/account": { title: "Account & Profile", desc: "Manage administrator credentials, personal address & security" },
  "/settings": { title: "Settings", desc: "Application settings" },
};

export default function Header() {
  const location = useLocation();
  const current = ROUTE_TITLES[location.pathname] || { title: "Restaurant Admin", desc: "" };

  return (
    <header className="h-16 bg-surface border-b border-theme flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-theme font-semibold text-lg leading-tight">{current.title}</h1>
        {current.desc && <p className="text-xs text-secondary">{current.desc}</p>}
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
      </div>
    </header>
  );
}
