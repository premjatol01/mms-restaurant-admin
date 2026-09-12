import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";

export default function TableForm({ isOpen, onClose, editTable }) {
  const { tables, qrCodes, addTable, updateTable } = useTablesQRStore();
  const [form, setForm] = useState({ tableId: "", status: "active", qrCodeId: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTable) {
      setForm({ tableId: editTable.tableId, status: editTable.status, qrCodeId: editTable.qrCodeId || "" });
    } else {
      setForm({ tableId: "", status: "active", qrCodeId: "" });
    }
    setErrors({});
  }, [editTable, isOpen]);

  const availableQRCodes = qrCodes.filter((qr) => qr.status === "available" || qr.id === editTable?.qrCodeId);

  const validate = () => {
    const errs = {};
    if (!form.tableId.trim()) errs.tableId = "Table ID is required";
    if (tables.some((t) => t.tableId.toLowerCase() === form.tableId.toLowerCase() && t.id !== editTable?.id)) {
      errs.tableId = "Table ID already exists";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { ...form, qrCodeId: form.qrCodeId || null };
    if (editTable) {
      updateTable(editTable.id, data);
      if (form.qrCodeId && form.qrCodeId !== editTable.qrCodeId) {
        useTablesQRStore.getState().assignQRToTable(editTable.id, form.qrCodeId);
      }
      toast.success("Table updated successfully.");
    } else {
      addTable(data);
      if (form.qrCodeId) {
        const newTable = tables[tables.length];
        useTablesQRStore.getState().assignQRToTable(newTable?.id, form.qrCodeId);
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
              label="Table ID"
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
                  <input type="radio" name="status" checked={form.status === "active"} onChange={() => setForm({ ...form, status: "active" })} className="w-4 h-4 text-primary" />
                  <span className="text-sm text-theme">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" checked={form.status === "inactive"} onChange={() => setForm({ ...form, status: "inactive" })} className="w-4 h-4 text-primary" />
                  <span className="text-sm text-theme">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="QR Assignment">
          <Select
            label="Assign QR Code"
            value={form.qrCodeId}
            onChange={(val) => setForm({ ...form, qrCodeId: val })}
            options={[
              { value: "", label: "Skip for now" },
              ...availableQRCodes.map((qr) => ({ value: qr.id, label: `${qr.name} (${qr.type}) - ${qr.layout}` }))
            ]}
          />
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>{editTable ? "Save Changes" : "Add Table"}</Button>
        </div>
      </div>
    </Drawer>
  );
}