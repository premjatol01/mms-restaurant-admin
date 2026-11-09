import { useEffect, useState } from "react";
import {
  Armchair, Clock, CreditCard, Image, LayoutGrid, MapPin, Phone, RotateCcw, Settings, Store,
} from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import BasicInformationForm from "./components/BasicInformationForm";
import BrandingForm from "./components/BrandingForm";
import ContactInformationForm from "./components/ContactInformationForm";
import AddressForm from "./components/AddressForm";
import BusinessHoursForm from "./components/BusinessHoursForm";
import MenuMasterSection from "./components/MenuMasterSection";
import TableConfigSection from "./components/TableConfigSection";
import SubscriptionSection from "./components/SubscriptionSection";
import RestaurantSettingsForm from "./components/RestaurantSettingsForm";

import UnsavedChangesModal from "./modals/UnsavedChangesModal";
import Button from "../../components/ui/Button";

const TABS = [
  { id: "basic", label: "Basic Information", icon: Store },
  { id: "branding", label: "Branding", icon: Image },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "address", label: "Address", icon: MapPin },
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "menu", label: "Menu Master", icon: LayoutGrid },
  { id: "tables", label: "Table Configuration", icon: Armchair },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
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
  const [activeTab, setActiveTab] = useState("basic");
  const [pendingTab, setPendingTab] = useState(null);
  const [showUnsaved, setShowUnsaved] = useState(false);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleTabChange = (tabId) => {
    if (isDirty) {
      setPendingTab(tabId);
      setShowUnsaved(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleStay = () => { setShowUnsaved(false); setPendingTab(null); };
  const handleLeave = () => {
    discardChanges();
    setActiveTab(pendingTab);
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
      {/* Header Actions (if changes are dirty) */}
      {isDirty && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleDiscard}>
            <RotateCcw size={14} /> Discard Changes
          </Button>
        </div>
      )}

      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          You have unsaved changes.
        </div>
      )}

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
          {activeTab === "hours" && <BusinessHoursForm />}
          {activeTab === "menu" && <MenuMasterSection />}
          {activeTab === "tables" && <TableConfigSection />}
          {activeTab === "subscription" && <SubscriptionSection />}
          {activeTab === "settings" && <RestaurantSettingsForm />}
        </div>
      </div>

      {showUnsaved && <UnsavedChangesModal onStay={handleStay} onLeave={handleLeave} />}
    </div>
  );
}
