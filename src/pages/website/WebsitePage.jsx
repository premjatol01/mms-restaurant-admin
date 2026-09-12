import { useState } from "react";
import { Globe, MessageSquare, Copy, ExternalLink, Check } from "lucide-react";
import { useWebsiteStore } from "../../store/websiteStore";
import Button from "../../components/ui/Button";
import WebsiteBuilder from "./components/WebsiteBuilder";
import InquiryList from "./components/InquiryList";

export default function WebsitePage() {
  const [activeTab, setActiveTab] = useState("builder");
  const { websiteStatus, restaurantSlug, publishWebsite, unpublishWebsite } = useWebsiteStore();
  const [copied, setCopied] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const websiteUrl = `https://${restaurantSlug}.yourplatform.com`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    publishWebsite();
    setShowPublishConfirm(false);
  };

  const handleUnpublish = () => {
    unpublishWebsite();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Website</h1>
        <p className="text-sm text-secondary">Configure and manage your restaurant website</p>
      </div>

      {/* Status Card */}
      <div className="bg-surface border border-theme rounded-xl p-5">
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
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Website URL</span>
              <code className="text-sm text-theme bg-primary-light/30 px-2 py-1 rounded">{websiteUrl}</code>
              <button 
                onClick={handleCopyUrl}
                className="p-1.5 text-secondary hover:text-primary hover:bg-primary-light rounded transition-colors"
                title="Copy URL"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.open(websiteUrl, "_blank")}>
              <ExternalLink size={14} />
              Preview Website
            </Button>
            {websiteStatus === "published" ? (
              <Button variant="secondary" size="sm" onClick={handleUnpublish}>
                Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowPublishConfirm(true)}>
                Publish Website
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-primary-light/20 p-1 rounded-lg w-fit">
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
      {activeTab === "builder" ? <WebsiteBuilder /> : <InquiryList />}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPublishConfirm(false)} />
          <div className="relative bg-surface border border-theme rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-theme mb-2">Publish Website?</h3>
            <p className="text-sm text-secondary mb-6">
              Your restaurant website will become available through your platform subdomain.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPublishConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handlePublish}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}