import { useState, useMemo } from "react";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import ComboForm from "./ComboForm";
import DeleteConfirmDialog from "../modals/DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function CombosTab() {
  const { combos, menuItems, updateCombo, deleteCombo } = useMenuStore();
  const [showForm, setShowForm] = useState(false);
  const [editCombo, setEditCombo] = useState(null);
  const [deleteComboData, setDeleteComboData] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const paginatedCombos = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return combos.slice(start, start + pagination.limit);
  }, [combos, pagination]);

  const getItemsCount = (itemIds) => itemIds.length;

  const getOriginalTotal = (itemIds) => {
    return itemIds.reduce((sum, id) => {
      const item = menuItems.find((i) => i.id === id);
      return sum + (item?.price || 0);
    }, 0);
  };

  const handleToggleStatus = async (combo) => {
    const newStatus = combo.status === "available" ? "unavailable" : "available";
    try {
      await updateCombo(combo.id, { status: newStatus });
      toast.success(`Combo marked as ${newStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCombo(deleteComboData.id);
      toast.success("Combo deleted successfully.");
      setDeleteComboData(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete combo");
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      {/* Top Header & Actions */}
      <div className="flex-none mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-secondary">Create and manage special combinations of menu items.</p>
        </div>
        <Button onClick={() => { setEditCombo(null); setShowForm(true); }}>
          <Plus size={16} /> Create Combo
        </Button>
      </div>

      {!combos.length ? (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No combos yet"
            description="Create a combo by combining multiple menu items."
            actionLabel="+ Create Combo"
            onAction={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-theme">Combo</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Items</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme hidden md:table-cell">Original Value</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Combo Price</th>
                  <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium text-theme">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCombos.map((combo) => {
                  const originalTotal = getOriginalTotal(combo.itemIds);
                  return (
                    <tr key={combo.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0 overflow-hidden shadow-sm">
                            {combo.image || combo.imageUrl ? (
                              <img 
                                src={getImageUrl(combo.image || combo.imageUrl)} 
                                alt={combo.name} 
                                className="w-full h-full object-cover rounded-lg" 
                                onError={(e) => { e.currentTarget.style.display = "none"; }} 
                              />
                            ) : (
                              <Package size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-theme">{combo.name}</p>
                            {combo.description && <p className="text-xs text-secondary">{combo.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-theme">{getItemsCount(combo.itemIds)} items</td>
                      <td className="px-4 py-3.5 text-secondary hidden md:table-cell">₹{originalTotal}</td>
                      <td className="px-4 py-3.5 font-semibold text-theme">₹{combo.price}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${combo.status === "available" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                          {combo.status === "available" ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ActionsMenu
                          onEdit={() => { setEditCombo(combo); setShowForm(true); }}
                          onToggle={() => handleToggleStatus(combo)}
                          onDelete={() => setDeleteComboData(combo)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination */}
          <Pagination
            pagination={pagination}
            totalItems={combos.length}
            onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination({ page: 1, limit: newLimit })}
            itemName="combos"
          />
        </div>
      )}

      <ComboForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditCombo(null); }}
        editCombo={editCombo}
      />

      {deleteComboData && (
        <DeleteConfirmDialog
          title="Delete Combo?"
          message={`Are you sure you want to delete "${deleteComboData.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteComboData(null)}
        />
      )}
    </div>
  );
}
