import { useState } from "react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";

const QR_TYPES = [
  { id: "default", name: "Default", description: "Basic QR design", included: true },
  { id: "premium", name: "Premium", description: "Premium QR designs", included: true },
  { id: "paid", name: "Paid", description: "Additional QR codes", price: 99 },
];

const QR_LAYOUTS = [
  { id: "classic", name: "Classic", description: "Traditional QR design" },
  { id: "modern", name: "Modern", description: "Sleek contemporary design" },
  { id: "elegant", name: "Elegant", description: "Premium minimal design" },
];

export default function GenerateQRDrawer({ isOpen, onClose }) {
  const { addQRCode, tables, qrCodes, subscription } = useTablesQRStore();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedTable, setSelectedTable] = useState("");
  const [skipAssign, setSkipAssign] = useState(true);

  const availableTables = tables.filter((t) => t.status === "active" && !t.qrCodeId);
  const canUsePremium = subscription.premiumQR.available > 0;

  const handleGenerate = () => {
    const qrCount = qrCodes.length + 1;
    const qr = {
      name: `QR-${String(qrCount).padStart(3, "0")}`,
      type: selectedType.id,
      layout: selectedLayout.id,
      tableId: skipAssign ? null : selectedTable || null,
    };
    addQRCode(qr);
    toast.success("QR code generated successfully.");
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedLayout(null);
    setSelectedTable("");
    setSkipAssign(true);
    onClose();
  };

  const isTypeDisabled = (type) => type.id === "premium" && !canUsePremium;

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Generate QR Code" size="md">
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded ${s <= step ? "bg-primary" : "bg-gray-200"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-theme">Select QR Type</h3>
            <div className="grid gap-3">
              {QR_TYPES.map((type) => (
                <button
                  key={type.id}
                  disabled={isTypeDisabled(type)}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 border rounded-lg text-left transition-colors ${isTypeDisabled(type) ? "opacity-50 cursor-not-allowed" : ""} ${selectedType?.id === type.id ? "border-primary bg-primary-light/20" : "border-theme hover:border-primary"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-theme">{type.name}</p>
                      <p className="text-sm text-secondary">{type.description}</p>
                    </div>
                    {type.included ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Included</span>
                    ) : (
                      <span className="text-sm font-medium text-theme">₹{type.price}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedType && (
              <Button className="w-full" onClick={() => setStep(2)}>Continue</Button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium text-theme">Select Layout</h3>
            <div className="grid grid-cols-3 gap-3">
              {QR_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout)}
                  className={`p-4 border rounded-lg text-center transition-colors ${selectedLayout?.id === layout.id ? "border-primary bg-primary-light/20" : "border-theme hover:border-primary"}`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded mx-auto mb-2 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-300 rounded" />
                  </div>
                  <p className="font-medium text-theme text-sm">{layout.name}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" disabled={!selectedLayout} onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium text-theme">Assign to Table (Optional)</h3>
            <p className="text-sm text-secondary">You can skip this and assign later.</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!skipAssign} onChange={() => setSkipAssign(false)} className="w-4 h-4 text-primary" />
                <span className="text-sm text-theme">Assign to table</span>
              </label>
              {!skipAssign && (
                <Select
                  value={selectedTable}
                  onChange={setSelectedTable}
                  options={[
                    { value: "", label: "Select a table" },
                    ...availableTables.map((t) => ({ value: t.id, label: t.tableId }))
                  ]}
                />
              )}
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={skipAssign} onChange={() => setSkipAssign(true)} className="w-4 h-4 text-primary" />
                <span className="text-sm text-theme">Generate without assigning</span>
              </label>
            </div>

            {/* Summary */}
            <div className="bg-primary-light/20 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-theme">Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Type:</span>
                <span className="text-theme">{selectedType?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Layout:</span>
                <span className="text-theme">{selectedLayout?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Table:</span>
                <span className="text-theme">{skipAssign ? "Not assigned" : availableTables.find((t) => t.id === selectedTable)?.tableId || "—"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" onClick={handleGenerate}>Generate QR</Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}