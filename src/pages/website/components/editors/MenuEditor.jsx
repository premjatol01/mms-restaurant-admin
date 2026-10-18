import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Star, Sparkles, Folder, Utensils, Search, Check } from "lucide-react";
import { toast } from "sonner";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import VegDot from "../shared/VegDot";
import { useMenuItems } from "../../hooks/useMenuItems";
import { useMenuStore } from "../../../../store/menuStore";
import { checkboxClass } from "../shared/fieldStyles";
import { getImageUrl } from "../../../../utils/getImageUrl";

const MAX_POPULAR_CATEGORIES = 5;
const MAX_ITEMS_PER_CATEGORY = 10;

export default function MenuEditor({ section, onSave, onCancel }) {
  const { categories, items, loading } = useMenuItems();
  const setTopCategories = useMenuStore((state) => state.setTopCategories);

  // Available items from database
  const availableItems = useMemo(() => {
    return items.filter((item) => item.isAvailable);
  }, [items]);

  // Section content state
  const [content, setContent] = useState(() => ({
    title: section.content?.title || "Popular Menu",
    description: section.content?.description || "Our most loved dishes, picked by our guests",
  }));

  // Selected category IDs (up to 5)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => {
    if (Array.isArray(section.content?.categoryIds) && section.content.categoryIds.length > 0) {
      return section.content.categoryIds.slice(0, MAX_POPULAR_CATEGORIES);
    }
    return [];
  });

  // Map of categoryId -> array of itemIds (up to 10 items per category)
  const [categoryItemMap, setCategoryItemMap] = useState(() => {
    if (section.content?.categoryItemMap && typeof section.content.categoryItemMap === "object") {
      return section.content.categoryItemMap;
    }
    if (Array.isArray(section.content?.categoryConfigs)) {
      const map = {};
      section.content.categoryConfigs.forEach((cfg) => {
        if (cfg.categoryId && Array.isArray(cfg.itemIds)) {
          map[cfg.categoryId] = cfg.itemIds.slice(0, MAX_ITEMS_PER_CATEGORY);
        }
      });
      return map;
    }
    return {};
  });

  // Track if initial sync from Menu module top categories has happened
  const [initialized, setInitialized] = useState(false);

  // Initialize from Menu module if no custom categoryIds saved in section
  useEffect(() => {
    if (initialized || loading || categories.length === 0) return;

    if (!section.content?.categoryIds || section.content.categoryIds.length === 0) {
      // Find categories marked as Top in the Menu module
      const topCats = categories
        .filter((c) => c.isTopCategory)
        .map((c) => c.id || c._id)
        .slice(0, MAX_POPULAR_CATEGORIES);

      const initialCats = topCats.length > 0
        ? topCats
        : categories.filter((c) => c.status === "active").slice(0, MAX_POPULAR_CATEGORIES).map((c) => c.id || c._id);

      if (initialCats.length > 0) {
        setSelectedCategoryIds(initialCats);
      }
    }
    setInitialized(true);
  }, [categories, loading, initialized, section.content?.categoryIds]);

  // Active category tab for item selection
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  // Keep active category valid when selectedCategoryIds changes
  useEffect(() => {
    if (selectedCategoryIds.length > 0) {
      if (!activeCategoryId || !selectedCategoryIds.includes(activeCategoryId)) {
        setActiveCategoryId(selectedCategoryIds[0]);
      }
    } else {
      setActiveCategoryId(null);
    }
  }, [selectedCategoryIds, activeCategoryId]);

  // Helper to get default items for a category (prioritizing popular/bestseller up to 10)
  const getDefaultItemsForCategory = (catId) => {
    const catItems = availableItems.filter((i) => (i.categoryId || i.category) === catId);
    const popular = catItems.filter((i) => i.isPopular || i.isBestseller).map((i) => i.id);
    if (popular.length >= MAX_ITEMS_PER_CATEGORY) {
      return popular.slice(0, MAX_ITEMS_PER_CATEGORY);
    }
    const remainder = catItems.filter((i) => !popular.includes(i.id)).map((i) => i.id);
    return [...popular, ...remainder].slice(0, MAX_ITEMS_PER_CATEGORY);
  };

  // Ensure selected categories have their items initialized in categoryItemMap
  useEffect(() => {
    if (availableItems.length === 0 || selectedCategoryIds.length === 0) return;

    setCategoryItemMap((prev) => {
      let changed = false;
      const updated = { ...prev };
      selectedCategoryIds.forEach((catId) => {
        if (!updated[catId] || !Array.isArray(updated[catId]) || updated[catId].length === 0) {
          const defaults = getDefaultItemsForCategory(catId);
          if (defaults.length > 0) {
            updated[catId] = defaults;
            changed = true;
          }
        }
      });
      return changed ? updated : prev;
    });
  }, [selectedCategoryIds, availableItems]);

  // Category toggle handler
  const handleToggleCategory = (catId) => {
    const isSelected = selectedCategoryIds.includes(catId);
    if (isSelected) {
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== catId));
    } else {
      if (selectedCategoryIds.length >= MAX_POPULAR_CATEGORIES) {
        toast.error(`You can select up to ${MAX_POPULAR_CATEGORIES} popular categories. Please deselect one first.`);
        return;
      }
      setSelectedCategoryIds((prev) => [...prev, catId]);
      setActiveCategoryId(catId);

      // Initialize default items if not present
      if (!categoryItemMap[catId] || categoryItemMap[catId].length === 0) {
        const defaults = getDefaultItemsForCategory(catId);
        setCategoryItemMap((prev) => ({
          ...prev,
          [catId]: defaults,
        }));
      }
    }
  };

  // Item toggle handler inside the active category
  const handleToggleItem = (itemId) => {
    if (!activeCategoryId) return;

    const currentItemIds = categoryItemMap[activeCategoryId] || [];
    const isSelected = currentItemIds.includes(itemId);

    if (isSelected) {
      setCategoryItemMap((prev) => ({
        ...prev,
        [activeCategoryId]: currentItemIds.filter((id) => id !== itemId),
      }));
    } else {
      if (currentItemIds.length >= MAX_ITEMS_PER_CATEGORY) {
        toast.error(`You can select up to ${MAX_ITEMS_PER_CATEGORY} items for this category.`);
        return;
      }
      setCategoryItemMap((prev) => ({
        ...prev,
        [activeCategoryId]: [...currentItemIds, itemId],
      }));
    }
  };

  // Auto-select top 10 items for active category
  const handleAutoSelectTopItems = () => {
    if (!activeCategoryId) return;
    const defaults = getDefaultItemsForCategory(activeCategoryId);
    setCategoryItemMap((prev) => ({
      ...prev,
      [activeCategoryId]: defaults,
    }));
    toast.success(`Selected top ${defaults.length} items for this category.`);
  };

  // Clear items for active category
  const handleClearCategoryItems = () => {
    if (!activeCategoryId) return;
    setCategoryItemMap((prev) => ({
      ...prev,
      [activeCategoryId]: [],
    }));
  };

  // Search filter inside active category
  const [itemSearch, setItemSearch] = useState("");

  const activeCategory = useMemo(() => {
    return categories.find((c) => (c.id || c._id) === activeCategoryId) || null;
  }, [categories, activeCategoryId]);

  const activeCategoryItems = useMemo(() => {
    if (!activeCategoryId) return [];
    return availableItems.filter((i) => (i.categoryId || i.category) === activeCategoryId);
  }, [availableItems, activeCategoryId]);

  const filteredActiveItems = useMemo(() => {
    if (!itemSearch.trim()) return activeCategoryItems;
    const q = itemSearch.toLowerCase();
    return activeCategoryItems.filter((item) =>
      item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    );
  }, [activeCategoryItems, itemSearch]);

  const activeCategorySelectedItems = categoryItemMap[activeCategoryId] || [];

  const handleSave = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error("Please select at least one popular category.");
      return;
    }

    const categoryConfigs = selectedCategoryIds.map((catId) => ({
      categoryId: catId,
      itemIds: (categoryItemMap[catId] || []).slice(0, MAX_ITEMS_PER_CATEGORY),
    }));

    const popularItemIds = Array.from(
      new Set(
        selectedCategoryIds.flatMap((catId) => (categoryItemMap[catId] || []).slice(0, MAX_ITEMS_PER_CATEGORY))
      )
    );

    const payload = {
      ...section.content,
      title: content.title.trim() || "Popular Menu",
      description: content.description.trim(),
      categoryIds: selectedCategoryIds,
      categoryItemMap,
      categoryConfigs,
      popularItemIds,
    };

    // Also sync the category store's top categories in menu module
    if (setTopCategories) {
      try {
        await setTopCategories(selectedCategoryIds);
      } catch (err) {
        console.warn("Could not sync top categories to menu module:", err);
      }
    }

    onSave(payload);
  };

  return (
    <EditorShell
      title="Popular Menu Section"
      description="Select up to 5 categories and choose up to 10 top dishes for each category to highlight on your website."
      onBack={onCancel}
      onSave={handleSave}
    >
      <Input
        label="Section Title"
        value={content.title || ""}
        onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
        placeholder="Popular Menu"
      />
      <Textarea
        label="Description"
        value={content.description || ""}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Our most loved dishes, picked by our guests"
        rows={2}
      />

      {/* ───────────────── 1. POPULAR CATEGORIES SELECTION (MAX 5) ───────────────── */}
      <FormBlock
        title="Popular Categories"
        description="Select up to 5 categories to feature on your website. Categories marked as Top 5 in your Menu module are indicated below."
        action={
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
              selectedCategoryIds.length > 0
                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50"
                : "bg-surface-soft text-secondary border-theme"
            }`}
          >
            <Star size={13} className={selectedCategoryIds.length > 0 ? "fill-amber-400 text-amber-500" : ""} />
            {selectedCategoryIds.length} / {MAX_POPULAR_CATEGORIES} Categories Selected
          </span>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-secondary text-sm gap-2 border border-theme rounded-lg bg-surface">
            <LoaderCircle size={18} className="animate-spin text-primary" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-secondary text-sm space-y-1 border border-theme rounded-lg bg-surface p-4">
            <Folder size={28} className="mx-auto text-secondary/40 mb-2" />
            <p className="font-medium text-theme">No categories found.</p>
            <p className="text-xs">
              Please create categories in the Menu module before configuring the Popular Menu section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => {
              const catId = category.id || category._id;
              const isSelected = selectedCategoryIds.includes(catId);
              const isTop = Boolean(category.isTopCategory);
              const itemCount = availableItems.filter((i) => (i.categoryId || i.category) === catId).length;

              return (
                <div
                  key={catId}
                  onClick={() => handleToggleCategory(catId)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary-light/20 shadow-sm ring-1 ring-primary/40"
                      : "border-theme bg-surface hover:border-primary/50 hover:bg-surface-soft"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0 overflow-hidden">
                      {category.image || category.imageUrl ? (
                        <img
                          src={getImageUrl(category.image || category.imageUrl)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Folder size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-theme truncate">{category.name}</p>
                        {isTop && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                            title="Marked as Top 5 in Menu module"
                          >
                            <Star size={10} className="fill-amber-400 text-amber-500" />
                            Menu Top
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary mt-0.5">
                        {itemCount} available {itemCount === 1 ? "dish" : "dishes"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-theme/60 text-xs">
                    <span className="text-secondary">
                      {isSelected
                        ? `${(categoryItemMap[catId] || []).length} / ${MAX_ITEMS_PER_CATEGORY} items chosen`
                        : "Click to select"}
                    </span>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-surface-soft text-theme border border-theme hover:border-primary/60"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={13} />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Star size={12} className="text-secondary" />
                          <span>Select</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FormBlock>

      {/* ───────────────── 2. TOP 10 ITEMS PER CATEGORY CONFIGURATION ───────────────── */}
      <FormBlock
        title="Top Dishes per Category (Up to 10 dishes each)"
        description="Select which dishes appear under each featured category on your website."
      >
        {selectedCategoryIds.length === 0 ? (
          <div className="py-8 text-center text-secondary text-sm space-y-2 border border-theme rounded-lg bg-surface p-6">
            <Utensils size={28} className="mx-auto text-secondary/40" />
            <p className="font-medium text-theme">No popular categories selected yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Please choose at least one category above to configure its top dishes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category selection tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-theme">
              {selectedCategoryIds.map((catId) => {
                const cat = categories.find((c) => (c.id || c._id) === catId);
                const isActive = activeCategoryId === catId;
                const count = (categoryItemMap[catId] || []).length;

                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(catId);
                      setItemSearch("");
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-primary text-primary font-semibold bg-primary-light/20"
                        : "border-transparent text-secondary hover:text-theme hover:bg-surface-soft"
                    }`}
                  >
                    <span>{cat?.name || "Category"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-surface-soft text-secondary border border-theme"
                      }`}
                    >
                      {count} / {MAX_ITEMS_PER_CATEGORY}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active category items editor */}
            {activeCategory && (
              <div className="border border-theme rounded-xl p-4 bg-surface space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div>
                    <h4 className="text-sm font-bold text-theme flex items-center gap-2">
                      <span>{activeCategory.name}</span>
                      <span className="text-xs font-normal text-secondary">
                        ({activeCategorySelectedItems.length} of {MAX_ITEMS_PER_CATEGORY} dishes selected)
                      </span>
                    </h4>
                    {activeCategory.description && (
                      <p className="text-xs text-secondary mt-0.5 line-clamp-1">
                        {activeCategory.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAutoSelectTopItems}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary-light text-primary hover:bg-primary-light/80 border border-primary/20 transition-colors"
                      title="Select top 10 items (prioritizing popular/bestseller)"
                    >
                      <Sparkles size={13} />
                      <span>Auto-Select Top 10</span>
                    </button>
                    {activeCategorySelectedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearCategoryItems}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-theme hover:bg-surface-soft border border-theme transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Search bar inside category if there are several items */}
                {activeCategoryItems.length > 4 && (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                      type="text"
                      placeholder={`Search dishes in ${activeCategory.name}...`}
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-soft border border-theme rounded-lg text-theme focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                {/* Items list */}
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {activeCategoryItems.length === 0 ? (
                    <div className="py-8 text-center text-secondary text-sm space-y-1">
                      <p className="font-medium text-theme">No available dishes in this category.</p>
                      <p className="text-xs">
                        Add items to &quot;{activeCategory.name}&quot; in the Menu module and ensure they are marked Available.
                      </p>
                    </div>
                  ) : filteredActiveItems.length === 0 ? (
                    <div className="py-6 text-center text-secondary text-xs">
                      No dishes matched &quot;{itemSearch}&quot; in this category.
                    </div>
                  ) : (
                    filteredActiveItems.map((item) => {
                      const isSelected = activeCategorySelectedItems.includes(item.id);

                      return (
                        <label
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary/40 bg-primary-light/10"
                              : "border-transparent hover:bg-primary-light/5 hover:border-theme"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleItem(item.id)}
                              className={checkboxClass}
                            />

                            <div className="w-9 h-9 rounded-md bg-surface-soft border border-theme flex items-center justify-center shrink-0 overflow-hidden text-secondary">
                              {item.image ? (
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Utensils size={14} className="opacity-40" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <VegDot isVeg={item.isVeg} />
                                <p className="text-sm font-medium text-theme truncate">{item.name}</p>
                                {(item.isPopular || item.isBestseller) && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                    <Star size={9} className="fill-amber-400 text-amber-500" />
                                    {item.isBestseller ? "Bestseller" : "Popular"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-secondary mt-0.5">
                                ₹{item.price}
                                {item.description ? ` • ${item.description}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                <Check size={14} />
                                <span className="hidden sm:inline">Added</span>
                              </span>
                            ) : (
                              <span className="text-xs text-secondary opacity-60 hover:opacity-100">
                                + Add
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </FormBlock>
    </EditorShell>
  );
}
