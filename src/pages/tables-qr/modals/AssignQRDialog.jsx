import { useState } from "react";
import { Unlink } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { getFreeQRCodes, formatQROption } from "../utils/qrRules";

export default function AssignQRDialog({ table, onClose, onAssigned }) {
  const { tables, qrCodes, assignQRToTable, unassignQRFromTable } = useTablesQRStore();
  const [selectedQR, setSelectedQR] = useState("");

  // Always read the live table so the dialog never acts on stale data
  const liveTable = tables.find((t) => t.id === table.id) || table;
  const currentQR = qrCodes.find((qr) => qr.id === liveTable.qrCodeId);

  // Only free QR codes are offered (never ones already on a table, inactive,
  // or custom QR codes that belong to another restaurant).
  const freeQRCodes = getFreeQRCodes(qrCodes, tables);

  const handleAssign = () => {
    if (!selectedQR) return;
    if (assignQRToTable(liveTable.id, selectedQR)) {
      toast.success("QR code assigned successfully.");
      onAssigned?.();
    } else {
      toast.error("That QR code is no longer available. Please pick another one.");
      setSelectedQR("");
    }
  };

  const handleRemove = () => {
    if (unassignQRFromTable(liveTable.id)) toast.success("QR code unassigned successfully.");
    onAssigned?.();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={currentQR ? "Change QR Assignment" : "Assign QR Code"} size="sm">
      {currentQR && (
        <div className="mb-4 p-3 bg-primary-light/20 rounded-lg flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-secondary">Currently assigned to {liveTable.tableId}:</p>
            <p className="font-medium text-theme">{formatQROption(currentQR)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-sm text-red-500 hover:underline flex-shrink-0"
          >
            <Unlink size={14} /> Remove
          </button>
        </div>
      )}
      <div className="space-y-4">
        <Select
          label={currentQR ? "Change to" : "Select QR Code"}
          value={selectedQR}
          onChange={setSelectedQR}
          options={[
            { value: "", label: freeQRCodes.length ? "Select a QR code" : "No free QR codes available" },
            ...freeQRCodes.map((qr) => ({ value: qr.id, label: formatQROption(qr) })),
          ]}
        />
        <p className="text-xs text-secondary">Only QR codes that are not assigned to another table are listed.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!selectedQR} onClick={handleAssign}>Assign QR</Button>
        </div>
      </div>
    </Modal>
  );
}
