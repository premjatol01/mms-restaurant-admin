import { useState, useMemo, useEffect } from "react";
import { Plus, UtensilsCrossed, Star, Filter, Sparkles, Palette } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../../../store/menuStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Drawer from "../../../components/ui/Drawer";
import Pagination from "../../../components/ui/Pagination";
import MenuItemForm from "./MenuItemForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function MenuItemsTab({ onShowAIPrompt, onShowDesigner }) {
  const navigate = useNavigate();
  const { menuItems, categories, deleteMenuItem, updateMenuItem, toggleMenuItemPopular } = useMenuStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Draft filters inside drawer
  const [draftCat, setDraftCat] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftPopular, setDraftPopular] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || item.categoryId === catFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchPopular = !popularOnly || item.isPopular;
      return matchSearch && matchCat && matchStatus && matchPopular;
    });
  }, [menuItems, search, catFilter, statusFilter, popularOnly]);

  // Reset page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [search, catFilter, statusFilter, popularOnly]);

  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredItems.slice(start, start + pagination.limit);
  }, [filteredItems, pagination]);

  const popularCount = menuItems.filter((i) => i.isPopular).length;
  const activeFiltersCount = [catFilter, statusFilter, popularOnly].filter(Boolean).length;

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "-";

  const handleDelete = async () => {
    try {
      await deleteMenuItem(deleteItem.id);
      toast.success(`"${deleteItem.name}" deleted successfully.`);
      setDeleteItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "available" ? "unavailable" : "available";
    try {
      await updateMenuItem(item.id, { status: newStatus });
      toast.success(`Item marked as ${newStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleTogglePopular = async (item) => {
    try {
      const isNowPopular = await toggleMenuItemPopular(item.id);
      toast.success(isNowPopular ? `"${item.name}" added to popular items.` : `"${item.name}" removed from popular items.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update popular status");
    }
  };

  const handleOpenFilters = () => {
    setDraftCat(catFilter);
    setDraftStatus(statusFilter);
    setDraftPopular(popularOnly);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    setCatFilter(draftCat);
    setStatusFilter(draftStatus);
    setPopularOnly(draftPopular);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setDraftCat("");
    setDraftStatus("");
    setDraftPopular(false);
    setCatFilter("");
    setStatusFilter("");
    setPopularOnly(false);
  };

  const clearFilters = () => {
    setSearch("");
    setDraftCat("");
    setDraftStatus("");
    setDraftPopular(false);
    setCatFilter("");
    setStatusFilter("");
    setPopularOnly(false);
  };

  const hasFilters = search || activeFiltersCount > 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      {/* Top Controls Bar */}
      <div className="flex-none mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        </div>
        
        <Button variant="secondary" onClick={handleOpenFilters}>
          <Filter size={16} /> Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        
        {onShowAIPrompt && (
          <Button variant="secondary" onClick={onShowAIPrompt}>
            <Sparkles size={15} /> AI Menu Prompt
          </Button>
        )}
        
        {onShowDesigner && (
          <Button variant="secondary" onClick={onShowDesigner}>
            <Palette size={15} /> Contact Designer
          </Button>
        )}

        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus size={16} /> Add Item
        </Button>
      </div>

      {hasFilters && (
        <div className="flex-none flex items-center gap-2 mb-3">
          <span className="text-xs text-secondary">Filtered: {filteredItems.length} items found</span>
          <button onClick={clearFilters} className="text-xs text-primary hover:underline cursor-pointer">Clear filters</button>
        </div>
      )}

      {/* Main Full-Height Table Card */}
      {!menuItems.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No menu items selected"
            description="You haven't selected any menu items from the Restaurant Profile, or created custom ones."
            actionLabel="Go to Profile"
            onAction={() => navigate("/profile")}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Item</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Category</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Price</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
                  <th className="text-center px-4 py-3.5 font-medium text-theme">Popular</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center text-secondary">
                      No items match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const isZeroPrice = !item.price || Number(item.price) === 0;

                    return (
                      <tr
                        key={item.id}
                        className={`border-b last:border-0 transition-colors ${
                          isZeroPrice
                            ? "bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border-amber-300/30"
                            : "border-theme hover:bg-primary-light/10"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary font-medium flex-shrink-0 overflow-hidden border border-theme/40 shadow-sm">
                              {item.image || item.imageUrl ? (
                                <img
                                  src={getImageUrl(item.image || item.imageUrl)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <UtensilsCrossed size={18} />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-theme">{item.name}</span>
                              {isZeroPrice && (
                                <span className="ml-2 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                  ₹0 Price
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-theme">{getCategoryName(item.categoryId)}</td>
                        <td className="px-4 py-3.5 text-theme font-medium">
                          {isZeroPrice ? (
                            <span className="font-bold text-amber-700 dark:text-amber-400">₹0</span>
                          ) : (
                            `₹${item.price}`
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-secondary hidden md:table-cell max-w-xs truncate">{item.description}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${item.status === "available" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                            {item.status === "available" ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePopular(item)}
                            aria-label={item.isPopular ? `Remove ${item.name} from popular items` : `Mark ${item.name} as popular`}
                            title={item.isPopular ? "Remove from popular" : "Mark as popular"}
                            className="p-1.5 rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
                          >
                            <Star
                              size={18}
                              className={item.isPopular ? "text-amber-500" : "text-secondary"}
                              fill={item.isPopular ? "currentColor" : "none"}
                            />
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <ActionsMenu
                            onEdit={() => { setEditItem(item); setShowForm(true); }}
                            onToggle={() => handleToggleStatus(item)}
                            onDelete={() => setDeleteItem(item)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={filteredItems.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="items"
          />
        </div>
      )}

      <Drawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Menu Items"
        size="sm"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme">Category</label>
            <Select
              value={draftCat}
              onChange={setDraftCat}
              options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme">Status</label>
            <Select
              value={draftStatus}
              onChange={setDraftStatus}
              options={[
                { value: "", label: "All Status" },
                { value: "available", label: "Available" },
                { value: "unavailable", label: "Unavailable" },
              ]}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme">Popular Items</label>
            <button
              type="button"
              onClick={() => setDraftPopular((v) => !v)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                draftPopular ? "bg-primary text-white border-transparent" : "border-theme text-theme hover:bg-primary-light"
              }`}
            >
              <Star size={16} className={draftPopular ? "" : "text-amber-500"} fill={draftPopular ? "currentColor" : "none"} />
              Show Popular Only ({popularCount})
            </button>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>

      <MenuItemForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        editItem={editItem}
      />

      {deleteItem && (
        <DeleteConfirmDialog
          title="Delete Menu Item?"
          message={`Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}