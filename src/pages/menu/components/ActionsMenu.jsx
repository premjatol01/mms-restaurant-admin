import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2, ToggleRight } from "lucide-react";

export default function ActionsMenu({ onEdit, onToggle, onDelete, showToggle = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, openUp: false });
  const buttonRef = useRef(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = showToggle ? 130 : 90;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 10 && rect.top > menuHeight;

    setPosition({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(12, rect.right - 176), // 176px is w-44
      openUp,
    });
  };

  const handleToggleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleOpen}
        aria-label="Actions"
        className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop to capture click outside */}
            <div
              className="fixed inset-0 z-[9998] bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            {/* Floating Dropdown Menu */}
            <div
              style={{
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
              className="w-44 bg-surface border border-theme rounded-lg shadow-2xl z-[9999] py-1 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onEdit?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-theme hover:bg-primary-light transition-colors text-left"
              >
                <Pencil size={14} className="text-primary" /> Edit
              </button>

              {showToggle && (
                <button
                  type="button"
                  onClick={() => {
                    onToggle?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-theme hover:bg-primary-light transition-colors text-left"
                >
                  <ToggleRight size={14} className="text-secondary" /> Toggle Status
                </button>
              )}

              <div className="my-1 border-t border-theme/50" />

              <button
                type="button"
                onClick={() => {
                  onDelete?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}