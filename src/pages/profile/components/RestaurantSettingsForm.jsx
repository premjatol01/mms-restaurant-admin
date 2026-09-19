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
    // Only send the settings that still exist in the UI.
    const payload = {
      isActive: !!settings.isActive,
      acceptOrders: !!settings.acceptOrders,
      showOnPublicWebsite: !!settings.showOnPublicWebsite,
    };
    updateSection("settings", payload);
    const result = await saveProfile({ settings: payload });
    if (result.success) toast.success("Settings updated.");
    else toast.error(result.message);
  };

  return (
    <div className="space-y-5">
      <FormSection title="General" description="Control your restaurant's operational status.">
        <Toggle label="Restaurant Active" description="Activate or deactivate your restaurant on the platform." checked={!!settings.isActive} onChange={(v) => update("isActive", v)} />
        <Toggle label="Accept Orders" description="Allow customers to place orders through the QR menu." checked={!!settings.acceptOrders} onChange={(v) => update("acceptOrders", v)} />
        <Toggle label="Show on Public Website" description="Display your restaurant on the platform's public website." checked={!!settings.showOnPublicWebsite} onChange={(v) => update("showOnPublicWebsite", v)} />
      </FormSection>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}