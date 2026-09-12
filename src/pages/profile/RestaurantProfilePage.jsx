import { useEffect, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import BasicInformationForm from "./components/BasicInformationForm";
import BrandingForm from "./components/BrandingForm";
import ContactInformationForm from "./components/ContactInformationForm";
import AddressForm from "./components/AddressForm";
import BusinessHoursForm from "./components/BusinessHoursForm";
import SocialLinksForm from "./components/SocialLinksForm";
import WebsiteInfoSection from "./components/WebsiteInfoSection";
import RestaurantSettingsForm from "./components/RestaurantSettingsForm";
import ProfileCompletion from "./components/ProfileCompletion";
import ProfilePreview from "./components/ProfilePreview";
import UnsavedChangesModal from "./modals/UnsavedChangesModal";
import Button from "../../components/ui/Button";

const TABS = [
  { id: "basic", label: "Basic Information" },
  { id: "branding", label: "Branding" },
  { id: "contact", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "hours", label: "Business Hours" },
  { id: "social", label: "Social Links" },
  { id: "website", label: "Website" },
  { id: "settings", label: "Settings" },
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
  const { profile, loading, isDirty, fetchProfile, discardChanges } = useProfileStore();
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
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

  const statusColor = profile?.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface border border-theme overflow-hidden flex-shrink-0">
            {profile?.logo
              ? <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">{profile?.name?.[0] || "R"}</div>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-theme">{profile?.name || "Restaurant Profile"}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                {profile?.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            {profile?.tagline && <p className="text-sm text-secondary">{profile.tagline}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              <RotateCcw size={14} /> Discard
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowPreview(true)}>
            <Eye size={14} /> Preview
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          You have unsaved changes.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar nav */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="space-y-3">
            <ProfileCompletion onTabChange={handleTabChange} />
            <nav className="bg-surface rounded-xl border border-theme overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-theme last:border-0 ${
                    activeTab === tab.id
                      ? "bg-primary text-white font-medium"
                      : "text-theme hover:bg-primary-light"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "basic" && <BasicInformationForm />}
          {activeTab === "branding" && <BrandingForm />}
          {activeTab === "contact" && <ContactInformationForm />}
          {activeTab === "address" && <AddressForm />}
          {activeTab === "hours" && <BusinessHoursForm />}
          {activeTab === "social" && <SocialLinksForm />}
          {activeTab === "website" && <WebsiteInfoSection />}
          {activeTab === "settings" && <RestaurantSettingsForm />}
        </div>
      </div>

      {showPreview && <ProfilePreview onClose={() => setShowPreview(false)} />}
      {showUnsaved && <UnsavedChangesModal onStay={handleStay} onLeave={handleLeave} />}
    </div>
  );
}