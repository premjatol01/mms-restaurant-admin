import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { defaultQRLayouts } from "../data/tablesQRData";

export default function TableForm({ isOpen, onClose, editTable }) {
  const { tables, qrCodes, addTable, updateTable, assignQRToTable, addQRCode } = useTablesQRStore();
  const [form, setForm] = useState({ tableId: "", status: "active", qrCodeId: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // qrCodeId "" means: add -> skip for now, edit -> keep the current QR
    setForm(
      editTable
        ? { tableId: editTable.tableId, status: editTable.status, qrCodeId: "" }
        : { tableId: "", status: "active", qrCodeId: "" }
    );
    setErrors({});
  }, [editTable, isOpen]);

  const liveEditTable = editTable ? tables.find((t) => t.id === editTable.id) || editTable : null;
  const currentQR = liveEditTable ? qrCodes.find((qr) => qr.id === liveEditTable.qrCodeId) : null;

  const validate = () => {
    const errs = {};
    const tableNo = form.tableId.trim();
    if (!tableNo) errs.tableId = "Table No. is required";
    else if (tables.some((t) => t.tableId.trim().toLowerCase() === tableNo.toLowerCase() && t.id !== editTable?.id)) {
      errs.tableId = "Table No. already exists";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const tableNo = form.tableId.trim();

    // If they picked a template, generate a new QR entity for it
    let finalQrCodeId = form.qrCodeId;
    if (finalQrCodeId && finalQrCodeId.startsWith("tpl-")) {
      const newQR = addQRCode({
        name: `QR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        type: "template",
        layout: finalQrCodeId,
      });
      finalQrCodeId = newQR.id;
    }

    if (editTable) {
      updateTable(editTable.id, { tableId: tableNo, status: form.status });
      if (finalQrCodeId && !assignQRToTable(editTable.id, finalQrCodeId)) {
        toast.error("Table updated, but could not assign the QR template.");
        return onClose();
      }
      toast.success("Table updated successfully.");
    } else {
      const { qrAssigned } = addTable({ tableId: tableNo, status: form.status, qrCodeId: finalQrCodeId });
      if (finalQrCodeId && !qrAssigned) {
        toast.error("Table added, but could not assign the QR template.");
        return onClose();
      }
      toast.success("Table added successfully.");
    }
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editTable ? "Edit Table" : "Add Table"} size="sm">
      <div className="space-y-6">
        <FormSection title="Table Details">
          <div className="space-y-4">
            <Input
              label="Table No."
              required
              placeholder="e.g., Table 12"
              value={form.tableId}
              onChange={(e) => setForm({ ...form, tableId: e.target.value })}
              error={errors.tableId}
            />
            <div>
              <label className="text-sm font-medium text-theme block mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" checked={form.status === "active"} onChange={() => setForm({ ...form, status: "active" })} className="w-4 h-4" style={{ accentColor: "var(--color-primary)" }} />
                  <span className="text-sm text-theme">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" checked={form.status === "inactive"} onChange={() => setForm({ ...form, status: "inactive" })} className="w-4 h-4" style={{ accentColor: "var(--color-primary)" }} />
                  <span className="text-sm text-theme">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="QR Assignment">
          <div className="mb-3">
            <p className="text-sm font-medium text-theme mb-2">{currentQR ? "Change QR Template" : "Assign QR Template (Optional)"}</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, qrCodeId: "" })}
                className={`border-2 rounded-lg p-2 text-center transition-all ${
                  form.qrCodeId === "" ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                <div className="w-full aspect-square bg-surface border border-theme border-dashed rounded mb-1 flex items-center justify-center text-xs text-secondary">None</div>
                <p className="text-[10px] font-medium text-theme">Keep / Skip</p>
              </button>
              {defaultQRLayouts.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setForm({ ...form, qrCodeId: layout.id })}
                  className={`border-2 rounded-lg p-2 text-center transition-all ${
                    form.qrCodeId === layout.id ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" : "border-theme hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <img src={layout.image} alt={layout.name} className="w-full aspect-square object-cover rounded mb-1 bg-white" />
                  <p className="text-[10px] font-medium text-theme leading-tight">{layout.name}</p>
                </button>
              ))}
            </div>
            {currentQR && <p className="text-xs text-secondary mt-2">Currently assigned: {defaultQRLayouts.find(l => l.id === currentQR.layout)?.name || currentQR.layout}</p>}
          </div>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>{editTable ? "Save Changes" : "Add Table"}</Button>
        </div>
      </div>
    </Drawer>
  );
}
