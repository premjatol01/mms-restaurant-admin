import { useEffect, useState } from "react";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useWebsiteStore } from "../../../store/websiteStore";
import Button from "../../../components/ui/Button";
import FieldError from "./shared/FieldError";
import { labelClass } from "./shared/fieldStyles";
import SubdomainConfirmModal from "../modals/SubdomainConfirmModal";
import { checkSubdomainAvailability } from "../utils/subdomain";
import { validateSubdomain } from "../utils/validation";
import { BASE_DOMAIN, SUBDOMAIN_MAX } from "../utils/constants";
import { websiteApi } from "../../../api/website.api";
import { tablesApi } from "../../../api/tables.api";
import { useProfileStore } from "../../../store/profileStore";

const toUrl = (slug) => `http://${slug || "your-restaurant"}.${BASE_DOMAIN}`;

export default function SubdomainSettings() {
  const { restaurantSlug, websiteStatus, updateSubdomain, unpublishWebsite } = useWebsiteStore();
  const [slug, setSlug] = useState(restaurantSlug || "");
  const [touched, setTouched] = useState(false);
  const [availability, setAvailability] = useState("idle"); // idle | checking | available | taken
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSlug(restaurantSlug || "");
  }, [restaurantSlug]);

  const isChanged = slug !== (restaurantSlug || "");
  const error = touched && slug.trim() ? validateSubdomain(slug) : "";
  const checking = availability === "checking" || saving;

  const handleChange = (e) => {
    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
    setTouched(true);
    setAvailability("idle");
  };

  const commit = async () => {
    try {
      setSaving(true);
      await websiteApi.saveSubdomain(slug);
      // Regenerate all assigned QR codes with the new subdomain URL
      await tablesApi.regenerateAllQRCodes().catch(() => {});
      updateSubdomain(slug);

      // If user cleared the subdomain, automatically unpublish the website
      if (!slug.trim()) {
        try {
          await unpublishWebsite();
        } catch {}
        toast.success("Website address cleared and website unpublished");
      } else {
        toast.success("Website address updated and QR codes regenerated");
      }

      try {
        const profileState = useProfileStore.getState();
        if (profileState?.profile) {
          profileState.updateField("website", "subdomain", slug);
        }
      } catch {}
      setConfirmOpen(false);
      setAvailability("idle");
    } catch {
      toast.error("Failed to save subdomain. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setTouched(true);

    // If user cleared the subdomain, unpublish and clear
    if (!slug.trim()) {
      if (websiteStatus === "published") {
        setConfirmOpen(true);
      } else {
        await commit();
      }
      return;
    }

    const valErr = validateSubdomain(slug);
    if (valErr) {
      toast.error(valErr);
      return;
    }

    // Automatically check availability on Save Address
    setAvailability("checking");
    setSaving(true);
    try {
      const isAvailable = await checkSubdomainAvailability(slug, restaurantSlug);
      if (!isAvailable) {
        setAvailability("taken");
        setSaving(false);
        toast.error(`"${slug}" is already taken. Please choose another subdomain.`);
        return;
      }

      setAvailability("available");
      setSaving(false);

      if (websiteStatus === "published") {
        setConfirmOpen(true);
      } else {
        await commit();
      }
    } catch {
      setSaving(false);
      setAvailability("idle");
      toast.error("Failed to check subdomain availability. Please try again.");
    }
  };

  return (
    <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-theme">Website Address</h2>
        <p className="text-xs text-secondary">Choose the subdomain visitors use to open your restaurant website</p>
      </div>

      <div>
        <label htmlFor="subdomain" className={labelClass}>Subdomain</label>
        <div
          className="flex items-stretch rounded-lg border border-theme bg-surface overflow-hidden focus-ring-primary"
          style={error ? { borderColor: "#f87171" } : undefined}
        >
          <input
            id="subdomain"
            type="text"
            value={slug}
            onChange={handleChange}
            maxLength={SUBDOMAIN_MAX}
            placeholder="tasty-bites"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent text-theme outline-none"
            aria-invalid={Boolean(error)}
          />
          <span className="flex items-center px-3 text-sm text-secondary bg-secondary-soft border-l border-theme whitespace-nowrap">
            .{BASE_DOMAIN}
          </span>
        </div>
        <FieldError message={error} />

        {!error && availability === "checking" && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-secondary">
            <LoaderCircle size={14} className="animate-spin" />
            Checking availability...
          </p>
        )}
        {!error && availability === "available" && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-green-600">
            <CircleCheck size={14} />
            {slug}.{BASE_DOMAIN} is available
          </p>
        )}
        {!error && availability === "taken" && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-red-500">
            <CircleX size={14} />
            This subdomain is already taken. Try another one
          </p>
        )}
        {!error && availability === "idle" && (
          <p className="mt-1 text-xs text-secondary">
            3 to 30 characters. Lowercase letters, numbers and hyphens only.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-secondary">
          Your website address
          <code className="block sm:inline sm:ml-2 text-sm text-theme bg-primary-soft px-2 py-1 rounded break-all">
            {toUrl(slug)}
          </code>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleSave} disabled={!isChanged || checking} loading={checking}>
            Save address
          </Button>
        </div>
      </div>

      <SubdomainConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={commit}
        oldUrl={toUrl(restaurantSlug)}
        newUrl={toUrl(slug)}
      />
    </div>
  );
}
