import { useState } from "react";
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

const toUrl = (slug) => `https://${slug || "your-restaurant"}.${BASE_DOMAIN}`;

export default function SubdomainSettings() {
  const { restaurantSlug, websiteStatus, updateSubdomain } = useWebsiteStore();
  const [slug, setSlug] = useState(restaurantSlug);
  const [touched, setTouched] = useState(false);
  const [availability, setAvailability] = useState("idle"); // idle | checking | available | taken
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isChanged = slug !== restaurantSlug;
  const error = touched ? validateSubdomain(slug) : "";
  const checking = availability === "checking";

  const handleChange = (e) => {
    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
    setTouched(true);
    setAvailability("idle");
  };

  // Returns true when the subdomain is valid and free.
  const runCheck = async () => {
    if (validateSubdomain(slug)) {
      setTouched(true);
      return false;
    }
    setAvailability("checking");
    const isAvailable = await checkSubdomainAvailability(slug, restaurantSlug);
    setAvailability(isAvailable ? "available" : "taken");
    return isAvailable;
  };

  const commit = () => {
    updateSubdomain(slug);
    setConfirmOpen(false);
    setAvailability("idle");
    toast.success("Website address updated");
  };

  const handleSave = async () => {
    if (!isChanged) return;
    const isAvailable = await runCheck();
    if (!isAvailable) return;
    if (websiteStatus === "published") setConfirmOpen(true);
    else commit();
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
          <Button variant="secondary" onClick={runCheck} disabled={!isChanged || checking}>
            Check availability
          </Button>
          <Button onClick={handleSave} disabled={!isChanged || checking}>
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
