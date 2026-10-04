import { useState, useEffect } from "react";
import { Unlink, Palette, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
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

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const liveTable = tables.find((t) => t.id === table.id) || table;
  const currentQR = qrCodes.find((qr) => qr.id === liveTable.qrCodeId);
  const activeTemplates = qrTemplates.filter((t) => t.status === "active");

  useEffect(() => {
    fetchQRTemplates();
  }, [fetchQRTemplates]);

  // Auto-select first active template when they load
  useEffect(() => {
    if (activeTemplates.length > 0 && selectedTemplateId === null) {
      setSelectedTemplateId(activeTemplates[0].id);
    }
  }, [activeTemplates.length]);

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      const qrs = await generateQRCodes(1, selectedTemplateId || null);
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
          {activeTemplates.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-theme rounded-xl">
              <QrCode size={32} className="mx-auto text-secondary mb-2" />
              <p className="text-sm font-medium text-theme">No templates available</p>
              <p className="text-xs text-secondary mt-1">
                Ask your super admin to add QR templates, or click <strong>Assign</strong> below to generate a plain QR.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-0.5">
              {/* Plain QR tile */}
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className={`border-2 rounded-xl p-2 transition-all text-center ${
                  selectedTemplateId === null
                    ? "border-primary bg-primary-light/30"
                    : "border-theme hover:border-primary/40"
                }`}
              >
                <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-1.5">
                  <QrCode size={32} className="text-gray-400" />
                </div>
                <p className="text-[11px] font-medium text-theme leading-tight">Plain QR</p>
              </button>

              {/* Template tiles */}
              {activeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`border-2 rounded-xl p-2 transition-all text-center ${
                    selectedTemplateId === tpl.id
                      ? "border-primary bg-primary-light/30"
                      : "border-theme hover:border-primary/40"
                  }`}
                >
                  <img
                    src={getImageUrl(tpl.imagePath)}
                    alt={tpl.name}
                    className="w-full aspect-square object-cover rounded-lg mb-1.5 bg-gray-50"
                  />
                  <p className="text-[11px] font-medium text-theme leading-tight truncate">{tpl.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Selected label */}
          {activeTemplates.length > 0 && (
            <p className="text-xs text-secondary">
              Selected:{" "}
              <span className="font-medium text-theme">
                {selectedTemplateId
                  ? activeTemplates.find((t) => t.id === selectedTemplateId)?.name || "Unknown"
                  : "Plain QR (no template)"}
              </span>
            </p>
          )}

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

      <ContactDesignerModal isOpen={showDesigner} onClose={() => setShowDesigner(false)} />
    </>
  );
}
