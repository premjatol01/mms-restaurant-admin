import { Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import FormSection from "../ui/FormSection";

export default function WebsiteInfoSection() {
  const { profile } = useProfileStore();
  const subdomain = profile?.website?.subdomain || profile?.name?.toLowerCase().replace(/\s+/g, "-") || "your-restaurant";
  const websiteUrl = `https://${subdomain}.yourplatform.com`;
  const isActive = profile?.website?.status === "active";

  const copyUrl = () => {
    navigator.clipboard.writeText(websiteUrl);
    toast.success("Website URL copied to clipboard.");
  };

  return (
    <FormSection title="Restaurant Website" description="Your restaurant's public website hosted on our platform.">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-theme border border-theme">
          <Globe size={16} className="text-secondary flex-shrink-0" />
          <span className="text-sm text-theme flex-1 truncate">{websiteUrl}</span>
          <button onClick={copyUrl} className="text-secondary hover:text-theme transition-colors" title="Copy URL">
            <Copy size={15} />
          </button>
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-theme transition-colors" title="Open Website">
            <ExternalLink size={15} />
          </a>
        </div>

        <p className="text-xs text-secondary">
          To configure your website content, go to the <strong>Website</strong> section in the sidebar.
        </p>
      </div>
    </FormSection>
  );
}
