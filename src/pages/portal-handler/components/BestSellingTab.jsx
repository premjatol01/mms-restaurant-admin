import React, { useEffect, useState } from "react";
import { Flame, Plus, Trash2, Search, CheckCircle2 } from "lucide-react";
import { usePortalHandlerStore } from "../../../store/portalHandlerStore";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";

export default function BestSellingTab() {
  const {
    portalData,
    addBestSellingItem,
    removeBestSellingItem,
  } = usePortalHandlerStore();

  const { menuItems: dbItems, fetchMenuData } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Combine DB items or fallback demo items
  const allAvailableItems =
    dbItems && dbItems.length > 0
      ? dbItems
      : [
          ...(portalData.bestSelling.selectedItems || []),
          ...(portalData.bestSelling.fallbackCatalog || []),
        ];

  const selectedItems = portalData.bestSelling.selectedItems || [];
  const selectedIds = new Set(selectedItems.map((i) => i.id || i._id));

  // Items not yet added to Best Sellers, filtered by search
  const availableToAdd = allAvailableItems.filter((item) => {
    const id = item.id || item._id;
    if (selectedIds.has(id)) return false;
    if (!searchTerm.trim()) return true;
    return (
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categoryName || item.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-surface rounded-xl border border-theme p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme">
              Best Selling Items
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Select dishes manually from your menu to feature as Best Sellers in the customer portal.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 self-start sm:self-auto">
          {selectedItems.length} Items Featured
        </span>
      </div>

      {/* Currently Featured Best Selling Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-theme">
          Featured Best Sellers ({selectedItems.length})
        </h4>

        {selectedItems.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-theme rounded-xl text-xs text-secondary">
            No items selected yet. Choose from available menu dishes below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedItems.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div
                  key={itemId}
                  className="p-3 rounded-xl border border-theme bg-surface-soft flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] border font-bold bg-white shrink-0 ${
                        item.isVeg ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                      }`}
                    >
                      ●
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-theme truncate">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-secondary">
                        {item.category} • <span className="text-primary font-semibold">₹{item.price}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBestSellingItem(itemId)}
                    title="Remove from Best Sellers"
                    className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available DB Items to Add */}
      <div className="space-y-3 pt-4 border-t border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-theme">
            Available Menu Dishes ({availableToAdd.length})
          </h4>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              placeholder="Search dish name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {availableToAdd.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-theme rounded-xl text-xs text-secondary">
            {searchTerm ? "No dishes match your search query." : "All available dishes are currently featured."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {availableToAdd.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div
                  key={itemId}
                  className="p-3 rounded-xl border border-theme bg-surface hover:border-primary/40 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-3 h-3 rounded flex items-center justify-center text-[6px] border font-bold bg-white shrink-0 ${
                        item.isVeg ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                      }`}
                    >
                      ●
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-theme truncate">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-secondary">
                        ₹{item.price} • {item.categoryName || item.category || "General"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={() => addBestSellingItem(item)}
                  >
                    Add
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
