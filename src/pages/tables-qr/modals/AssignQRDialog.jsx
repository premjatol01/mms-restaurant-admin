import { useState } from "react";
import { Unlink, Palette } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { defaultQRLayouts } from "../data/tablesQRData";
import ContactDesignerModal from "../../menu/modals/ContactDesignerModal";

export default function AssignQRDialog({ table, onClose, onAssigned }) {
  const { tables, qrCodes, assignQRToTable, unassignQRFromTable, addQRCode } = useTablesQRStore();
  const [selectedLayout, setSelectedLayout] = useState(defaultQRLayouts[0].id);

  const liveTable = tables.find((t) => t.id === table.id) || table;
  const currentQR = qrCodes.find((qr) => qr.id === liveTable.qrCodeId);

  const [showDesigner, setShowDesigner] = useState(false);

  const handleAssign = () => {
    if (!selectedLayout) return;
    
    // Create a new QR code with this layout and assign it
    const newQR = {
      name: `QR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      type: "template",
      layout: selectedLayout,
      tableId: liveTable.id
    };
    
    addQRCode(newQR);
    toast.success("QR code template assigned successfully.");
    onAssigned?.();
  };

  const handleRemove = () => {
    if (unassignQRFromTable(liveTable.id)) toast.success("QR code unassigned successfully.");
    onAssigned?.();
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title={currentQR ? "Change QR Template" : "Assign QR Template"} size="md">
        {currentQR && (
          <div className="mb-5 p-3 bg-primary-light/20 rounded-lg flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-secondary">Currently assigned to {liveTable.tableId}:</p>
              <p className="font-medium text-theme">
                {defaultQRLayouts.find(l => l.id === currentQR.layout)?.name || currentQR.layout}
              </p>
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
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-theme">Select a Template</p>
              <button
                onClick={() => setShowDesigner(true)}
                className="text-xs font-semibold bg-primary-light text-primary px-2.5 py-1.5 rounded hover:bg-[var(--color-primary)] hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Palette size={14} /> Request Custom Design
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {defaultQRLayouts.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`border-2 rounded-lg p-2 text-left transition-all ${
                    selectedLayout === layout.id ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" : "border-theme hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <img src={layout.image} alt={layout.name} className="w-full aspect-square object-cover rounded mb-2 bg-white" />
                  <p className="text-xs font-medium text-theme text-center leading-tight">{layout.name}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleAssign}>Assign Template</Button>
          </div>
        </div>
      </Modal>

      <ContactDesignerModal isOpen={showDesigner} onClose={() => setShowDesigner(false)} />
    </>
  );
}
