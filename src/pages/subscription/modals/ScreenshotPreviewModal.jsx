import { useEffect } from "react";
import { X } from "lucide-react";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function ScreenshotPreviewModal({ request, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!request) return null;

  const rawUrl = request.screenshotUrl || request.screenshot?.url || request.screenshot?.dataUrl || "";
  const imageUrl = getImageUrl(rawUrl);
  const fileName = request.screenshot?.name || request.transactionRef || "Payment Receipt";
  const dateStr = request.requestedAt || request.createdAt ? new Date(request.requestedAt || request.createdAt).toLocaleString("en-IN") : "";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Payment screenshot"
        className="relative bg-surface rounded-xl border border-theme w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-theme bg-surface">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-theme truncate">{fileName}</p>
            {dateStr && <p className="text-xs text-secondary">Submitted on {dateStr}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-secondary hover:text-theme rounded-lg hover:bg-primary-light flex-shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 overflow-auto flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[300px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Payment screenshot"
              className="max-w-full max-h-[70vh] object-contain rounded-lg border border-theme shadow-sm"
            />
          ) : (
            <p className="text-xs text-secondary">No screenshot image available</p>
          )}
        </div>
        {request.transactionRef && (
          <div className="px-5 py-2.5 bg-surface border-t border-theme text-xs text-secondary flex items-center justify-between">
            <span>UTR / Ref: <strong className="text-theme font-mono">{request.transactionRef}</strong></span>
            <span>Amount: <strong className="text-theme">₹{Number(request.amount || 0).toLocaleString("en-IN")}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
