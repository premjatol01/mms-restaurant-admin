import { useState } from "react";
import { Plus, UtensilsCrossed, Star } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import SearchInput from "../../../components/ui/SearchInput";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import MenuItemForm from "./MenuItemForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";

export default function MenuItemsTab() {
  const { menuItems, categories, deleteMenuItem, updateMenuItem, toggleMenuItemPopular } = useMenuStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
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

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || "-";

  const handleDelete = () => {
    deleteMenuItem(deleteItem.id);
    toast.success(`"${deleteItem.name}" deleted successfully.`);
    setDeleteItem(null);
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === "available" ? "unavailable" : "available";
    updateMenuItem(item.id, { status: newStatus });
    toast.success(`Item marked as ${newStatus}.`);
  };

  const handleTogglePopular = (item) => {
    const isNowPopular = toggleMenuItemPopular(item.id);
    toast.success(isNowPopular ? `"${item.name}" added to popular items.` : `"${item.name}" removed from popular items.`);
  };

  const clearFilters = () => {
    setSearch("");
    setCatFilter("");
    setStatusFilter("");
    setPopularOnly(false);
  };

  const hasFilters = search || catFilter || statusFilter || popularOnly;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        </div>
        <Select
          value={catFilter}
          onChange={setCatFilter}
          options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          className="w-full sm:w-48"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "available", label: "Available" },
            { value: "unavailable", label: "Unavailable" },
          ]}
          className="w-full sm:w-40"
        />
        <button
          type="button"
          onClick={() => setPopularOnly((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
            popularOnly ? "bg-primary text-white border-transparent" : "border-theme text-theme hover:bg-primary-light"
          }`}
        >
          <Star size={16} className={popularOnly ? "" : "text-amber-500"} fill={popularOnly ? "currentColor" : "none"} />
          Popular ({popularCount})
        </button>
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
          title="No menu items yet"
          description="Start building your restaurant menu by adding your first menu item."
          actionLabel="+ Add Item"
          onAction={() => setShowForm(true)}
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
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <UtensilsCrossed size={18} />}
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