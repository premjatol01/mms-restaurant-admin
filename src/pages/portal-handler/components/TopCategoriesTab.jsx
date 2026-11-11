import React, { useEffect } from "react";
import { Check, CheckCircle2, Layers } from "lucide-react";
import { toast } from "sonner";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import { useMenuStore } from "../../../store/menuStore";

export default function TopCategoriesTab() {
  const { portalData, toggleCategorySelection } = usePortalHandlerStore();
  const { categories: dbCategories, fetchMenuData, loading } = useMenuStore();

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Combine DB categories or fallback demo categories
  const allCategories =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : portalData.topCategories.fallbackList || [];

  const selectedIds = portalData.topCategories.selectedIds || [];
  const selectedCount = selectedIds.length;

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#d9480f] flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Top 5 Featured Categories
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Select any 5 categories from your menu to display prominently on the customer ordering portal.
            </p>
          </div>
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              selectedCount === 5
                ? "bg-green-100 border-green-300 text-green-700"
                : selectedCount > 0
                ? "bg-orange-100 border-orange-300 text-[#d9480f]"
                : "bg-surface-soft border-theme text-secondary"
            }`}
          >
            {selectedCount} of 5 Selected
          </span>
        </div>
      </div>

      {/* Available Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allCategories.map((category) => {
          const catId = category.id || category._id;
          const isSelected = selectedIds.includes(catId);
          const selectedIndex = isSelected ? selectedIds.indexOf(catId) + 1 : null;

          return (
            <div
              key={catId}
              onClick={() => toggleCategorySelection(catId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                isSelected
                  ? "bg-primary-light/20 border-primary shadow-xs ring-1 ring-primary/40"
                  : "bg-surface hover:bg-surface-soft border-theme hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox / Badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "border border-theme text-secondary bg-surface"
                  }`}
                >
                  {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                </div>

                <div className="min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isSelected ? "text-primary" : "text-theme"
                    }`}
                  >
                    {category.name}
                  </h4>
                  <p className="text-[11px] text-secondary mt-0.5">
                    {category.itemCount || 0} menu items
                  </p>
                </div>
              </div>

              {isSelected && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white shrink-0">
                  Slot #{selectedIndex}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
