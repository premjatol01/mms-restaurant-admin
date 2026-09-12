import { useState } from "react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

export default function AssignQRDialog({ table, onClose, onAssigned }) {
  const { qrCodes, assignQR, unassignQR } = useTablesQRStore();
  const [selectedQR, setSelectedQR] = useState(table.qrCodeId || "");
  const currentQR = qrCodes.find((qr) => qr.id === table.qrCodeId);
  const availableQRCodes = qrCodes.filter((qr) => qr.status === "available" || qr.id === table.qrCodeId);

  const handleAssign = () => {
    if (selectedQR && selectedQR !== table.qrCodeId) {
      assignQR(selectedQR, table.id);
      toast.success("QR code assigned successfully.");
    } else if (!selectedQR && table.qrCodeId) {
      unassignQR(table.qrCodeId);
      toast.success("QR code unassigned successfully.");
    }
    onAssigned?.();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={currentQR ? "Change QR Assignment" : "Assign QR Code"} size="sm">
      {currentQR && (
        <div className="mb-4 p-3 bg-primary-light/20 rounded-lg">
          <p className="text-sm text-secondary">Currently assigned:</p>
          <p className="font-medium text-theme">{currentQR.name} ({currentQR.type}) - {currentQR.layout}</p>
        </div>
      )}
      <div className="space-y-4">
        <Select
          label="Select QR Code"
          value={selectedQR}
          onChange={setSelectedQR}
          options={[
            { value: "", label: "Remove assignment" },
            ...availableQRCodes.map((qr) => ({ value: qr.id, label: `${qr.name} (${qr.type}) - ${qr.layout}` }))
          ]}
        />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleAssign}>{selectedQR ? "Assign QR" : "Remove"}</Button>
        </div>
      </div>
    </Modal>
  );
}