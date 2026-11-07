import { useState, useMemo } from "react";
import { Plus, Folder, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import CategoryForm from "./CategoryForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function CategoriesTab() {
  const navigate = useNavigate();
  const { categories, menuItems, deleteCategory, updateCategory } = useMenuStore();
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const paginatedCategories = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return categories.slice(start, start + pagination.limit);
  }, [categories, pagination]);

  const getItemCount = (catId) => menuItems.filter((i) => i.categoryId === catId).length;
  const topCategoryCount = categories.filter((c) => c.isTopCategory).length;

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteCategoryData.id);
      toast.success("Category deleted successfully.");
      setDeleteCategoryData(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = category.status === "active" ? "inactive" : "active";
    try {
      await updateCategory(category.id, { status: newStatus });
      toast.success(`Category marked as ${newStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleToggleTop = async (category) => {
    const isCurrentlyTop = Boolean(category.isTopCategory);
    if (!isCurrentlyTop) {
      const currentTopCount = categories.filter((c) => c.isTopCategory).length;
      if (currentTopCount >= 5) {
        toast.error("You can select up to 5 top categories. Please deselect one first.");
        return;
      }
    }
    try {
      await updateCategory(category.id, { isTopCategory: !isCurrentlyTop });
      toast.success(
        !isCurrentlyTop
          ? `"${category.name}" added to Top 5 Categories.`
          : `"${category.name}" removed from Top Categories.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      {/* Top Header & Actions */}
      <div className="flex-none mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-secondary">
            Organize your menu items into categories. Select up to 5 top categories to feature on your customer ordering portal.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
              <Star size={13} className="fill-amber-400 text-amber-500" />
              Top Categories: {topCategoryCount} / 5 Selected
            </span>
          </div>
        </div>
        <Button onClick={() => { setEditCategory(null); setShowForm(true); }}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {!categories.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No categories selected"
            description="You haven't selected any categories from the Restaurant Profile, or created custom ones."
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
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Category</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Top 5</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Items</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0 overflow-hidden shadow-sm">
                          {category.image || category.imageUrl ? <img src={getImageUrl(category.image || category.imageUrl)} alt={category.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <Folder size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-theme">{category.name}</p>
                          {category.description && <p className="text-xs text-secondary">{category.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTop(category)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          category.isTopCategory
                            ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                            : "bg-surface text-secondary border border-theme hover:border-amber-300 hover:text-amber-700"
                        }`}
                        title={
                          category.isTopCategory
                            ? "Remove from Top 5 Categories"
                            : "Select as one of Top 5 Categories"
                        }
                      >
                        <Star
                          size={14}
                          className={
                            category.isTopCategory
                              ? "fill-amber-400 text-amber-500"
                              : "text-gray-400 hover:text-amber-500"
                          }
                        />
                        <span>{category.isTopCategory ? "Top 5" : "Set Top"}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-theme font-medium">{getItemCount(category.id)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${category.status === "active" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                        {category.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionsMenu
                        onEdit={() => { setEditCategory(category); setShowForm(true); }}
                        onToggle={() => handleToggleStatus(category)}
                        onDelete={() => setDeleteCategoryData(category)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={categories.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="categories"
          />
        </div>
      )}

      <CategoryForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditCategory(null); }}
        editCategory={editCategory}
      />

      {deleteCategoryData && (
        <DeleteConfirmDialog
          title="Delete Category?"
          message={`Are you sure you want to delete "${deleteCategoryData.name}"?`}
          itemCount={getItemCount(deleteCategoryData.id)}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCategoryData(null)}
        />
      )}
    </div>
  );
}
