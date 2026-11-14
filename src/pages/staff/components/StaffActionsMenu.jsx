import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  RotateCcw,
  Mail,
  Power,
  Trash2,
  Shield,
} from "lucide-react";

export default function StaffActionsMenu({
  member,
  onViewDetails,
  onEdit,
  onResendActivation,
  onPreviewEmail,
  onToggleStatus,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const isPending = member.status === "pending_activation";
  const isActive = member.status === "active";
  const isOwner = Boolean(member.isOwner);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = isPending ? 240 : 180;
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
      const menuEl = document.getElementById(`staff-actions-menu-portal-${member.id}`);
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
  }, [isOpen, member.id]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleOpen}
        aria-label={`Actions for ${member.name}`}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isOpen
            ? "text-primary bg-primary-light shadow-xs"
            : "text-secondary hover:text-theme hover:bg-primary-light/50"
        }`}
      >
        <MoreVertical size={17} />
      </button>

      {isOpen &&
        createPortal(
          <div
            id={`staff-actions-menu-portal-${member.id}`}
            style={{
              position: "fixed",
              top: `${position.top}px`,
              right: `${position.right}px`,
              zIndex: 99999,
            }}
            className="w-52 bg-surface border border-theme rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action 1: View Profile & Permissions */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewDetails?.(member);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-theme hover:bg-primary-light/40 transition-colors text-left cursor-pointer"
            >
              <Eye size={15} className="text-primary shrink-0" />
              <span>View Profile & Capabilities</span>
            </button>

            {/* Action 2: Edit Role & Permissions */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit?.(member);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-theme hover:bg-primary-light/40 transition-colors text-left cursor-pointer"
            >
              <Pencil size={15} className="text-secondary shrink-0" />
              <span>Edit Role & Permissions</span>
            </button>

            {/* Action 3 & 4 (If Pending Activation): Resend & Preview Invite Email */}
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onResendActivation?.(member);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-left cursor-pointer"
                >
                  <RotateCcw size={15} className="shrink-0" />
                  <span>Resend Activation Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onPreviewEmail?.(member);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-secondary hover:text-theme hover:bg-primary-light/40 transition-colors text-left cursor-pointer"
                >
                  <Mail size={15} className="shrink-0" />
                  <span>Preview Invite Email</span>
                </button>
              </>
            )}

            {!isOwner && <div className="my-1 border-t border-theme/60" />}

            {/* Action 5: Suspend / Reactivate (Non-owner only) */}
            {!isOwner && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onToggleStatus?.(member);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                    : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                }`}
              >
                <Power size={15} className="shrink-0" />
                <span>{isActive ? "Suspend Staff Access" : "Reactivate Staff Access"}</span>
              </button>
            )}

            {/* Action 6: Remove Member (Non-owner only) */}
            {!isOwner && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDelete?.(member);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
              >
                <Trash2 size={15} className="shrink-0" />
                <span>Remove from Roster</span>
              </button>
            )}
          </div>
        )}
    </div>
  );
}
