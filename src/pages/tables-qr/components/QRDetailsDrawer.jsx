import { useState } from "react";
import { X, QrCode, Eye, Download, Link2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import ConfirmDialog from "./ConfirmDialog";

const QR_TYPE_COLORS = { default: "bg-blue-100 text-blue-700", premium: "bg-purple-100 text-purple-700", paid: "bg-amber-100 text-amber-700" };
const QR_STATUS_COLORS = { available: "bg-green-100 text-green-700", assigned: "bg-purple-100 text-purple-700", inactive: "bg-gray-100 text-gray-500" };

export default function QRDetailsDrawer({ qr, onClose }) {
  const { tables, assignQR, unassignQR, updateQRCode } = useTablesQRStore();
  const [showAssign, setShowAssign] = useState(false);
  const [showUnassign, setShowUnassign] = useState(false);
  const [selectedTable, setSelectedTable] = useState(qr.tableId || "");

  const assignedTable = tables.find((t) => t.id === qr.tableId);
  const availableTables = tables.filter((t) => t.status === "active" && (!t.qrCodeId || t.id === qr.tableId));

  const handleAssign = () => {
    if (selectedTable && selectedTable !== qr.tableId) {
      assignQR(qr.id, selectedTable);
      toast.success("QR code assigned successfully.");
    }
    setShowAssign(false);
  };

  const handleUnassign = () => {
    unassignQR(qr.id);
    toast.success("QR code unassigned successfully.");
    setShowUnassign(false);
  };

  const handleToggleStatus = () => {
    const newStatus = qr.status === "inactive" ? "available" : "inactive";
    updateQRCode(qr.id, { status: newStatus });
    toast.success(`QR code ${newStatus === "available" ? "activated" : "deactivated"} successfully.`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
            <h2 className="text-lg font-semibold text-theme">{qr.name}</h2>
            <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* QR Preview */}
            <div className="border border-theme rounded-lg p-4">
              <div className="bg-white p-6 rounded-lg mb-3 flex justify-center">
                <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode size={48} className="text-gray-400" />
                </div>
              </div>
              <p className="text-center text-sm text-secondary">{qr.name}</p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary">Type</span>
                <span className={`text-xs px-2 py-1 rounded-full ${QR_TYPE_COLORS[qr.type]}`}>{qr.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Layout</span>
                <span className="text-theme capitalize">{qr.layout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${QR_STATUS_COLORS[qr.status]}`}>{qr.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Assigned Table</span>
                <span className="text-theme">{assignedTable?.tableId || "—"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowAssign(true)}>
                <Link2 size={16} /> {qr.tableId ? "Change Assignment" : "Assign to Table"}
              </Button>
              {qr.tableId && (
                <Button variant="secondary" className="w-full" onClick={() => setShowUnassign(true)}>
                  <Unlink size={16} /> Unassign
                </Button>
              )}
              <Button variant="secondary" className="w-full" onClick={handleToggleStatus}>
                {qr.status === "inactive" ? "Activate" : "Deactivate"}
              </Button>
              <Button variant="ghost" className="w-full">
                <Download size={16} /> Download QR
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAssign(false)} />
          <div className="relative bg-surface rounded-xl border border-theme w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-theme mb-4">Assign QR Code</h3>
            <p className="text-sm text-secondary mb-4">{qr.name} will be assigned to:</p>
            <Select
              value={selectedTable}
              onChange={setSelectedTable}
              options={[
                { value: "", label: "Select a table" },
                ...availableTables.map((t) => ({ value: t.id, label: t.tableId }))
              ]}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAssign(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAssign}>Assign</Button>
            </div>
          </div>
        </div>
      )}

      {showUnassign && (
        <ConfirmDialog
          title="Unassign QR Code?"
          message={`${qr.name} will no longer be associated with ${assignedTable?.tableId}.`}
          onConfirm={handleUnassign}
          onCancel={() => setShowUnassign(false)}
        />
      )}
    </>
  );
}