import { useEffect } from "react";

// Base dialog: dark overlay, Escape to close, page scroll locked while open.
export default function Modal({ open, onClose, label, maxWidth = "max-w-md", children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden bg-surface border border-theme rounded-xl shadow-2xl`}>
        {children}
      </div>
    </div>
  );
}
