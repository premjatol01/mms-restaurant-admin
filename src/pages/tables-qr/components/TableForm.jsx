import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { getFreeQRCodes, formatQROption } from "../utils/qrRules";

export default function TableForm({ isOpen, onClose, editTable }) {
  const { tables, qrCodes, addTable, updateTable, assignQRToTable } = useTablesQRStore();
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

  // Only free QR codes can be picked
  const freeQRCodes = getFreeQRCodes(qrCodes, tables);
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

    if (editTable) {
      updateTable(editTable.id, { tableId: tableNo, status: form.status });
      if (form.qrCodeId && !assignQRToTable(editTable.id, form.qrCodeId)) {
        toast.error("Table updated, but the selected QR code is no longer available.");
        return onClose();
      }
      toast.success("Table updated successfully.");
    } else {
      // New tables only ever ADD a mapping - existing tables/QRs are never touched.
      const { qrAssigned } = addTable({ tableId: tableNo, status: form.status, qrCodeId: form.qrCodeId });
      if (form.qrCodeId && !qrAssigned) {
        toast.error("Table added, but the selected QR code is no longer available.");
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
          <Select
            label={currentQR ? "Change QR Code" : "Assign QR Code"}
            value={form.qrCodeId}
            onChange={(val) => setForm({ ...form, qrCodeId: val })}
            options={[
              { value: "", label: currentQR ? `Keep current (${currentQR.name})` : "Skip for now" },
              ...freeQRCodes.map((qr) => ({ value: qr.id, label: formatQROption(qr) })),
            ]}
          />
          <p className="text-xs text-secondary mt-2">Only QR codes that are not assigned to another table are listed.</p>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>{editTable ? "Save Changes" : "Add Table"}</Button>
        </div>
      </div>
    </Drawer>
  );
}
