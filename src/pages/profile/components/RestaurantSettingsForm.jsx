import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-theme last:border-0">
      <div>
        <p className="text-sm font-medium text-theme">{label}</p>
        {description && <p className="text-xs text-secondary">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[var(--color-primary)] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
      </label>
    </div>
  );
}

export default function RestaurantSettingsForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();
  const [settings, setSettings] = useState(profile?.settings || {});

  useEffect(() => { if (profile?.settings) setSettings(profile.settings); }, [profile]);

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }));

  const onSave = async () => {
    updateSection("settings", settings);
    const result = await saveProfile({ settings });
    if (result.success) toast.success("Settings updated.");
    else toast.error(result.message);
  };

  return (
    <div className="space-y-5">
      <FormSection title="General" description="Control your restaurant's operational status.">
        <Toggle label="Restaurant Active" description="Activate or deactivate your restaurant on the platform." checked={!!settings.isActive} onChange={(v) => update("isActive", v)} />
        <Toggle label="Accept Orders" description="Allow customers to place orders through the QR menu." checked={!!settings.acceptOrders} onChange={(v) => update("acceptOrders", v)} />
        <Toggle label="Restaurant Visible" description="Show your restaurant in public listings." checked={!!settings.isVisible} onChange={(v) => update("isVisible", v)} />
        <Toggle label="Show on Public Website" description="Display your restaurant on the platform's public website." checked={!!settings.showOnPublicWebsite} onChange={(v) => update("showOnPublicWebsite", v)} />
      </FormSection>

      <FormSection title="Customer-Facing Display" description="Control what information is visible to customers.">
        <Toggle label="Display Restaurant Name" checked={!!settings.displayName} onChange={(v) => update("displayName", v)} />
        <Toggle label="Display Restaurant Logo" checked={!!settings.displayLogo} onChange={(v) => update("displayLogo", v)} />
        <Toggle label="Display Contact Information" checked={!!settings.displayContact} onChange={(v) => update("displayContact", v)} />
        <Toggle label="Display Address" checked={!!settings.displayAddress} onChange={(v) => update("displayAddress", v)} />
        <Toggle label="Display Business Hours" checked={!!settings.displayHours} onChange={(v) => update("displayHours", v)} />
      </FormSection>

      <FormSection title="Ordering" description="Configure ordering-related preferences.">
        <Toggle label="Enable Customer Ordering" description="Allow customers to place orders via QR menu." checked={!!settings.enableOrdering} onChange={(v) => update("enableOrdering", v)} />
        <Toggle label="Allow Customer Phone Number" description="Show optional phone number field during ordering." checked={!!settings.allowCustomerPhone} onChange={(v) => update("allowCustomerPhone", v)} />
      </FormSection>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}