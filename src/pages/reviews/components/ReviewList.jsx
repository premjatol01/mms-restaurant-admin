import { useState } from "react";
import { Check, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import StarRating from "./StarRating";
import ReviewStatusBadge from "./ReviewStatusBadge";

const LONG_COMMENT = 140;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

function CustomerName({ name }) {
  const display = name?.trim() || "Anonymous";
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="w-8 h-8 rounded-full bg-primary-light/40 text-theme text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {display[0].toUpperCase()}
      </span>
      <span className={`font-medium truncate ${name?.trim() ? "text-theme" : "text-secondary italic"}`}>{display}</span>
    </div>
  );
}

// Long comments are clamped to two lines with a Read more toggle.
function Comment({ text }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > LONG_COMMENT;
  return (
    <div>
      <p className={`text-sm text-theme ${isLong && !expanded ? "line-clamp-2" : ""}`}>{text}</p>
      {isLong && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs text-primary hover:underline mt-0.5">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function Actions({ review, onAccept, onReject }) {
  if (review.status !== "pending") return <span className="text-secondary">—</span>;
  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" onClick={() => onAccept(review)} aria-label={`Accept review from ${review.customerName || "Anonymous"}`}>
        <Check size={14} className="mr-1.5" /> Accept
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onReject(review)} aria-label={`Reject review from ${review.customerName || "Anonymous"}`}>
        <X size={14} className="mr-1.5" /> Reject
      </Button>
    </div>
  );
}

function ReviewTable({ reviews, onAccept, onReject }) {
  return (
    <div className="overflow-x-auto border border-theme rounded-lg bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-primary-light/30 border-b border-theme">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-theme">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Rating</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Review</th>
            <th className="text-left px-4 py-3 font-medium text-theme whitespace-nowrap">Submitted</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
            <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 align-top">
              <td className="px-4 py-3"><CustomerName name={review.customerName} /></td>
              <td className="px-4 py-3"><StarRating rating={review.rating} /></td>
              <td className="px-4 py-3 max-w-md"><Comment text={review.comment} /></td>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-theme">{formatDate(review.submittedAt)}</p>
                <p className="text-xs text-secondary">{formatTime(review.submittedAt)}</p>
              </td>
              <td className="px-4 py-3"><ReviewStatusBadge status={review.status} /></td>
              <td className="px-4 py-3 text-right whitespace-nowrap"><Actions review={review} onAccept={onAccept} onReject={onReject} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewCard({ review, onAccept, onReject }) {
  return (
    <div className="bg-surface border border-theme rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <CustomerName name={review.customerName} />
        <ReviewStatusBadge status={review.status} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} />
        <span className="text-xs text-secondary">{formatDate(review.submittedAt)}, {formatTime(review.submittedAt)}</span>
      </div>

      <Comment text={review.comment} />

      {review.status === "pending" && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-theme">
          <Button size="sm" onClick={() => onAccept(review)} aria-label={`Accept review from ${review.customerName || "Anonymous"}`}>
            <Check size={14} className="mr-1.5" /> Accept
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onReject(review)} aria-label={`Reject review from ${review.customerName || "Anonymous"}`}>
            <X size={14} className="mr-1.5" /> Reject
          </Button>
        </div>
      )}
    </div>
  );
}

// Table on medium screens and up, cards below.
export default function ReviewList({ reviews, onAccept, onReject }) {
  return (
    <>
      <div className="hidden md:block">
        <ReviewTable reviews={reviews} onAccept={onAccept} onReject={onReject} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onAccept={onAccept} onReject={onReject} />
        ))}
      </div>
    </>
  );
}
