import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ComboForm from "./ComboForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ActionsMenu from "./ActionsMenu";

export default function CombosTab() {
  const { combos, menuItems, updateCombo, deleteCombo } = useMenuStore();
  const [showForm, setShowForm] = useState(false);
  const [editCombo, setEditCombo] = useState(null);
  const [deleteComboData, setDeleteComboData] = useState(null);

  const getItemsCount = (itemIds) => itemIds.length;

  const getOriginalTotal = (itemIds) => {
    return itemIds.reduce((sum, id) => {
      const item = menuItems.find((i) => i.id === id);
      return sum + (item?.price || 0);
    }, 0);
  };

  const handleToggleStatus = (combo) => {
    const newStatus = combo.status === "available" ? "unavailable" : "available";
    updateCombo(combo.id, { status: newStatus });
    toast.success(`Combo marked as ${newStatus}.`);
  };

  const handleDelete = () => {
    deleteCombo(deleteComboData.id);
    toast.success("Combo deleted successfully.");
    setDeleteComboData(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-secondary">Create and manage special combinations of menu items.</p>
        </div>
        <Button onClick={() => { setEditCombo(null); setShowForm(true); }}>
          <Plus size={16} /> Create Combo
        </Button>
      </div>

      {!combos.length ? (
        <EmptyState
          title="No combos yet"
          description="Create a combo by combining multiple menu items."
          actionLabel="+ Create Combo"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="overflow-x-auto border border-theme rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/30 border-b border-theme">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-theme">Combo</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Items</th>
                <th className="text-left px-4 py-3 font-medium text-theme hidden md:table-cell">Original Value</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Combo Price</th>
                <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
                <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo) => {
                const originalTotal = getOriginalTotal(combo.itemIds);
                return (
                  <tr key={combo.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
                          {combo.image ? <img src={combo.image} alt={combo.name} className="w-full h-full object-cover rounded-lg" /> : <Package size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-theme">{combo.name}</p>
                          {combo.description && <p className="text-xs text-secondary">{combo.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-theme">{getItemsCount(combo.itemIds)} items</td>
                    <td className="px-4 py-3 text-secondary hidden md:table-cell">₹{originalTotal}</td>
                    <td className="px-4 py-3 font-medium text-theme">₹{combo.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${combo.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {combo.status === "available" ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
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