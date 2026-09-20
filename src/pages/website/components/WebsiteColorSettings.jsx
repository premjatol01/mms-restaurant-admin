import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useWebsiteStore } from "../../../store/websiteStore";
import Button from "../../../components/ui/Button";
import ColorField from "./shared/ColorField";
import ContrastWarning from "./shared/ContrastWarning";
import { readableOn } from "../utils/color";
import { COLOR_PRESETS, DEFAULT_WEBSITE_COLORS, WEBSITE_COLOR_FIELDS } from "../utils/constants";

const sameColors = (a, b) => WEBSITE_COLOR_FIELDS.every(({ key }) => a[key] === b[key]);

// A tiny mock of the website drawn with the chosen colors.
function ColorPreview({ colors, name }) {
  const line = `color-mix(in srgb, ${colors.text} 15%, transparent)`;
  return (
    <div className="rounded-lg overflow-hidden border border-theme text-sm" style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: line }}>
        <span className="font-semibold">{name}</span>
        <span className="text-xs opacity-70">Menu &nbsp; Gallery &nbsp; Contact</span>
      </div>
      <div className="px-4 py-6 space-y-3" style={{ backgroundColor: colors.secondary, color: readableOn(colors.secondary) }}>
        <p className="text-base font-semibold">Fresh food, made with care</p>
        <p className="text-xs opacity-80">Join us for an unforgettable meal.</p>
        <span
          className="inline-block px-4 py-1.5 text-xs font-medium rounded-lg"
          style={{ backgroundColor: colors.primary, color: readableOn(colors.primary) }}
        >
          View Menu
        </span>
      </div>
      <div className="px-4 py-4 space-y-1">
        <p className="font-medium">About us</p>
        <p className="text-xs opacity-70">A family restaurant serving authentic Indian cuisine.</p>
        <p className="text-xs font-medium" style={{ color: colors.primary }}>Read more</p>
      </div>
    </div>
  );
}

export default function WebsiteColorSettings() {
  const { websiteColors, updateWebsiteColors, restaurantName } = useWebsiteStore();
  const [draft, setDraft] = useState(websiteColors);

  const isDirty = !sameColors(draft, websiteColors);
  const activePreset = COLOR_PRESETS.find((preset) => sameColors(preset.colors, draft));

  const handleSave = () => {
    updateWebsiteColors(draft);
    toast.success("Website colors saved");
  };

  return (
    <div className="bg-surface border border-theme rounded-xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-theme">Website Colors</h2>
          <p className="text-xs text-secondary">Pick a palette or set your own colors. Menu colors are set in the Popular Menu section.</p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...DEFAULT_WEBSITE_COLORS })}
          className="flex items-center gap-1.5 text-xs text-secondary hover-text-primary shrink-0"
        >
          <RotateCcw size={14} />
          Reset to default
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Color palettes">
        {COLOR_PRESETS.map((preset) => {
          const selected = activePreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setDraft({ ...preset.colors })}
              aria-pressed={selected}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border text-theme ${
                selected ? "border-primary bg-primary-soft" : "border-theme hover-bg-primary-soft"
              }`}
            >
              <span className="flex -space-x-1">
                {["primary", "secondary", "background", "text"].map((key) => (
                  <span
                    key={key}
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors[key] }}
                  />
                ))}
              </span>
              {preset.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEBSITE_COLOR_FIELDS.map(({ key, label, hint }) => (
              <ColorField
                key={key}
                label={label}
                hint={hint}
                value={draft[key]}
                onChange={(value) => setDraft((d) => ({ ...d, [key]: value }))}
              />
            ))}
          </div>
          <ContrastWarning foreground={draft.text} background={draft.background} message="Text is hard to read on the page background" />
        </div>
        <div>
          <p className="text-xs font-medium text-secondary mb-2">Preview</p>
          <ColorPreview colors={draft} name={restaurantName} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={!isDirty}>Save colors</Button>
      </div>
    </div>
  );
}
