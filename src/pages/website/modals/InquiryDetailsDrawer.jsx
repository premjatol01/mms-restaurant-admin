import { useEffect } from "react";
import { X, Phone, Mail, MessageCircle, Calendar, Tag, User, MessageSquare } from "lucide-react";
import Button from "../../../components/ui/Button";

const STATUS_STYLES = {
  new: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30",
  in_progress: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
};

const STATUS_LABELS = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function StatusBadge({ status }) {
  const normStatus = status || "new";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
        STATUS_STYLES[normStatus] || STATUS_STYLES.new
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normStatus === "resolved"
            ? "bg-emerald-500"
            : normStatus === "in_progress"
            ? "bg-amber-500"
            : "bg-sky-500"
        }`}
      />
      {STATUS_LABELS[normStatus] || normStatus}
    </span>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateStr);
  }
};

export default function InquiryDetailsDrawer({ inquiry, onClose, onUpdateStatus }) {
  useEffect(() => {
    if (!inquiry) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [inquiry, onClose]);

  if (!inquiry) return null;

  const cleanPhone = (inquiry.mobile || "").replace(/\D/g, "");
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Inquiry details"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-theme z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-surface">
          <div>
            <h2 className="text-base font-bold text-theme">Customer Inquiry</h2>
            <p className="text-xs text-secondary mt-0.5">Submitted via website contact form</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-theme rounded-lg hover:bg-surface-soft transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status & Date Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-theme bg-surface-soft/40">
            <div>
              <p className="text-[11px] font-medium text-secondary mb-1">Status</p>
              <StatusBadge status={inquiry.status} />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-secondary mb-1">Received On</p>
              <span className="text-xs font-semibold text-theme flex items-center gap-1 justify-end">
                <Calendar size={13} className="text-secondary" />
                {formatDate(inquiry.submittedAt)}
              </span>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="p-4 rounded-xl border border-theme bg-surface space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {(inquiry.name || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-theme">{inquiry.name || "Anonymous Guest"}</p>
                {inquiry.purpose && (
                  <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary-soft text-theme">
                    {inquiry.purpose}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-theme">
              {inquiry.mobile ? (
                <a
                  href={`tel:${inquiry.mobile}`}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-surface border border-theme text-theme hover:bg-primary-soft/20 hover:text-primary transition-colors"
                >
                  <Phone size={13} />
                  <span>Call</span>
                </a>
              ) : (
                <button disabled className="opacity-40 px-3 py-2 text-xs border border-theme rounded-lg">
                  No Phone
                </button>
              )}

              {inquiry.mobile ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <button disabled className="opacity-40 px-3 py-2 text-xs border border-theme rounded-lg">
                  No WA
                </button>
              )}

              {inquiry.email ? (
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-surface border border-theme text-theme hover:bg-primary-soft/20 hover:text-primary transition-colors"
                >
                  <Mail size={13} />
                  <span>Email</span>
                </a>
              ) : (
                <button disabled className="opacity-40 px-3 py-2 text-xs border border-theme rounded-lg">
                  No Email
                </button>
              )}
            </div>
          </div>

          {/* Contact Details List */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-secondary mb-1">Phone Number</p>
              <p className="text-sm font-semibold text-theme">{inquiry.mobile || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">Email Address</p>
              <p className="text-sm font-semibold text-theme break-all">{inquiry.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary mb-1">Purpose / Reason</p>
              <p className="text-sm font-semibold text-theme">{inquiry.purpose || "General Inquiry"}</p>
            </div>
          </div>

          {/* Customer Message Block */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-secondary flex items-center gap-1.5">
              <MessageSquare size={13} className="text-primary" />
              Customer Message
            </p>
            <div className="p-4 rounded-xl border border-theme bg-surface-soft/40 text-sm text-theme whitespace-pre-wrap leading-relaxed">
              {inquiry.message || "No message provided."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-theme bg-surface space-y-2">
          <div className="flex gap-2">
            {inquiry.status !== "in_progress" && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onUpdateStatus(inquiry.id, "in_progress")}
              >
                In Progress
              </Button>
            )}
            {inquiry.status !== "resolved" && (
              <Button
                className="flex-1"
                onClick={() => onUpdateStatus(inquiry.id, "resolved")}
              >
                Mark Resolved
              </Button>
            )}
            {inquiry.status === "resolved" && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onUpdateStatus(inquiry.id, "new")}
              >
                Reopen (New)
              </Button>
            )}
          </div>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
