import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Globe,
  Layers,
  Flame,
  Tag,
  Bell,
  RotateCcw,
  ExternalLink,
  Save,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { usePortalHandlerStore } from "../../store/portalHandlerStore";
import TopCategoriesTab from "./components/TopCategoriesTab";
import BestSellingTab from "./components/BestSellingTab";
import PortalOffersTab from "./components/PortalOffersTab";
import SocialMediaTab from "./components/SocialMediaTab";
import RequestWaiterTab from "./components/RequestWaiterTab";
import Button from "../../components/ui/Button";

const TABS = [
  { id: "categories", label: "Top 5 Categories", icon: Layers, badge: "5 Slots" },
  { id: "bestselling", label: "Best Selling Items", icon: Flame, badge: "Curated" },
  { id: "offers", label: "Offers Management", icon: Tag, badge: "Promos" },
  { id: "waiter", label: "Request Waiter Handler", icon: Bell, badge: "Service" },
  { id: "social", label: "Social Media & Wi-Fi", icon: Globe, badge: "Connect" },
];

export default function PortalHandlerPage() {
  const {
    portalData,
    activeTab,
    setActiveTab,
    isDirty,
    saving,
    saveChanges,
    resetToDefaults,
  } = usePortalHandlerStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Sync tab with URL search params (section=...) like RestaurantProfilePage
  const currentSection = searchParams.get("section") || activeTab || "categories";

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ section: tabId });
  };

  const mainDomain =
    import.meta.env.VITE_MAIN_WEBSITE_DOMAIN ||
    import.meta.env.VITE_BASE_DOMAIN ||
    "localhost:3000";
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const subdomain = portalData?.general?.subdomain || "spicegarden";
  const portalUrl = `${protocol}//${subdomain}.${mainDomain}/menu/table-04`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    toast.success("Portal URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewPortal = () => {
    window.open(portalUrl, "_blank");
  };

  const handleSave = async () => {
    await saveChanges();
  };

  return (
    <div className="space-y-5">
      {/* Single Row Top Bar: Website/Portal URL + Action Buttons (Reset, Preview Portal, Saved) */}
      <div className="bg-surface rounded-xl border border-theme px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Website / Portal URL */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Globe size={16} />
          </div>
          <div className="flex items-center gap-2 min-w-0 bg-surface-soft border border-theme px-3 py-1.5 rounded-lg flex-1 max-w-xl">
            <span className="text-[11px] font-semibold text-secondary shrink-0">
              Portal URL:
            </span>
            <span className="text-xs font-mono font-medium text-theme truncate">
              {portalUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy Portal URL"
              className="p-1 rounded text-secondary hover:text-primary hover:bg-surface transition-colors cursor-pointer shrink-0 ml-auto"
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Portal Live
          </span>
        </div>

        {/* Right: Single Row Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={resetToDefaults}
            title="Reset to Demo Defaults"
          >
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={handlePreviewPortal}
          >
            Preview Portal
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={isDirty ? Save : Check}
            loading={saving}
            disabled={saving}
            onClick={handleSave}
          >
            {isDirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Main Section Tabs Layout (like RestaurantProfilePage) */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Section Navigation Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <nav className="bg-surface rounded-xl border border-theme overflow-hidden shadow-xs">
            {TABS.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`w-full flex items-center justify-between text-left px-4 py-3 text-sm transition-colors border-b border-theme last:border-0 cursor-pointer ${
                  currentSection === id
                    ? "bg-primary text-white font-medium"
                    : "text-theme hover:bg-primary-light"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                {badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      currentSection === id
                        ? "bg-white/20 text-white"
                        : "bg-surface-soft text-secondary"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Section Content */}
        <div className="flex-1 min-w-0">
          {currentSection === "categories" && <TopCategoriesTab />}
          {currentSection === "bestselling" && <BestSellingTab />}
          {currentSection === "offers" && <PortalOffersTab />}
          {currentSection === "waiter" && <RequestWaiterTab />}
          {currentSection === "social" && <SocialMediaTab />}
        </div>
      </div>
    </div>
  );
}
