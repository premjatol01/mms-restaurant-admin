import React, { useState, useEffect, useMemo } from "react";
import { QrCode, Check, Loader2, Sparkles, AlertCircle, Layers } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import { useProfileStore } from "../../../store/profileStore";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function BulkImportTablesModal({ isOpen, onClose }) {
  const { tables, qrTemplates, fetchQRTemplates, createBulkTables, maxTables: storeMaxTables, planName: storePlanName } = useTablesQRStore();
  const profile = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  const [count, setCount] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("plain");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQRTemplates();
      if (!profile) fetchProfile();
    }
  }, [isOpen, fetchQRTemplates, profile, fetchProfile]);

  const maxTables = storeMaxTables || profile?.subscription?.maxTables || profile?.subscription?.package?.maxTables || 50;
  const planName = storePlanName || profile?.subscription?.packageName || "Standard";
  const currentCount = tables.length;
  const remainingAllowed = Math.max(0, maxTables - currentCount);

  // Determine starting number
  const nextNumber = useMemo(() => {
    const maxNum = tables.reduce((acc, t) => {
      const n = parseInt(String(t.tableNo || t.tableId || "").replace(/\D/g, ""), 10);
      return !isNaN(n) ? Math.max(acc, n) : acc;
    }, 0);
    return maxNum + 1;
  }, [tables]);

  const parsedCount = parseInt(count, 10);
  const isValidCount = !isNaN(parsedCount) && parsedCount >= 1 && parsedCount <= remainingAllowed;

  const activeTemplates = useMemo(() => {
    return qrTemplates.filter((t) => t.status === "active");
  }, [qrTemplates]);

  const handleCreate = async () => {
    if (!isValidCount) {
      if (parsedCount > remainingAllowed) {
        toast.error(`You can only add up to ${remainingAllowed} remaining tables.`);
      } else {
        toast.error("Please enter a valid number of tables to add.");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBulkTables({
        count: parsedCount,
        templateId: selectedTemplateId === "plain" ? null : selectedTemplateId,
      });

      if (res.success) {
        toast.success(`Successfully added ${parsedCount} ${parsedCount === 1 ? "table" : "tables"} with QR codes!`);
        setCount("");
        onClose();
      } else {
        toast.error(res.message || "Failed to create bulk tables.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to add tables.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Bulk Tables" size="lg">
      <div className="space-y-6">
        {/* Capacity / Subscription Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary-light/15 border border-primary/20">
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
              {planName} Plan · Table Capacity & Allocation
            </p>
            <p className="text-sm font-bold text-theme mt-0.5">
              {currentCount} Active Tables · {remainingAllowed} Remaining Allowed (Limit: {maxTables})
            </p>
          </div>
          {remainingAllowed > 0 && (
            <button
              type="button"
              onClick={() => setCount(String(remainingAllowed))}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer bg-surface px-3 py-1.5 rounded-lg border border-theme shadow-2xs shrink-0"
            >
              Fill Remaining ({remainingAllowed})
            </button>
          )}
        </div>

        {/* Number of Tables input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-theme">
            Enter Number of Tables to Add <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={remainingAllowed}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder={`Enter count (1 to ${remainingAllowed || 1})`}
              className="w-full px-4 py-2.5 rounded-xl border border-theme bg-surface text-theme text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {isValidCount && (
            <p className="text-xs text-secondary mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Will generate: <strong className="text-theme">Table {nextNumber}</strong> to <strong className="text-theme">Table {nextNumber + parsedCount - 1}</strong>
            </p>
          )}

          {remainingAllowed === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <AlertCircle size={13} />
              You have reached your maximum table limit of {maxTables}. Please upgrade your plan to add more.
            </p>
          )}
        </div>

        {/* QR Template Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-theme">
              Select QR Template for New Tables
            </label>
            <span className="text-xs text-secondary">
              QR codes will be automatically generated & linked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
            {/* Plain Standard QR Option */}
            <div
              onClick={() => setSelectedTemplateId("plain")}
              className={`relative rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                selectedTemplateId === "plain"
                  ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                  : "border-theme bg-surface hover:border-primary/40"
              }`}
            >
              {selectedTemplateId === "plain" && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
              <div className="w-12 h-12 rounded-lg bg-surface border border-theme/60 flex items-center justify-center mb-2 shadow-2xs">
                <QrCode size={24} className="text-theme" />
              </div>
              <p className="text-xs font-bold text-theme">Plain QR</p>
              <p className="text-[10px] text-secondary mt-0.5">Standard Standalone</p>
            </div>

            {/* Available Designer QR Templates */}
            {activeTemplates.map((template) => {
              const tId = String(template.id || template._id);
              const isSelected = selectedTemplateId === tId;
              const previewUrl = template.imagePath ? getImageUrl(template.imagePath) : null;

              return (
                <div
                  key={tId}
                  onClick={() => setSelectedTemplateId(tId)}
                  className={`relative rounded-xl border-2 p-2.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all overflow-hidden ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                      : "border-theme bg-surface hover:border-primary/40"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold z-10 shadow-sm">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                  <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-900 border border-theme/40 mb-2 overflow-hidden flex items-center justify-center shadow-2xs">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <QrCode size={22} className="text-secondary" />
                    )}
                  </div>
                  <div className="w-full text-center">
                    <p className="text-xs font-bold text-theme truncate" title={template.name}>
                      {template.name}
                    </p>
                    <span className="text-[10px] text-secondary font-medium uppercase mt-0.5 inline-block">
                      {template.format || "Template"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValidCount || isSubmitting || remainingAllowed === 0}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Tables & QRs...
              </>
            ) : (
              <>
                <Layers size={16} />
                Add {isValidCount ? `${parsedCount} ` : ""}Tables
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
