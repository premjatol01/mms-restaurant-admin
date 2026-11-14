import React from "react";
import {
  X,
  Mail,
  Phone,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Power,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import Drawer from "../../../components/ui/Drawer";
import Button from "../../../components/ui/Button";
import { PERMISSION_GROUPS } from "../data/staffData";

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function MemberDetailsDrawer({
  isOpen,
  onClose,
  member,
  onEdit,
  onResendActivation,
  onToggleStatus,
  onDelete,
  onPreviewEmail,
}) {
  if (!isOpen || !member) return null;

  const isPending = member.status === "pending_activation";
  const isActive = member.status === "active";

  const memberPermissions = member.permissions || [];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Team Member Profile" size="md">
      <div className="space-y-6 p-6">
        {/* Header Profile Card */}
        <div className="flex items-start gap-4 p-4 bg-surface border border-theme rounded-2xl shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-black text-xl flex items-center justify-center border border-primary/20 shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-theme truncate">{member.name}</h3>
              {member.isOwner && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary text-white">
                  Account Owner
                </span>
              )}
            </div>
            <p className="text-xs text-secondary font-medium mt-0.5">{member.roleName}</p>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {isPending ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Clock size={11} /> Activation Pending
                </span>
              ) : isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
                  <CheckCircle2 size={11} /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-700 dark:text-gray-300 border border-gray-500/30">
                  Suspended
                </span>
              )}

              <span className="text-[11px] text-secondary">
                {memberPermissions.length} permissions assigned
              </span>
            </div>
          </div>
        </div>

        {/* Pending Activation Banner */}
        {isPending && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-theme">Awaiting Email Activation</h4>
                <p className="text-xs text-secondary leading-relaxed">
                  An invitation email with a one-time activation token was dispatched to <strong>{member.email}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPreviewEmail?.(member)}
                className="flex-1 text-xs"
              >
                <Mail size={13} />
                Preview Invitation Email
              </Button>
              <Button
                size="sm"
                onClick={() => onResendActivation?.(member)}
                className="flex-1 text-xs"
              >
                <RotateCcw size={13} />
                Resend Activation Link
              </Button>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="border border-theme rounded-xl p-4 bg-surface space-y-3">
          <h4 className="text-xs font-bold text-theme uppercase tracking-wider">Contact & Credentials</h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-secondary flex items-center gap-1.5">
                <Mail size={13} className="text-primary" /> Email:
              </span>
              <span className="font-semibold text-theme select-all">{member.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> Phone:
              </span>
              <span className="font-semibold text-theme">{member.phone || "—"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" /> Invited:
              </span>
              <span className="text-secondary">{formatDate(member.invitedAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary flex items-center gap-1.5">
                <Clock size={13} className="text-primary" /> Last Login:
              </span>
              <span className="text-secondary">{formatDate(member.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        {/* Granular Permissions Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-theme uppercase tracking-wider">
              Assigned Capabilities ({memberPermissions.length})
            </h4>
            <span className="text-[11px] text-secondary">Inherited from {member.roleName}</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {PERMISSION_GROUPS.map((group) => {
              const activeInGroup = group.permissions.filter((p) => memberPermissions.includes(p.id));
              if (activeInGroup.length === 0) return null;

              return (
                <div key={group.group} className="p-3 bg-surface border border-theme rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-theme">
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} className="text-primary" />
                      {group.group}
                    </span>
                    <span className="text-[10px] text-secondary">{activeInGroup.length}/{group.permissions.length}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeInGroup.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-primary-light/40 text-theme border border-primary/20"
                      >
                        <CheckCircle2 size={10} className="text-primary" />
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-theme flex flex-col sm:flex-row items-center gap-2">
          {!member.isOwner && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:flex-1 text-xs"
              onClick={() => onToggleStatus?.(member)}
            >
              <Power size={13} className={isActive ? "text-amber-500" : "text-green-500"} />
              {isActive ? "Suspend Access" : "Reactivate Member"}
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            className="w-full sm:flex-1 text-xs"
            onClick={() => onEdit?.(member)}
          >
            <Pencil size={13} />
            Edit Role & Permissions
          </Button>

          {!member.isOwner && (
            <button
              type="button"
              onClick={() => onDelete?.(member)}
              className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
              title="Delete Member"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
