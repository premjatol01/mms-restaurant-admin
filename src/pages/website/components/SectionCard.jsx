import { useMemo } from "react";
import {
  Images,
  Info,
  LayoutTemplate,
  MapPin,
  MessageSquare,
  Pencil,
  Tag,
  UtensilsCrossed,
  PanelBottom,
  Star
} from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import { useProfileStore } from "../../../store/profileStore";
import { useMenuItems } from "../hooks/useMenuItems";
import { normalizeField } from "../utils/validation";
import { checkboxClass } from "./shared/fieldStyles";
import { getImageUrl } from "../../../utils/getImageUrl";

const SECTION_ICONS = {
  hero: LayoutTemplate,
  about: Info,
  menu: UtensilsCrossed,
  offers: Tag,
  gallery: Images,
  reviews: Star,
  map: MapPin,
  inquiry: MessageSquare,
  footer: PanelBottom
};

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// A short status line under the section name, so admins can see what is configured at a glance.
function getSectionMeta(section, popularCount, profileCover) {
  const c = section.content || {};
  switch (section.type) {
    case "hero": {
      const hasImage = Boolean(c.imageUrl || profileCover);
      return hasImage ? "Cover image synced" : "No image yet";
    }
    case "about":
      return c.imageUrl ? "Image added" : "No image yet";
    case "menu":
      return `${plural(popularCount, "popular dish", "popular dishes")} from Menu`;
    case "gallery":
      return plural(c.images?.length ?? 0, "image", "images");
    case "reviews":
      return "Guest reviews & ratings";
    case "map": {
      const place = [c.location?.city, c.location?.state].filter(Boolean).join(", ");
      return place || "Location not set";
    }
    case "inquiry": {
      const shown = Object.values(c.fields ?? {}).filter((f) => normalizeField(f).enabled).length;
      return plural(shown, "field", "fields");
    }
    case "footer": {
      const linkCount = (c.sectionLinks ?? []).filter((l) => l.enabled).length;
      const socialCount = Object.values(c.socialLinks ?? {}).filter(Boolean).length;
      return `${plural(linkCount, "link", "links")} · ${plural(socialCount, "social profile", "social profiles")}`;
    }
    default:
      return "";
  }
}

export default function SectionCard({ section, onEdit }) {
  const toggleSection = useWebsiteStore((s) => s.toggleSection);
  const profileCover = useProfileStore((s) => s.profile?.coverImage);
  const { items } = useMenuItems();
  const availableItems = useMemo(() => items.filter((i) => i.isAvailable), [items]);

  const heroImage = section.type === "hero" ? (section.content?.imageUrl || profileCover) : null;

  const popularCount = useMemo(() => {
    if (section.content?.popularItemIds && Array.isArray(section.content.popularItemIds) && section.content.popularItemIds.length > 0) {
      return section.content.popularItemIds.filter((id) => availableItems.some((i) => i.id === id)).length;
    }
    return availableItems.filter((i) => i.isPopular).length;
  }, [section.content?.popularItemIds, availableItems]);

  const Icon = SECTION_ICONS[section.type] ?? Info;
  const meta = getSectionMeta(section, popularCount, profileCover);

  return (
    <div className={`border border-theme rounded-lg p-4 bg-surface ${section.enabled ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary shrink-0 flex items-center justify-center overflow-hidden border border-theme">
            {heroImage ? (
              <img
                src={getImageUrl(heroImage)}
                alt="Hero thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon size={18} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-theme">{section.title}</h3>
            <p className="text-xs text-secondary truncate">
              {section.description}
              {meta && <span> &middot; {meta}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={() => toggleSection(section.id)}
              className={checkboxClass}
            />
            <span className="text-secondary">Enabled</span>
          </label>
          <button
            onClick={() => onEdit(section)}
            className="p-1.5 text-secondary hover-text-primary hover-bg-primary-soft rounded"
            title="Edit section"
            aria-label={`Edit ${section.title}`}
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
