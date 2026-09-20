import {
  ChevronDown,
  ChevronUp,
  Images,
  Info,
  LayoutTemplate,
  MapPin,
  MessageSquare,
  Pencil,
  Tag,
  UtensilsCrossed
} from "lucide-react";
import { useWebsiteStore } from "../../../store/websiteStore";
import { usePopularMenuItems } from "../hooks/useMenuItems";
import { normalizeField } from "../utils/validation";
import { checkboxClass } from "./shared/fieldStyles";

const SECTION_ICONS = {
  hero: LayoutTemplate,
  about: Info,
  menu: UtensilsCrossed,
  offers: Tag,
  gallery: Images,
  map: MapPin,
  inquiry: MessageSquare
};

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// A short status line under the section name, so admins can see what is configured at a glance.
function getSectionMeta(section, popularCount) {
  const c = section.content;
  switch (section.type) {
    case "hero":
    case "about":
      return c.imageUrl ? "Image added" : "No image yet";
    case "menu":
      return `${plural(popularCount, "popular dish", "popular dishes")} from Menu`;
    case "gallery":
      return plural(c.images?.length ?? 0, "image", "images");
    case "map": {
      const place = [c.location?.city, c.location?.state].filter(Boolean).join(", ");
      return place || "Location not set";
    }
    case "inquiry": {
      const shown = Object.values(c.fields ?? {}).filter((f) => normalizeField(f).enabled).length;
      return plural(shown, "field", "fields");
    }
    default:
      return "";
  }
}

export default function SectionCard({ section, onEdit, onMoveUp, onMoveDown, isFirst, isLast }) {
  const toggleSection = useWebsiteStore((s) => s.toggleSection);
  const popularCount = usePopularMenuItems().length;
  const Icon = SECTION_ICONS[section.type] ?? Info;
  const meta = getSectionMeta(section, popularCount);

  return (
    <div className={`border border-theme rounded-lg p-4 bg-surface ${section.enabled ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary-soft text-primary shrink-0">
            <Icon size={18} />
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
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 text-secondary hover-text-primary hover-bg-primary-soft rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
            aria-label={`Move ${section.title} up`}
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 text-secondary hover-text-primary hover-bg-primary-soft rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
            aria-label={`Move ${section.title} down`}
          >
            <ChevronDown size={16} />
          </button>
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
