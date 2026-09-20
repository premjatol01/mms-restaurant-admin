import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import Modal from "./Modal";
import VegDot from "../components/shared/VegDot";
import { formatPrice } from "../utils/format";

// The popup a visitor sees after pressing "View All Menu".
// It only uses the menu colors it receives, so the same component can be reused on the public website.
function FullMenuContent({ onClose, title, categories, items, colors }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);

  const border = `color-mix(in srgb, ${colors.headingText} 15%, transparent)`;

  const availableItems = useMemo(() => items.filter((item) => item.isAvailable), [items]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((cat) => activeCategory === "all" || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: availableItems.filter(
          (item) =>
            item.categoryId === cat.id &&
            (!vegOnly || item.isVeg) &&
            (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
        )
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, availableItems, activeCategory, query, vegOnly]);

  const chipStyle = (active) => ({
    backgroundColor: active ? colors.accent : "transparent",
    color: active ? colors.accentText : colors.headingText,
    borderColor: active ? colors.accent : border
  });

  return (
    <Modal open onClose={onClose} label={title} maxWidth="max-w-3xl">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 space-y-3 border-b" style={{ backgroundColor: colors.cardBackground, borderColor: border }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold" style={{ color: colors.headingText }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded"
            style={{ color: colors.headingText }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: colors.headingText }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none"
              style={{ backgroundColor: colors.sectionBackground, color: colors.headingText, borderColor: border }}
            />
          </div>
          <button
            type="button"
            onClick={() => setVegOnly((v) => !v)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border"
            style={chipStyle(vegOnly)}
            aria-pressed={vegOnly}
          >
            <VegDot isVeg />
            Veg only
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", name: "All" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1 text-sm rounded-full border whitespace-nowrap"
              style={chipStyle(activeCategory === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ backgroundColor: colors.sectionBackground }}>
        {groups.length === 0 ? (
          <p className="text-center text-sm py-10" style={{ color: colors.headingText, opacity: 0.7 }}>
            No dishes match your search. Try a different name or category.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.id}>
              <h3 className="text-base font-semibold mb-3" style={{ color: colors.headingText }}>{group.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 flex gap-3"
                    style={{ backgroundColor: colors.cardBackground, borderColor: border }}
                  >
                    <div className="pt-0.5"><VegDot isVeg={item.isVeg} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium" style={{ color: colors.headingText }}>{item.name}</p>
                        <p className="text-sm font-semibold shrink-0" style={{ color: colors.priceText }}>
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: colors.headingText, opacity: 0.65 }}>
                        {item.description}
                      </p>
                      {item.isPopular && (
                        <span
                          className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: colors.accent, color: colors.accentText }}
                        >
                          <Star size={11} />
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </Modal>
  );
}

// Mounted only while open, so search and filters reset every time the popup opens.
export default function FullMenuModal({ open, ...props }) {
  if (!open) return null;
  return <FullMenuContent {...props} />;
}
