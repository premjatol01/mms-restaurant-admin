import { useEffect } from "react";
import { X } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

/** Full-size view of an uploaded payment screenshot. `request` is a renewal request. */
export default function ScreenshotPreviewModal({ request, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Payment screenshot" className="relative bg-surface rounded-xl border border-theme w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-theme">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-theme truncate">{request.screenshot.name}</p>
            <p className="text-xs text-secondary">Submitted {formatDateTime(request.requestedAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 overflow-auto flex justify-center bg-theme">
          <img src={request.screenshot.dataUrl} alt="Payment screenshot" className="max-w-full max-h-[70vh] object-contain rounded" />
        </div>
      </div>
    </div>
  );
}
