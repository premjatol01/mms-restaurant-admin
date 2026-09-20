import { Star, UtensilsCrossed } from "lucide-react";
import VegDot from "./shared/VegDot";
import { formatPrice } from "../utils/format";

const MAX_PREVIEW_ITEMS = 6;

// How the Popular Menu section will look on the website, drawn with the configured menu colors.
export default function MenuPreview({ title, description, items, colors, showViewAll, viewAllLabel, onViewAll }) {
  const border = `color-mix(in srgb, ${colors.headingText} 15%, transparent)`;
  const visibleItems = items.slice(0, MAX_PREVIEW_ITEMS);

  return (
    <div className="rounded-lg border border-theme p-5 space-y-4" style={{ backgroundColor: colors.sectionBackground }}>
      <div className="text-center">
        <h4 className="text-lg font-semibold" style={{ color: colors.headingText }}>{title || "Popular Menu"}</h4>
        {description && (
          <p className="text-sm mt-1" style={{ color: colors.headingText, opacity: 0.7 }}>{description}</p>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center" style={{ color: colors.headingText }}>
          <UtensilsCrossed size={22} className="opacity-60" />
          <p className="text-sm opacity-70">No popular dishes yet. Mark dishes as Popular in the Menu module to show them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border p-3 space-y-2"
              style={{ backgroundColor: colors.cardBackground, borderColor: border }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <VegDot isVeg={item.isVeg} />
                  <p className="text-sm font-medium truncate" style={{ color: colors.headingText }}>{item.name}</p>
                </div>
                <p className="text-sm font-semibold shrink-0" style={{ color: colors.priceText }}>
                  {formatPrice(item.price)}
                </p>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: colors.headingText, opacity: 0.65 }}>
                {item.description}
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: colors.accent, color: colors.accentText }}
              >
                <Star size={11} />
                Popular
              </span>
            </div>
          ))}
        </div>
      )}

      {showViewAll && (
        <div className="text-center">
          <button
            type="button"
            onClick={onViewAll}
            className="px-5 py-2 text-sm font-medium rounded-lg"
            style={{ backgroundColor: colors.accent, color: colors.accentText }}
          >
            {viewAllLabel || "View All Menu"}
          </button>
        </div>
      )}
    </div>
  );
}
