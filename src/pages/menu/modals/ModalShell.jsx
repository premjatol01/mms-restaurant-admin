import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

/**
 * Shared modal frame (overlay, header, scrollable body, optional footer)
 * so every modal in the Menu module looks and behaves the same.
 */
export default function ModalShell({ isOpen, onClose, title, subtitle, icon: Icon, size = "md", children, footer }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === "Escape" && onCloseRef.current?.();
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative bg-surface rounded-xl border border-theme w-full ${SIZES[size]} max-h-[90vh] flex flex-col shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-theme">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-theme">{title}</h3>
              {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && <div className="px-6 py-4 border-t border-theme">{footer}</div>}
      </div>
    </div>
  );
}
