import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  Users,
  Palette,
  Tag,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  CreditCard,
  TrendingUp,
  Smartphone,
  Lock,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSubscriptionPlan } from "../hooks/useSubscriptionPlan";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Restaurant Profile", icon: Store, path: "/profile" },
  { label: "Menu", icon: UtensilsCrossed, path: "/menu", featureKey: "qr_menu" },
  { label: "Tables & QR", icon: QrCode, path: "/tables", featureKey: "table_sessions" },
  { label: "Portal Handler", icon: Smartphone, path: "/portal-handler" },
  { label: "Orders", icon: ClipboardList, path: "/orders", featureKey: "live_orders" },
  { label: "Staff & RBAC", icon: Users, path: "/staff", featureKey: "multi_staff", tag: "ENT" },
  { label: "Subscription", icon: CreditCard, path: "/subscription" },
  { label: "Offers & Promos", icon: Tag, path: "/offers-promos", featureKey: "offers_promos", tag: "PRO" },
  { label: "Design Requests", icon: Palette, path: "/design-requests", featureKey: "design_requests", tag: "ENT" },
  { label: "Website", icon: Globe, path: "/website", featureKey: "website" },
  { label: "Reviews", icon: Star, path: "/reviews", featureKey: "google_review", tag: "PRO" },
  { label: "Biz Growth", icon: TrendingUp, path: "/biz-growth", featureKey: "biz_growth", tag: "PRO" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isLoggingOut } = useAuth();
  const { hasFeature, planName } = useSubscriptionPlan();

  const isProfileActive = location.pathname.startsWith("/account") || location.pathname.startsWith("/profile");
  const isSettingsActive = location.pathname.startsWith("/settings");

  return (
    <aside
      className={`relative flex flex-col h-screen bg-surface border-r border-theme transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header (Matches main Header h-16) */}
      {collapsed ? (
        <div className="h-16 shrink-0 flex items-center justify-center border-b border-theme px-2">
          <div
            className="relative w-8 h-8 group flex items-center justify-center cursor-pointer"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            {/* Logo shown normally, hidden on hover */}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xs transition-opacity duration-200 group-hover:opacity-0">
              RA
            </div>
            {/* Expand button appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary-light text-primary border border-theme opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xs hover:bg-primary hover:text-white">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-theme">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              RA
            </div>
            <span className="font-semibold text-theme text-sm truncate">Restaurant Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg text-secondary hover:text-theme hover:bg-primary-light transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {navItems.map(({ label, icon: Icon, path, featureKey, tag }) => {
          const isLocked = featureKey && !hasFeature(featureKey);
          return (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              title={
                collapsed
                  ? isLocked
                    ? `${label} (Locked - Requires ${tag === "ENT" ? "Enterprise" : "Pro"})`
                    : label
                  : undefined
              }
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : isLocked
                    ? "text-secondary hover:bg-primary-light/50"
                    : "text-theme hover:bg-primary-light"
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </div>

              {!collapsed && isLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <Lock size={10} />
                  {tag || "PRO"}
                </span>
              )}

              {collapsed && isLocked && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Profile, Settings, Logout */}
      <div className={`border-t border-theme p-2 flex ${collapsed ? "flex-col items-center gap-1" : "flex-row items-center justify-around"}`}>
        <button
          onClick={() => navigate("/account")}
          title="Profile"
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isProfileActive
              ? "bg-primary text-white shadow-xs"
              : "text-theme hover:bg-primary-light"
          }`}
        >
          <User size={18} />
        </button>
        <button
          onClick={() => navigate("/settings")}
          title="Settings"
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isSettingsActive
              ? "bg-primary text-white shadow-xs"
              : "text-theme hover:bg-primary-light"
          }`}
        >
          <Settings size={18} />
        </button>
        <button
          onClick={logout}
          disabled={isLoggingOut}
          title="Logout"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}