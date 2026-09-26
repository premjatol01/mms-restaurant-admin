import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Layers, Pencil, Plus, RotateCcw, Search, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../../store/profileStore";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import MasterEntryModal from "../modals/MasterEntryModal";

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

function Thumb({ src, alt, className = "w-10 h-10" }) {
  return (
    <div className={`${className} rounded-lg overflow-hidden bg-theme border border-theme flex items-center justify-center flex-shrink-0`}>
      {src
        ? <img src={src} alt={alt} className="w-full h-full object-cover" />
        : <UtensilsCrossed size={16} className="text-secondary opacity-50" />}
    </div>
  );
}

function FromMenuBadge() {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium flex-shrink-0">
      From Menu
    </span>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="bg-surface rounded-xl border border-theme p-6 space-y-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export default function MenuMasterSection() {
  const {
    menuCategories: categories,
    menuSelection: selection,
    menuLoaded,
    fetchMenuMaster,
    saveMenuSelection,
    createMasterCategory,
    updateMasterCategory,
    createMasterItem,
    updateMasterItem,
  } = useProfileStore();

  const [saving, setSaving] = useState(false);

  // `draft` holds unsaved selection changes. null = nothing changed, show the saved selection.
  const [draft, setDraft] = useState(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [modal, setModal] = useState(null); // { mode, entry?, categoryId? }

  useEffect(() => { fetchMenuMaster(); }, [fetchMenuMaster]);

  const current = draft ?? selection;
  const catSet = useMemo(() => new Set(current.categoryIds), [current]);
  const itemSet = useMemo(() => new Set(current.itemIds), [current]);

  const dirty = !!draft && !(sameSet(draft.categoryIds, selection.categoryIds) && sameSet(draft.itemIds, selection.itemIds));

  const patch = (fn) => setDraft((prev) => fn(prev ?? selection));

  const toggleCategory = (cat) =>
    patch((cur) => {
      const on = cur.categoryIds.includes(cat.id);
      const itemIdsOfCat = new Set(cat.items.map((i) => i.id));
      return {
        categoryIds: on ? cur.categoryIds.filter((id) => id !== cat.id) : [...cur.categoryIds, cat.id],
        // Items only make sense under a selected category, so deselecting drops its items.
        itemIds: on ? cur.itemIds.filter((id) => !itemIdsOfCat.has(id)) : cur.itemIds,
      };
    });

  const selectAllCategories = () =>
    patch((cur) => ({ ...cur, categoryIds: categories.map((c) => c.id) }));

  const clearCategories = () => setDraft({ categoryIds: [], itemIds: [] });

  const toggleItem = (item) =>
    patch((cur) => ({
      ...cur,
      itemIds: cur.itemIds.includes(item.id) ? cur.itemIds.filter((id) => id !== item.id) : [...cur.itemIds, item.id],
    }));

  const toggleAllItems = (cat) =>
    patch((cur) => {
      const ids = cat.items.map((i) => i.id);
      const allOn = ids.length > 0 && ids.every((id) => cur.itemIds.includes(id));
      return {
        ...cur,
        itemIds: allOn ? cur.itemIds.filter((id) => !ids.includes(id)) : [...new Set([...cur.itemIds, ...ids])],
      };
    });

  const handleReset = () => {
    setDraft(null);
    toast.info("Changes discarded.");
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveMenuSelection(current);
    setSaving(false);
    if (result.success) {
      setDraft(null);
      toast.success("Menu master selection saved.");
    } else {
      toast.error(result.message);
    }
  };

  // Add / edit a master entry from the modal.
  const handleEntrySubmit = async (values) => {
    const { mode, entry, categoryId } = modal;
    if (mode === "category") {
      if (entry) return updateMasterCategory(entry.id, values);
      const result = await createMasterCategory(values);
      // Newly added entries are selected for this restaurant (still needs Save selection).
      if (result.success) patch((cur) => ({ ...cur, categoryIds: [...cur.categoryIds, result.category.id] }));
      return result;
    }
    if (entry) return updateMasterItem(entry.id, values);
    const result = await createMasterItem({ ...values, categoryId });
    if (result.success) patch((cur) => ({ ...cur, itemIds: [...cur.itemIds, result.item.id] }));
    return result;
  };

  const query = search.trim().toLowerCase();
  const visibleCategories = query
    ? categories.filter((c) => c.name.toLowerCase().includes(query) || c.items.some((i) => i.name.toLowerCase().includes(query)))
    : categories;
  const selectedCategories = categories.filter((c) => catSet.has(c.id));

  const modalParent = modal?.mode === "item" ? categories.find((c) => c.id === modal.categoryId) : null;

  if (!menuLoaded) return <SkeletonLoader />;

  return (
    <div className="space-y-5">
      {/* Step 1: categories */}
      <FormSection
        title="Categories"
        description="Pick the categories that apply to your restaurant. Anything you add from the Menu module also appears here."
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or items..."
              aria-label="Search categories or items"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-theme bg-surface text-theme placeholder:text-secondary focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={selectAllCategories} disabled={categories.length === 0}>Select All</Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearCategories} disabled={catSet.size === 0}>Clear</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setModal({ mode: "category" })}>
              <Plus size={14} /> Add Category
            </Button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-10">
            <Layers size={32} className="mx-auto text-secondary opacity-40 mb-2" />
            <p className="text-sm text-theme font-medium">No categories in the master yet</p>
            <p className="text-xs text-secondary mt-1">Add a category here, or create one from the Menu module.</p>
          </div>
        ) : visibleCategories.length === 0 ? (
          <p className="text-sm text-secondary text-center py-8">No categories or items match "{search}".</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {visibleCategories.map((cat) => {
              const on = catSet.has(cat.id);
              const canEdit = cat.editable !== false;
              return (
                <div
                  key={cat.id}
                  className={`relative rounded-xl border-2 overflow-hidden bg-surface transition-colors ${on ? "border-[var(--color-primary)]" : "border-theme hover:border-[var(--color-primary-light)]"}`}
                >
                  <button type="button" aria-pressed={on} onClick={() => toggleCategory(cat)} className="block w-full text-left">
                    <div className="aspect-[16/9] bg-theme flex items-center justify-center overflow-hidden">
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        : <UtensilsCrossed size={28} className="text-secondary opacity-40" />}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-theme truncate">{cat.name}</p>
                        {cat.source === "menu" && <FromMenuBadge />}
                      </div>
                      <p className="text-xs text-secondary">{cat.items.length} {cat.items.length === 1 ? "item" : "items"}</p>
                    </div>
                  </button>

                  <span
                    aria-hidden="true"
                    className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center pointer-events-none ${on ? "bg-primary text-white" : "bg-surface border border-theme"}`}
                  >
                    {on && <Check size={12} strokeWidth={3} />}
                  </span>

                </div>
              );
            })}
          </div>
        )}
      </FormSection>

      {/* Step 2: items, only for selected categories */}
      <FormSection title="Menu Items" description="Choose the items to add from each selected category.">
        {selectedCategories.length === 0 ? (
          <div className="text-center py-10">
            <Layers size={32} className="mx-auto text-secondary opacity-40 mb-2" />
            <p className="text-sm text-theme font-medium">Select a category first</p>
            <p className="text-xs text-secondary mt-1">Items from the categories you select will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCategories.map((cat) => {
              const selectedCount = cat.items.filter((i) => itemSet.has(i.id)).length;
              const allOn = cat.items.length > 0 && selectedCount === cat.items.length;
              const isCollapsed = !!collapsed[cat.id];
              return (
                <div key={cat.id} className="rounded-xl border border-theme overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-theme">
                    <button
                      type="button"
                      onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
                      aria-expanded={!isCollapsed}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <ChevronDown size={16} className={`text-secondary flex-shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                      <span className="text-sm font-medium text-theme truncate">{cat.name}</span>
                      <span className="text-xs text-secondary flex-shrink-0">{selectedCount} of {cat.items.length} selected</span>
                    </button>
                    {cat.items.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => toggleAllItems(cat)}>
                        {allOn ? "Clear" : "Select All"}
                      </Button>
                    )}
                    <Button type="button" variant="secondary" size="sm" onClick={() => setModal({ mode: "item", categoryId: cat.id })}>
                      <Plus size={14} /> Add Item
                    </Button>
                  </div>

                  {!isCollapsed && (
                    cat.items.length === 0 ? (
                      <p className="text-xs text-secondary px-4 py-5 text-center">No items in this category yet.</p>
                    ) : (
                      <ul>
                        {cat.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-3 px-3 py-2 border-b border-theme last:border-0">
                            <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={itemSet.has(item.id)}
                                onChange={() => toggleItem(item)}
                                className="w-4 h-4 flex-shrink-0 accent-[var(--color-primary)]"
                              />
                              <Thumb src={item.image} alt={item.name} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-theme truncate">{item.name}</p>
                                {item.description && <p className="text-xs text-secondary truncate">{item.description}</p>}
                              </div>
                            </label>
                            {item.source === "menu" && <FromMenuBadge />}
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </FormSection>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-theme rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm text-theme">
          <span className="font-medium">{current.categoryIds.length}</span> {current.categoryIds.length === 1 ? "category" : "categories"},{" "}
          <span className="font-medium">{current.itemIds.length}</span> {current.itemIds.length === 1 ? "item" : "items"} selected
          {dirty && <span className="text-amber-600 ml-2">Unsaved changes</span>}
        </p>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw size={14} /> Discard
            </Button>
          )}
          <Button type="button" onClick={handleSave} loading={saving} disabled={!dirty}>Save Selection</Button>
        </div>
      </div>

      {modal && (
        <MasterEntryModal
          mode={modal.mode}
          entry={modal.entry}
          parentName={modalParent?.name}
          onSubmit={handleEntrySubmit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
