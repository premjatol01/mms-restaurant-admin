import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { Power, ShoppingCart, Globe2 } from "lucide-react";

function SettingToggle({ icon: Icon, label, description, checked, onChange, disabled = false, badge = null }) {
  return (
    <div className={`flex items-start justify-between py-4 border-b border-theme last:border-0 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-theme border border-theme flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon size={16} className={checked ? "text-[var(--color-primary)]" : "text-secondary"} />
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-theme">{label}</p>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-secondary leading-relaxed">{description}</p>}
        </div>
      </div>

      <label className={`relative inline-flex items-center ml-4 flex-shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)] transition-colors" />
      </label>
    </div>
  );
}

export default function RestaurantSettingsForm() {
  const { profile, saveProfile, updateSection, saving } = useProfileStore();

  const getInitialSettings = (prof) => ({
    isActive: prof?.settings?.isActive !== undefined ? Boolean(prof.settings.isActive) : true,
    acceptOrders: prof?.settings?.acceptOrders !== undefined ? Boolean(prof.settings.acceptOrders) : true,
    showOnPublicWebsite: false, // Future feature - disabled
  });

  const [settings, setSettings] = useState(() => getInitialSettings(profile));

  useEffect(() => {
    if (profile?.settings) {
      setSettings(getInitialSettings(profile));
    }
  }, [profile]);

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }));

  const onSave = async () => {
    const payload = {
      isActive: Boolean(settings.isActive),
      acceptOrders: Boolean(settings.acceptOrders),
      showOnPublicWebsite: false,
    };
    const result = await saveProfile({ settings: payload });
    if (result.success) {
      toast.success("Restaurant settings updated successfully.");
    } else {
      toast.error(result.message || "Failed to update settings.");
    }
  };

  return (
    <div className="space-y-5">
      <FormSection
        title="Operational Settings"
        description="Configure your restaurant's live availability, ordering capabilities, and platform visibility."
      >
        <SettingToggle
          icon={Power}
          label="Restaurant Active"
          description="When active, your restaurant website, menu, and tables are publicly accessible to customers. When disabled, customers see that the restaurant is currently closed."
          checked={settings.isActive}
          onChange={(v) => update("isActive", v)}
        />

        <SettingToggle
          icon={ShoppingCart}
          label="Accept Orders"
          description="When enabled, guests can place orders directly from their digital table menu. When turned off, guests can browse your menu but order submission is temporarily paused."
          checked={settings.acceptOrders}
          onChange={(v) => update("acceptOrders", v)}
        />

        <SettingToggle
          icon={Globe2}
          label="Show on Public Website"
          description="Feature your restaurant on the Tablly central public directory and discovery marketplace. This feature will be available in an upcoming release."
          checked={false}
          disabled={true}
          badge="Coming Soon"
          onChange={() => {}}
        />
      </FormSection>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} loading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
