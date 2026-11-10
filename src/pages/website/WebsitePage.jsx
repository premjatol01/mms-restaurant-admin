import { useState, useEffect } from "react";
import { Globe, MessageSquare, Copy, Check, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useWebsiteStore } from "../../store/websiteStore";
import { useMenuStore } from "../../store/menuStore";
import Button from "../../components/ui/Button";
import PublishConfirmModal from "./modals/PublishConfirmModal";
import { MAIN_WEBSITE_DOMAIN } from "./utils/constants";
import WebsiteBuilder from "./components/WebsiteBuilder";
import InquiryList from "./components/InquiryList";

export default function WebsitePage() {
  const [activeTab, setActiveTab] = useState("builder");
  const { websiteStatus, hasDraft, restaurantSlug, publishWebsite, unpublishWebsite, loadProfile } = useWebsiteStore();
  const [copied, setCopied] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
    useMenuStore.getState().fetchMenuData();
  }, [loadProfile]);

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const websiteUrl = restaurantSlug
    ? `${protocol}//${restaurantSlug}.${MAIN_WEBSITE_DOMAIN}`
    : "(no subdomain set)";

  const handleCopyUrl = () => {
    if (!restaurantSlug) return;
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (!restaurantSlug) {
      toast.error("Please add and save a website subdomain first.");
      return;
    }
    const previewUrl = `${protocol}//${restaurantSlug}.${MAIN_WEBSITE_DOMAIN}/preview`;
    window.open(previewUrl, "_blank");
  };

  const handlePublish = async () => {
    if (!restaurantSlug || !restaurantSlug.trim()) {
      toast.error("Please add and save a website subdomain before publishing.");
      setShowPublishConfirm(false);
      return;
    }
    try {
      await publishWebsite();
      toast.success("Website published successfully! All changes are now live.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish website. Please try again.");
    }
    setShowPublishConfirm(false);
  };

  const handleUnpublish = async () => {
    try {
      await unpublishWebsite();
      toast.success("Website unpublished. It is no longer accessible publicly.");
    } catch {
      toast.error("Failed to unpublish website. Please try again.");
    }
  };

  return (
    <div
      className={
        activeTab === "inquiries"
          ? "flex flex-col h-[calc(100vh-7rem)] space-y-3.5 overflow-hidden"
          : "space-y-4"
      }
    >
      {/* Status Card */}
      <div className="flex-none bg-surface border border-theme rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary">Website Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                websiteStatus === "published" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  websiteStatus === "published" ? "bg-green-500" : "bg-yellow-500"
                }`} />
                {websiteStatus === "published" ? "Published" : "Draft"}
              </span>
              {hasDraft && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Unpublished changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Website URL</span>
              <code className="text-sm text-theme bg-primary-light/30 px-2 py-1 rounded">{websiteUrl}</code>
              {restaurantSlug && (
                <>
                  <button 
                    onClick={handleCopyUrl}
                    className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded transition-colors"
                    title="Copy URL"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded transition-colors"
                    title="Open live website"
                  >
                    <ExternalLink size={14} />
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePreview}
              disabled={!restaurantSlug}
              title={!restaurantSlug ? "Set a subdomain first" : "Preview your draft changes"}
            >
              <Eye size={14} />
              Preview
            </Button>
            {websiteStatus === "published" && !hasDraft ? (
              <Button variant="secondary" size="sm" onClick={handleUnpublish}>
                Unpublish
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => {
                  if (!restaurantSlug || !restaurantSlug.trim()) {
                    toast.error("Please add and save a website subdomain before publishing.");
                    return;
                  }
                  setShowPublishConfirm(true);
                }}
              >
                {hasDraft ? "Publish Changes" : "Publish Website"}
              </Button>
            )}
            {websiteStatus === "published" && hasDraft && (
              <Button variant="secondary" size="sm" onClick={handleUnpublish}>
                Unpublish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-none flex gap-1 bg-primary-light/20 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "builder"
              ? "bg-primary text-white"
              : "text-theme hover:bg-primary-light/30"
          }`}
        >
          <Globe size={16} />
          Builder
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "inquiries"
              ? "bg-primary text-white"
              : "text-theme hover:bg-primary-light/30"
          }`}
        >
          <MessageSquare size={16} />
          Inquiries
        </button>
      </div>

      {/* Content */}
      {activeTab === "builder" ? (
        <WebsiteBuilder />
      ) : (
        <InquiryList />
      )}

      {/* Publish Confirmation Modal */}
      <PublishConfirmModal
        open={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
        websiteUrl={websiteUrl}
      />
    </div>
  );
}
