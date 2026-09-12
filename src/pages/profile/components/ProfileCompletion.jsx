import { CheckCircle, Circle } from "lucide-react";
import { useProfileStore } from "../../../store/profileStore";

const SECTIONS = [
  { key: "basic", label: "Basic Information", check: (p) => !!(p?.name && p?.restaurantType && p?.cuisineTypes?.length) },
  { key: "logo", label: "Logo", check: (p) => !!p?.logo },
  { key: "cover", label: "Cover Image", check: (p) => !!p?.coverImage },
  { key: "contact", label: "Contact Information", check: (p) => !!(p?.contact?.primaryPhone && p?.contact?.email) },
  { key: "address", label: "Address", check: (p) => !!(p?.address?.line1 && p?.address?.city && p?.address?.pincode) },
  { key: "hours", label: "Business Hours", check: (p) => p?.businessHours?.some((d) => d.isOpen) },
  { key: "social", label: "Social Links", check: (p) => Object.values(p?.socialLinks || {}).some(Boolean) },
];

export default function ProfileCompletion({ onTabChange }) {
  const { profile } = useProfileStore();

  const completed = SECTIONS.filter((s) => s.check(profile));
  const percentage = Math.round((completed.length / SECTIONS.length) * 100);

  const TAB_MAP = { basic: "basic", logo: "branding", cover: "branding", contact: "contact", address: "address", hours: "hours", social: "social" };

  return (
    <div className="bg-surface rounded-xl border border-theme p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-theme">Profile Completion</h3>
        <span className="text-sm font-bold text-[var(--color-primary)]">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="space-y-1.5">
        {SECTIONS.map((s) => {
          const done = s.check(profile);
          return (
            <button
              key={s.key}
              onClick={() => onTabChange?.(TAB_MAP[s.key])}
              className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
            >
              {done
                ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                : <Circle size={14} className="text-secondary flex-shrink-0" />}
              <span className={`text-xs ${done ? "text-theme" : "text-secondary"}`}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}