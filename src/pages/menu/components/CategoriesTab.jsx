import { useState } from "react";
import { Plus, Folder, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import CategoryForm from "./CategoryForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";

export default function CategoriesTab() {
  const { categories, menuItems, deleteCategory, updateCategory } = useMenuStore();
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);

  const getItemCount = (catId) => menuItems.filter((i) => i.categoryId === catId).length;

  const handleDelete = () => {
    deleteCategory(deleteCategoryData.id);
    toast.success("Category deleted successfully.");
    setDeleteCategoryData(null);
  };

  const handleToggleStatus = (category) => {
    const newStatus = category.status === "active" ? "inactive" : "active";
    updateCategory(category.id, { status: newStatus });
    toast.success(`Category marked as ${newStatus}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-secondary">Organize your menu items into categories.</p>
        </div>
        <Button onClick={() => { setEditCategory(null); setShowForm(true); }}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {!categories.length ? (
        <EmptyState
          title="No categories yet"
          description="Create categories to organize your menu items."
          actionLabel="+ Add Category"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Category</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Items</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                        <Folder size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-theme">{category.name}</p>
                        {category.description && <p className="text-xs text-secondary">{category.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme">{getItemCount(category.id)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${category.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {category.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
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