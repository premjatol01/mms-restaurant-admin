import { useState, useEffect } from "react";
import { Unlink, Palette, QrCode, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import { useSubscriptionPlan } from "../../../hooks/useSubscriptionPlan";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import ContactDesignerModal from "../../menu/modals/ContactDesignerModal";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function AssignQRDialog({ table, onClose, onAssigned }) {
  const {
    tables, qrCodes,
    qrTemplates, fetchQRTemplates,
    assignQRToTable, unassignQRFromTable, generateQRCodes
  } = useTablesQRStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState("plain");
  const [showDesigner, setShowDesigner] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { hasFeature } = useSubscriptionPlan();
  const canUseDesignerQR = hasFeature("designer_qr");

  const liveTable = tables.find((t) => t.id === table.id) || table;
  const currentQR = typeof liveTable.qrCodeId === "object" && liveTable.qrCodeId !== null
    ? liveTable.qrCodeId
    : qrCodes.find((qr) => qr.id === liveTable.qrCodeId || qr._id === liveTable.qrCodeId);
  const activeTemplates = qrTemplates.filter((t) => t.status === "active");

  useEffect(() => {
    fetchQRTemplates();
  }, [fetchQRTemplates]);

  // If table already has a template, initialize with that template, otherwise "plain"
  useEffect(() => {
    if (currentQR?.templateId) {
      const tId = typeof currentQR.templateId === "object" ? currentQR.templateId._id || currentQR.templateId.id : currentQR.templateId;
      if (tId) setSelectedTemplateId(String(tId));
    }
  }, [currentQR]);

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      const tplParam = selectedTemplateId === "plain" ? null : selectedTemplateId;
      const qrs = await generateQRCodes(1, tplParam);
      if (qrs && qrs.length > 0) {
        await assignQRToTable(liveTable.id, qrs[0].id);
        toast.success("QR code assigned successfully.");
        onAssigned?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign QR code.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await unassignQRFromTable(liveTable.id);
      toast.success("QR code unassigned successfully.");
      onAssigned?.();
    } catch (err) {
      toast.error("Failed to unassign QR code.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={currentQR ? "Change QR Template" : "Assign QR to Table"}
        size="md"
      >
        {/* Current assignment banner */}
        {currentQR && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {currentQR.imageUrl ? (
                <img
                  src={getImageUrl(currentQR.imageUrl)}
                  alt="Current QR"
                  className="w-10 h-10 rounded object-cover border border-theme flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded border border-theme flex items-center justify-center bg-white flex-shrink-0">
                  <QrCode size={20} className="text-secondary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-amber-700 font-medium">Currently assigned</p>
                <p className="text-sm text-theme font-semibold truncate">{currentQR.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving || isAssigning}
              className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
            >
              <Unlink size={13} />
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-theme">Select a Template</p>
            <button
              onClick={() => setShowDesigner(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-light px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
            >
              <Palette size={13} /> Request Custom Design
            </button>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-0.5">
            {/* Plain QR tile */}
            <button
              type="button"
              onClick={() => setSelectedTemplateId("plain")}
              className={`border-2 rounded-xl p-2 transition-all text-center cursor-pointer ${
                selectedTemplateId === "plain" || !selectedTemplateId
                  ? "border-primary bg-primary-light/30 ring-2 ring-primary/20"
                  : "border-theme hover:border-primary/40"
              }`}
            >
              <div className="w-full aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-1.5">
                <QrCode size={32} className="text-secondary" />
              </div>
              <p className="text-[11px] font-medium text-theme leading-tight">Plain QR</p>
            </button>

            {/* Template tiles */}
            {activeTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  if (!canUseDesignerQR) {
                    toast.error("Branded Designer QR Standees are available in the Pro Growth and Enterprise plans. Please upgrade to unlock.");
                    return;
                  }
                  setSelectedTemplateId(tpl.id);
                }}
                className={`relative border-2 rounded-xl p-2 transition-all text-center cursor-pointer ${
                  selectedTemplateId === tpl.id
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary/20"
                    : !canUseDesignerQR
                    ? "border-theme opacity-70 hover:opacity-90 hover:border-amber-500/50"
                    : "border-theme hover:border-primary/40"
                }`}
                title={!canUseDesignerQR ? "Requires Pro Growth Plan" : tpl.name}
              >
                {!canUseDesignerQR && (
                  <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-500 text-white shadow-xs z-10" title="Locked - Pro Growth Plan">
                    <Lock size={10} />
                  </span>
                )}
                <img
                  src={getImageUrl(tpl.imagePath)}
                  alt={tpl.name}
                  className="w-full aspect-square object-cover rounded-lg mb-1.5 bg-gray-50"
                />
                <p className="text-[11px] font-medium text-theme leading-tight truncate">{tpl.name}</p>
              </button>
            ))}
          </div>

          {activeTemplates.length === 0 && (
            <p className="text-xs text-secondary mt-1">
              No custom templates available. Assigning will generate a high-res standalone Plain QR.
            </p>
          )}

          {/* Selected label */}
          <p className="text-xs text-secondary">
            Selected:{" "}
            <span className="font-medium text-theme">
              {selectedTemplateId && selectedTemplateId !== "plain"
                ? activeTemplates.find((t) => t.id === selectedTemplateId)?.name || "Template"
                : "Plain QR (no template)"}
            </span>
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-theme">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isAssigning || isRemoving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAssign}
              loading={isAssigning}
            >
              {currentQR ? "Replace QR" : "Assign QR"}
            </Button>
          </div>
        </div>
      </Modal>

      <ContactDesignerModal 
        isOpen={showDesigner} 
        onClose={() => setShowDesigner(false)} 
        initialRequestType="QR Template Design"
      />
    </>
  );
}
