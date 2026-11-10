import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Armchair, Clock, CreditCard, Image, LayoutGrid, MapPin, Phone, RotateCcw, Store,
} from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import BasicInformationForm from "./components/BasicInformationForm";
import BrandingForm from "./components/BrandingForm";
import ContactInformationForm from "./components/ContactInformationForm";
import AddressForm from "./components/AddressForm";
import MenuMasterSection from "./components/MenuMasterSection";
import TableConfigSection from "./components/TableConfigSection";
import SubscriptionSection from "./components/SubscriptionSection";

import UnsavedChangesModal from "./modals/UnsavedChangesModal";
import Button from "../../components/ui/Button";

const TABS = [
  { id: "basic", label: "Basic Information", icon: Store },
  { id: "branding", label: "Branding", icon: Image },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "address", label: "Address", icon: MapPin },
  { id: "menu", label: "Menu Master", icon: LayoutGrid },
  { id: "tables", label: "Table Configuration", icon: Armchair },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />)}
      </div>
    </div>
  );
}

export default function RestaurantProfilePage() {
  const { profile, loading, error, isDirty, fetchProfile, discardChanges } = useProfileStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingTab, setPendingTab] = useState(null);
  const [showUnsaved, setShowUnsaved] = useState(false);

  const validTabIds = TABS.map((t) => t.id);
  const rawSection = searchParams.get("section") || searchParams.get("tab");
  const activeTab = validTabIds.includes(rawSection) ? rawSection : "basic";

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!searchParams.get("section") && !searchParams.get("tab")) {
      setSearchParams({ section: "basic" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (tabId) => {
    if (isDirty) {
      setPendingTab(tabId);
      setShowUnsaved(true);
    } else {
      setSearchParams({ section: tabId });
    }
  };

  const handleStay = () => {
    setShowUnsaved(false);
    setPendingTab(null);
  };

  const handleLeave = () => {
    discardChanges();
    if (pendingTab) {
      setSearchParams({ section: pendingTab });
    }
    setPendingTab(null);
    setShowUnsaved(false);
    toast.info("Changes discarded.");
  };

  const handleDiscard = () => {
    discardChanges();
    toast.info("Changes discarded.");
  };

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-red-500 font-medium text-sm">{error}</p>
        <button
          onClick={() => fetchProfile()}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar nav */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="bg-surface rounded-xl border border-theme overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm transition-colors border-b border-theme last:border-0 cursor-pointer ${
                  activeTab === id
                    ? "bg-primary text-white font-medium"
                    : "text-theme hover:bg-primary-light"
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "basic" && <BasicInformationForm />}
          {activeTab === "branding" && <BrandingForm />}
          {activeTab === "contact" && <ContactInformationForm />}
          {activeTab === "address" && <AddressForm />}
          {activeTab === "menu" && <MenuMasterSection />}
          {activeTab === "tables" && <TableConfigSection />}
          {activeTab === "subscription" && <SubscriptionSection />}
        </div>
      </div>

      {showUnsaved && <UnsavedChangesModal onStay={handleStay} onLeave={handleLeave} />}
    </div>
  );
}
