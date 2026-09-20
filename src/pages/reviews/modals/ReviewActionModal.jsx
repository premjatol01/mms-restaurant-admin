import { useEffect } from "react";
import { Check, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import StarRating from "../components/StarRating";

const COPY = {
  accepted: {
    title: "Accept this review?",
    message: "It will be shown publicly on your restaurant website and on the customer ordering page.",
    confirm: "Accept Review",
    Icon: Check,
    iconStyle: "bg-green-100 text-green-600",
  },
  rejected: {
    title: "Reject this review?",
    message: "It will stay hidden and won't be shown to customers.",
    confirm: "Reject Review",
    Icon: X,
    iconStyle: "bg-red-100 text-red-600",
  },
};

/**
 * Confirm accepting / rejecting a pending review.
 *  - review: the review being moderated
 *  - action: "accepted" | "rejected"
 */
export default function ReviewActionModal({ review, action, loading = false, onConfirm, onCancel }) {
  const { title, message, confirm, Icon, iconStyle } = COPY[action];

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !loading) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, loading]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={loading ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-surface rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
              <Icon size={18} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-theme">{title}</h3>
              <p className="text-sm text-secondary mt-1">{message}</p>
            </div>
          </div>

          <div className="bg-primary-light/20 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-theme truncate">{review.customerName?.trim() || "Anonymous"}</span>
              <StarRating rating={review.rating} size={13} />
            </div>
            <p className="text-sm text-secondary line-clamp-3">{review.comment}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 pb-6">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          {action === "rejected" ? (
            <Button variant="danger" onClick={onConfirm} loading={loading}>{confirm}</Button>
          ) : (
            <Button onClick={onConfirm} loading={loading}>{confirm}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
