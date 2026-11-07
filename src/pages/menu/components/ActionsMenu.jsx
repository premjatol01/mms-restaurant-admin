import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2, ToggleRight } from "lucide-react";

export default function ActionsMenu({ onEdit, onToggle, onDelete, showToggle = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = showToggle ? 130 : 90;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 10 && rect.top > menuHeight;

    setPosition({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

  const handleToggleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }
      const menuEl = document.getElementById("restaurant-actions-menu-portal");
      if (menuEl && !menuEl.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        data-dropdown-trigger="true"
        onClick={handleToggleOpen}
        aria-label="Actions"
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isOpen ? "text-primary bg-primary-light" : "text-secondary hover:text-theme hover:bg-primary-light/50"
        }`}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen &&
        createPortal(
          <div
            id="restaurant-actions-menu-portal"
            style={{
              position: "fixed",
              top: `${position.top}px`,
              right: `${position.right}px`,
              zIndex: 99999,
            }}
            className="w-44 bg-surface border border-theme rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit?.();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-theme hover:bg-primary-light/50 transition-colors text-left cursor-pointer"
            >
              <Pencil size={14} className="text-primary" /> Edit
            </button>

            {showToggle && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onToggle?.();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-theme hover:bg-primary-light/50 transition-colors text-left cursor-pointer"
              >
                <ToggleRight size={14} className="text-secondary" /> Toggle Status
              </button>
            )}

            <div className="my-1 border-t border-theme/50" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete?.();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
