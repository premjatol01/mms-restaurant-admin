import { useState } from "react";
import { MoreVertical, Pencil, Trash2, ToggleRight } from "lucide-react";

export default function ActionsMenu({ onEdit, onToggle, onDelete, showToggle = true }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 text-secondary hover:text-theme rounded hover:bg-primary-light transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-theme rounded-lg shadow-xl z-20 py-1">
            <button
              onClick={() => { onEdit?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light"
            >
              <Pencil size={14} /> Edit
            </button>
            {showToggle && (
              <button
                onClick={() => { onToggle?.(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme hover:bg-primary-light"
              >
                <ToggleRight size={14} /> Toggle Status
              </button>
            )}
            <button
              onClick={() => { onDelete?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}