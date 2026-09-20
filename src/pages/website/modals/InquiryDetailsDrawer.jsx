import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "../../../components/ui/Button";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700"
};
const STATUS_LABELS = { new: "New", in_progress: "In Progress", resolved: "Resolved" };

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs text-secondary">{label}</p>
      <div className="text-sm text-theme">{children}</div>
    </div>
  );
}

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Inquiry details">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-lg font-semibold text-theme">Inquiry Details</h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Detail label="Name"><span className="font-medium">{inquiry.name || "-"}</span></Detail>
          <Detail label="Mobile">{inquiry.mobile || "-"}</Detail>
          <Detail label="Email">{inquiry.email || "-"}</Detail>
          <Detail label="Purpose">{inquiry.purpose || "-"}</Detail>
          <Detail label="Message"><p className="whitespace-pre-wrap">{inquiry.message || "-"}</p></Detail>
          <Detail label="Submitted">{formatDate(inquiry.submittedAt)}</Detail>
          <div>
            <p className="text-xs text-secondary mb-2">Status</p>
            <StatusBadge status={inquiry.status} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-theme space-y-2">
          {inquiry.status === "new" && (
            <Button className="w-full" onClick={() => onUpdateStatus(inquiry.id, "in_progress")}>
              Mark as In Progress
            </Button>
          )}
          {inquiry.status === "in_progress" && (
            <Button className="w-full" onClick={() => onUpdateStatus(inquiry.id, "resolved")}>
              Mark as Resolved
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
