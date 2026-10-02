import { useState } from "react";
import { Plus, UtensilsCrossed, Star, Filter, Sparkles, Palette } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../../../store/menuStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Drawer from "../../../components/ui/Drawer";
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

  const filteredItems = menuItems.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || item.categoryId === catFilter;
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchPopular = !popularOnly || item.isPopular;
    return matchSearch && matchCat && matchStatus && matchPopular;
  });

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

  const clearFilters = () => {
    setSearch("");
    setCatFilter("");
    setStatusFilter("");
    setPopularOnly(false);
  };

  const hasFilters = search || activeFiltersCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        </div>
        
        <Button variant="secondary" onClick={() => setShowFilters(true)}>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Filtered results</span>
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>
        </div>
      )}

      {!menuItems.length ? (
        <EmptyState
          title="No menu items selected"
          description="You haven't selected any menu items from the Restaurant Profile, or created custom ones."
          actionLabel="Go to Profile"
          onAction={() => navigate("/profile")}
        />
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-secondary">No items match your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Item</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Category</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Price</th>
                <th className="text-left px-4 py-3 font-medium text-theme hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-center px-4 py-3 font-medium text-theme">Popular</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary font-medium flex-shrink-0 overflow-hidden">
                        {item.image ? <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" /> : <UtensilsCrossed size={18} />}
                      </div>
                      <span className="font-medium text-theme">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme">{getCategoryName(item.categoryId)}</td>
                  <td className="px-4 py-3 text-theme">₹{item.price}</td>
                  <td className="px-4 py-3 text-secondary hidden md:table-cell max-w-xs truncate">{item.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.status === "available" ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePopular(item)}
                      aria-label={item.isPopular ? `Remove ${item.name} from popular items` : `Mark ${item.name} as popular`}
                      title={item.isPopular ? "Remove from popular" : "Mark as popular"}
                      className="p-1.5 rounded hover:bg-primary-light transition-colors"
                    >
                      <Star
                        size={18}
                        className={item.isPopular ? "text-amber-500" : "text-secondary"}
                        fill={item.isPopular ? "currentColor" : "none"}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionsMenu
                      onEdit={() => { setEditItem(item); setShowForm(true); }}
                      onToggle={() => handleToggleStatus(item)}
                      onDelete={() => setDeleteItem(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              value={catFilter}
              onChange={setCatFilter}
              options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-theme">Status</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
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
              onClick={() => setPopularOnly((v) => !v)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                popularOnly ? "bg-primary text-white border-transparent" : "border-theme text-theme hover:bg-primary-light"
              }`}
            >
              <Star size={16} className={popularOnly ? "" : "text-amber-500"} fill={popularOnly ? "currentColor" : "none"} />
              Show Popular Only ({popularCount})
            </button>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={clearFilters}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setShowFilters(false)}>
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