import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Keeps track of open modals so Escape only closes the top-most one
// (e.g. "Remove item" opened from inside the payment modal).
const openModals = [];

const SIZES = { md: "max-w-lg", lg: "max-w-2xl" };

export default function ModalShell({ title, subtitle, onClose, footer, size = "md", children }) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const token = Symbol("modal");
    openModals.push(token);

    const onKeyDown = (event) => {
      if (event.key === "Escape" && openModals[openModals.length - 1] === token) {
        closeRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-surface w-full ${SIZES[size]} max-h-[90vh] flex flex-col rounded-xl border border-theme shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-theme">
          <div>
            <h2 className="text-lg font-semibold text-theme">{title}</h2>
            {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-theme opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-theme">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
