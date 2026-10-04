import { useState, useEffect } from "react";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function TableForm({ isOpen, onClose, editTable }) {
  const { tables, qrCodes, qrTemplates, fetchQRTemplates, addTable, updateTable, generateQRCodes } = useTablesQRStore();
  
  // selectedTemplateId will be:
  // null (Keep current or Skip)
  // 'plain' (Generate a plain QR)
  // <template_id> (Generate from specific template)
  const [form, setForm] = useState({ tableId: "", status: "active", selectedTemplateId: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchQRTemplates();
  }, [isOpen, fetchQRTemplates]);

  useEffect(() => {
    setForm(
      editTable
        ? { tableId: editTable.tableId, status: editTable.status, selectedTemplateId: null }
        : { tableId: "", status: "active", selectedTemplateId: null }
    );
    setErrors({});
  }, [editTable, isOpen]);

  const liveEditTable = editTable ? tables.find((t) => t.id === editTable.id) || editTable : null;
  const currentQR = liveEditTable ? qrCodes.find((qr) => qr.id === liveEditTable.qrCodeId || qr._id === liveEditTable.qrCodeId) : null;
  const currentTemplate = currentQR ? qrTemplates.find(t => t.id === currentQR.templateId || t._id === currentQR.templateId) : null;
  
  const activeTemplates = qrTemplates.filter((t) => t.status === "active");

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

  const handleSubmit = async () => {
    if (!validate()) return;
    const tableNo = form.tableId.trim();
    setIsSubmitting(true);

    try {
      let finalQrCodeId = undefined; // undefined means backend will keep it as is (for edit) or null (for create)

      // If they explicitly selected a template OR 'plain' to generate a new one
      if (form.selectedTemplateId !== null) {
        const templateIdParam = form.selectedTemplateId === 'plain' ? null : form.selectedTemplateId;
        const qrs = await generateQRCodes(1, templateIdParam);
        if (qrs && qrs.length > 0) {
          finalQrCodeId = qrs[0].id;
        }
      }

      if (editTable) {
        await updateTable(editTable.id, { tableId: tableNo, status: form.status, qrCodeId: finalQrCodeId });
        toast.success("Table updated successfully.");
      } else {
        await addTable({ tableId: tableNo, status: form.status, qrCodeId: finalQrCodeId });
        toast.success("Table added successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save table");
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-sm font-medium text-theme mb-2">
              {currentQR ? "Change QR Template" : "Generate & Assign QR (Optional)"}
            </p>
            
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {/* Keep/Skip option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, selectedTemplateId: null })}
                className={`border-2 rounded-lg p-2 text-center transition-all ${
                  form.selectedTemplateId === null 
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" 
                    : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                <div className="w-full aspect-square bg-surface border border-theme border-dashed rounded mb-1 flex items-center justify-center text-[10px] text-secondary">
                  {currentQR ? "Keep Current" : "Skip for now"}
                </div>
                <p className="text-[10px] font-medium text-theme leading-tight">None</p>
              </button>

              {/* Plain QR option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, selectedTemplateId: 'plain' })}
                className={`border-2 rounded-lg p-2 text-center transition-all ${
                  form.selectedTemplateId === 'plain' 
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" 
                    : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                <div className="w-full aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center">
                  <QrCode size={24} className="text-gray-400" />
                </div>
                <p className="text-[10px] font-medium text-theme leading-tight">Plain QR</p>
              </button>

              {/* API Templates */}
              {activeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setForm({ ...form, selectedTemplateId: tpl.id })}
                  className={`border-2 rounded-lg p-2 text-center transition-all ${
                    form.selectedTemplateId === tpl.id 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20" 
                      : "border-theme hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <img src={getImageUrl(tpl.imagePath)} alt={tpl.name} className="w-full aspect-square object-cover rounded mb-1 bg-white" />
                  <p className="text-[10px] font-medium text-theme leading-tight truncate" title={tpl.name}>{tpl.name}</p>
                </button>
              ))}
            </div>

            {currentQR && (
              <p className="text-xs text-secondary mt-3 p-2 bg-primary-light/20 rounded-md">
                Currently assigned: <strong className="text-theme">{currentTemplate ? currentTemplate.name : (currentQR.type === 'standard' || !currentQR.templateId ? 'Plain QR' : currentQR.name)}</strong>
              </p>
            )}
          </div>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} loading={isSubmitting}>
            {editTable ? "Save Changes" : "Add Table"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
