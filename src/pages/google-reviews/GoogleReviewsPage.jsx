import { useState } from "react";
import { Star, Copy, ExternalLink, Check, AlertCircle } from "lucide-react";
import { useGoogleReviewStore } from "../../store/googleReviewStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function GoogleReviewButton({ reviewUrl, onClick }) {
  if (!reviewUrl) return null;
  
  return (
    <button
      onClick={() => window.open(reviewUrl, "_blank")}
      className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors"
    >
      <Star size={18} className="fill-current" />
      Leave us a Google Review
    </button>
  );
}

function FeatureLockedState() {
  return (
    <div className="bg-surface border border-theme rounded-xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
        <Star size={32} className="text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-theme mb-2">Google Reviews</h2>
      <p className="text-sm text-secondary mb-4">
        Google Review functionality is not available with your current subscription.
      </p>
      <Button>View Plans</Button>
    </div>
  );
}

export default function GoogleReviewsPage() {
  const { config, featureLocked, setReviewUrl, clearConfig } = useGoogleReviewStore();
  const [reviewUrl, setReviewUrlInput] = useState(config.reviewUrl);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(!config.reviewUrl);

  const isConfigured = config.status === "configured";
  const isUnavailable = config.status === "unavailable" || featureLocked;

  const validateUrl = (url) => {
    if (!url) return "Google Review URL is required.";
    try {
      new URL(url);
      return "";
    } catch {
      return "Please enter a valid URL.";
    }
  };

  const handleSave = () => {
    const validationError = validateUrl(reviewUrl);
    if (validationError) {
      setError(validationError);
      return;
    }
    setReviewUrl(reviewUrl);
    setError("");
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(config.reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = () => {
    setReviewUrlInput(config.reviewUrl);
    setIsEditing(false);
    setError("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  if (isUnavailable) {
    return <FeatureLockedState />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-theme">Google Reviews</h1>
        <p className="text-sm text-secondary">
          Make it easy for customers to leave a review for your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Card */}
        <div className="bg-surface border border-theme rounded-xl p-5 space-y-5">
          <h2 className="font-semibold text-theme">Google Review Setup</h2>
          
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              isConfigured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isConfigured ? "bg-green-500" : "bg-yellow-500"
              }`} />
              {isConfigured ? "Configured" : "Not Configured"}
            </span>
          </div>

          {/* URL Input */}
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Google Review URL"
                value={reviewUrl}
                onChange={(e) => {
                  setReviewUrlInput(e.target.value);
                  setError("");
                }}
                placeholder="https://g.page/r/your-restaurant/review"
                error={error}
                hint="Customers will be redirected to this link when they click the Google Review button."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
                {isConfigured && (
                  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isConfigured ? (
                <>
                  <div className="p-4 bg-primary-light/20 rounded-lg">
                    <p className="text-xs text-secondary mb-1">Google Review URL</p>
                    <p className="text-sm text-theme font-mono break-all">{config.reviewUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Link
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => window.open(config.reviewUrl, "_blank")}>
                      <ExternalLink size={14} />
                      Open Link
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy Link"}
                    </Button>
                  </div>
                  <p className="text-xs text-secondary">Last updated: {formatDate(config.updatedAt)}</p>
                </>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle size={32} className="mx-auto text-secondary mb-3" />
                  <p className="text-sm text-secondary mb-4">
                    No Google Review link has been configured yet.
                  </p>
                  <Button onClick={() => setIsEditing(true)}>Configure Google Review</Button>
                </div>
              )}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check size={16} />
              Google Review link saved successfully.
            </div>
          )}
        </div>

        {/* Preview Card */}
        <div className="bg-surface border border-theme rounded-xl p-5 space-y-5">
          <h2 className="font-semibold text-theme">Customer Preview</h2>
          
          <div className="border border-dashed border-theme rounded-xl p-8 text-center">
            <p className="text-sm text-secondary mb-4">
              This is how the Google Review button will appear to your customers.
            </p>
            
            {isConfigured ? (
              <div className="space-y-3">
                <p className="text-theme font-medium">Enjoyed your experience?</p>
                <p className="text-sm text-secondary">We'd love to hear from you.</p>
                <div className="pt-2">
                  <GoogleReviewButton reviewUrl={config.reviewUrl} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary">
                Configure a Google Review URL to see the preview.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}