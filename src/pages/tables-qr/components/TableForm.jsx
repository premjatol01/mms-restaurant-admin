import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { QrCode, Check } from "lucide-react";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import FormSection from "../../../components/ui/FormSection";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function TableForm({ isOpen, onClose, editTable }) {
  const { tables, qrCodes, qrTemplates, fetchQRTemplates, addTable, updateTable, generateQRCodes } = useTablesQRStore();

  const [form, setForm] = useState({ tableId: "", status: "active", selectedTemplateId: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchQRTemplates();
  }, [isOpen, fetchQRTemplates]);

  const liveEditTable = editTable
    ? tables.find((t) => String(t.id || t._id) === String(editTable.id || editTable._id)) || editTable
    : null;

  // Resolve assigned QR object
  const currentQR = useMemo(() => {
    if (!liveEditTable || !liveEditTable.qrCodeId) return null;
    const qrRef = liveEditTable.qrCodeId;
    if (typeof qrRef === "object" && qrRef !== null) {
      const refId = String(qrRef.id || qrRef._id || "");
      const fromStore = qrCodes.find((q) => String(q.id || q._id) === refId);
      return fromStore || qrRef;
    }
    const qrIdStr = String(qrRef);
    return qrCodes.find((q) => String(q.id || q._id) === qrIdStr) || null;
  }, [liveEditTable, qrCodes]);

  // Determine current template ID ('plain', '<templateId>', or null if unassigned)
  const initialTemplateId = useMemo(() => {
    if (!currentQR) return null;
    const rawTpl = currentQR.templateId;
    if (!rawTpl || currentQR.type === "standard") return "plain";
    if (typeof rawTpl === "object" && rawTpl !== null) {
      return String(rawTpl.id || rawTpl._id || "plain");
    }
    return String(rawTpl);
  }, [currentQR]);

  // Find populated current template for display
  const currentTemplate = useMemo(() => {
    if (!currentQR || !currentQR.templateId || currentQR.type === "standard") return null;
    const tId = typeof currentQR.templateId === "object"
      ? String(currentQR.templateId.id || currentQR.templateId._id || "")
      : String(currentQR.templateId);
    return (
      qrTemplates.find((t) => String(t.id || t._id) === tId) ||
      (typeof currentQR.templateId === "object" ? currentQR.templateId : null)
    );
  }, [currentQR, qrTemplates]);

  const activeTemplates = useMemo(() => {
    return qrTemplates.filter((t) => {
      if (t.status === "active") return true;
      const tId = String(t.id || t._id);
      return initialTemplateId && tId === String(initialTemplateId);
    });
  }, [qrTemplates, initialTemplateId]);

  // Initialize form when drawer opens or editing table changes
  useEffect(() => {
    if (!isOpen) return;
    if (editTable) {
      const rawNum = liveEditTable?.tableNo || liveEditTable?.tableId || editTable.tableNo || editTable.tableId || "";
      const cleanNum = String(rawNum).replace(/^table\s*/i, "").trim();
      setForm({
        tableId: cleanNum,
        status: liveEditTable?.status || editTable.status || "active",
        selectedTemplateId: initialTemplateId,
      });
    } else {
      setForm({
        tableId: "",
        status: "active",
        selectedTemplateId: null,
      });
    }
    setErrors({});
  }, [isOpen, editTable?.id, initialTemplateId]);

  const validate = () => {
    const errs = {};
    const tableNo = form.tableId.replace(/^table\s*/i, "").trim();
    if (!tableNo) errs.tableId = "Table Number is required";
    else if (
      tables.some(
        (t) =>
          (t.tableNo || t.tableId || "").replace(/^table\s*/i, "").trim().toLowerCase() === tableNo.toLowerCase() &&
          String(t.id || t._id) !== String(editTable?.id || editTable?._id)
      )
    ) {
      errs.tableId = "Table number already exists";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const tableNo = form.tableId.replace(/^table\s*/i, "").trim();
    setIsSubmitting(true);

    try {
      if (editTable) {
        const hasTemplateChanged = String(form.selectedTemplateId ?? "") !== String(initialTemplateId ?? "");

        if (hasTemplateChanged) {
          if (form.selectedTemplateId === null) {
            // Remove / unassign QR code
            await updateTable(editTable.id, {
              tableNo,
              tableId: editTable.tableId,
              status: form.status,
              qrCodeId: null,
              templateId: null,
            });
          } else {
            // Update to selected template or 'plain'
            const tplParam = form.selectedTemplateId === "plain" ? null : form.selectedTemplateId;
            await updateTable(editTable.id, {
              tableNo,
              tableId: editTable.tableId,
              status: form.status,
              templateId: tplParam,
            });
          }
        } else {
          // Template untouched — update table details only
          await updateTable(editTable.id, {
            tableNo,
            tableId: editTable.tableId,
            status: form.status,
          });
        }
        toast.success("Table updated successfully.");
      } else {
        // Add new table
        let finalQrCodeId = undefined;
        if (form.selectedTemplateId !== null) {
          const tplParam = form.selectedTemplateId === "plain" ? null : form.selectedTemplateId;
          const qrs = await generateQRCodes(1, tplParam);
          if (qrs && qrs.length > 0) {
            finalQrCodeId = qrs[0].id;
          }
        }
        await addTable({ tableNo, status: form.status, qrCodeId: finalQrCodeId });
        toast.success("Table added successfully.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStr = form.selectedTemplateId
    ? String(form.selectedTemplateId.id || form.selectedTemplateId._id || form.selectedTemplateId)
    : null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editTable ? "Edit Table" : "Add Table"} size="sm">
      <div className="space-y-6">
        <FormSection title="Table Details">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-theme block">Table Number <span className="text-red-500">*</span></label>
              <div className="relative flex rounded-xl border border-theme bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <span className="inline-flex items-center px-3.5 bg-primary-light/30 border-r border-theme text-sm font-bold text-primary select-none">
                  Table
                </span>
                <input
                  type="text"
                  placeholder="e.g. 1, 2, 12..."
                  value={form.tableId}
                  onChange={(e) => setForm({ ...form, tableId: e.target.value.replace(/^table\s*/i, "") })}
                  className="flex-1 px-3.5 py-2.5 bg-transparent text-sm text-theme outline-none font-medium placeholder:text-secondary/50"
                />
              </div>
              {errors.tableId && <p className="text-xs text-red-500 mt-1">{errors.tableId}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-theme block mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === "active"}
                    onChange={() => setForm({ ...form, status: "active" })}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span className="text-sm text-theme">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === "inactive"}
                    onChange={() => setForm({ ...form, status: "inactive" })}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span className="text-sm text-theme">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="QR Assignment">
          <div className="mb-3">
            <p className="text-sm font-medium text-theme mb-2">
              {editTable ? "QR Template" : "Generate & Assign QR (Optional)"}
            </p>

            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {/* None / No QR option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, selectedTemplateId: null })}
                className={`relative border-2 rounded-lg p-2 text-center transition-all cursor-pointer ${
                  form.selectedTemplateId === null
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 ring-2 ring-[var(--color-primary)]/20 shadow-sm"
                    : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                {form.selectedTemplateId === null && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold shadow-sm z-10 pointer-events-none">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <div className="w-full aspect-square bg-surface border border-theme border-dashed rounded mb-1 flex items-center justify-center text-[11px] text-secondary font-medium">
                  {editTable ? (currentQR ? "Remove QR" : "None") : "Skip"}
                </div>
                <p className="text-[10px] font-medium text-theme leading-tight">None</p>
              </button>

              {/* Plain QR option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, selectedTemplateId: "plain" })}
                className={`relative border-2 rounded-lg p-2 text-center transition-all cursor-pointer ${
                  form.selectedTemplateId === "plain"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 ring-2 ring-[var(--color-primary)]/20 shadow-sm"
                    : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                {form.selectedTemplateId === "plain" && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold shadow-sm z-10 pointer-events-none">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded mb-1 flex items-center justify-center border border-theme/30">
                  <QrCode size={24} className="text-secondary" />
                </div>
                <p className="text-[10px] font-medium text-theme leading-tight">Plain QR</p>
              </button>

              {/* API Templates */}
              {activeTemplates.map((tpl) => {
                const tplIdStr = String(tpl.id || tpl._id);
                const isSelected = selectedStr === tplIdStr;
                return (
                  <button
                    key={tpl.id || tpl._id}
                    type="button"
                    onClick={() => setForm({ ...form, selectedTemplateId: tpl.id || tpl._id })}
                    className={`relative border-2 rounded-lg p-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 ring-2 ring-[var(--color-primary)]/20 shadow-sm"
                        : "border-theme hover:border-[var(--color-primary)]/50"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold shadow-sm z-10 pointer-events-none">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <img
                      src={getImageUrl(tpl.imagePath)}
                      alt={tpl.name}
                      className="w-full aspect-square object-cover rounded mb-1 bg-white border border-gray-100"
                    />
                    <p className="text-[10px] font-medium text-theme leading-tight truncate" title={tpl.name}>
                      {tpl.name}
                    </p>
                  </button>
                );
              })}
            </div>

            {editTable && (
              <div className="mt-3 p-2.5 bg-surface border border-theme rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Assigned QR:</span>
                  <span className="font-semibold text-theme">
                    {currentTemplate
                      ? currentTemplate.name
                      : (!currentQR || !currentQR.templateId || currentQR.type === "standard"
                        ? (currentQR ? "Plain QR" : "None")
                        : currentQR.name || "Assigned")}
                  </span>
                </div>
                {form.selectedTemplateId !== initialTemplateId && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-theme/40 text-[var(--color-primary)]">
                    <span className="font-medium">Change to:</span>
                    <span className="font-semibold">
                      {form.selectedTemplateId === null
                        ? "Remove QR (None)"
                        : form.selectedTemplateId === "plain"
                        ? "Plain QR"
                        : (qrTemplates.find((t) => String(t.id || t._id) === String(form.selectedTemplateId))?.name || "Selected Template")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </FormSection>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} loading={isSubmitting}>
            {editTable ? "Save Changes" : "Add Table"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
