import { useState } from "react";
import { Check, X, Star } from "lucide-react";
import Button from "../../../components/ui/Button";
import StarRating from "./StarRating";
import ReviewStatusBadge from "./ReviewStatusBadge";

const LONG_COMMENT = 140;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

function CustomerName({ name, mobile, tableName }) {
  const display = name?.trim() || "Anonymous";
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="w-8 h-8 rounded-full bg-primary-light/40 text-theme text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {display[0].toUpperCase()}
      </span>
      <div className="min-w-0">
        <span className={`font-medium block truncate ${name?.trim() ? "text-theme" : "text-secondary italic"}`}>{display}</span>
        {(mobile || tableName) && (
          <span className="text-[11px] text-secondary flex items-center gap-1.5">
            {mobile && <span>+91 {mobile}</span>}
            {mobile && tableName && <span>•</span>}
            {tableName && <span>{tableName}</span>}
          </span>
        )}
      </div>
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
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs text-primary hover:underline mt-0.5 cursor-pointer">
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

function ReviewTable({ reviews, onAccept, onReject, onTogglePortfolio }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
      <table className="w-full text-sm border-collapse text-left">
        <thead className="bg-primary-light/30 border-b border-theme sticky top-0 z-10 backdrop-blur-sm bg-surface/95">
          <tr>
            <th className="text-left px-5 py-3.5 font-medium text-theme">Customer</th>
            <th className="text-left px-4 py-3.5 font-medium text-theme">Rating</th>
            <th className="text-left px-4 py-3.5 font-medium text-theme">Review</th>
            <th className="text-left px-4 py-3.5 font-medium text-theme whitespace-nowrap">Submitted</th>
            <th className="text-left px-4 py-3.5 font-medium text-theme">Status</th>
            <th className="text-center px-4 py-3.5 font-medium text-theme whitespace-nowrap">Portfolio (Top 5)</th>
            <th className="text-right px-5 py-3.5 font-medium text-theme">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => {
            const isAccepted = review.status === "accepted";
            const isSelected = Boolean(review.selectedForPortfolio);

            return (
              <tr key={review.id || review._id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 align-top transition-colors">
                <td className="px-5 py-3.5"><CustomerName name={review.customerName} mobile={review.customerMobile} tableName={review.tableName} /></td>
                <td className="px-4 py-3.5"><StarRating rating={review.rating} /></td>
                <td className="px-4 py-3.5 max-w-md"><Comment text={review.comment} /></td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <p className="text-theme font-medium">{formatDate(review.submittedAt)}</p>
                  <p className="text-xs text-secondary">{formatTime(review.submittedAt)}</p>
                </td>
                <td className="px-4 py-3.5"><ReviewStatusBadge status={review.status} /></td>
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  {isAccepted ? (
                    <button
                      type="button"
                      onClick={() => onTogglePortfolio && onTogglePortfolio(review)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 hover:bg-amber-500/25"
                          : "bg-surface text-secondary hover:text-theme border border-theme hover:bg-primary-light/40"
                      }`}
                      title={
                        isSelected
                          ? "Click to remove from top 5 portfolio reviews"
                          : "Select to feature in top 5 reviews on your portfolio page"
                      }
                    >
                      <Star
                        size={13}
                        className={isSelected ? "fill-amber-500 text-amber-500" : "text-secondary"}
                      />
                      <span>{isSelected ? "On Portfolio" : "Feature"}</span>
                    </button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-secondary/40 border border-theme/30 bg-surface/40 cursor-not-allowed"
                      title="Accept this review first before featuring on portfolio"
                    >
                      <Star size={11} className="opacity-30" />
                      <span>Accept first</span>
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap"><Actions review={review} onAccept={onAccept} onReject={onReject} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReviewCard({ review, onAccept, onReject, onTogglePortfolio }) {
  const isAccepted = review.status === "accepted";
  const isSelected = Boolean(review.selectedForPortfolio);

  return (
    <div className="bg-surface rounded-xl border border-theme p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <CustomerName name={review.customerName} mobile={review.customerMobile} tableName={review.tableName} />
        <ReviewStatusBadge status={review.status} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <StarRating rating={review.rating} />
        {isAccepted && (
          <button
            type="button"
            onClick={() => onTogglePortfolio && onTogglePortfolio(review)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                : "bg-surface text-secondary border border-theme hover:bg-primary-light/40"
            }`}
          >
            <Star size={12} className={isSelected ? "fill-amber-500 text-amber-500" : "text-secondary"} />
            <span>{isSelected ? "On Portfolio" : "Feature on Portfolio"}</span>
          </button>
        )}
      </div>
      {review.comment && <Comment text={review.comment} />}
      <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs text-secondary">
        <span>{formatDate(review.submittedAt)}</span>
        <Actions review={review} onAccept={onAccept} onReject={onReject} />
      </div>
    </div>
  );
}

// Table on medium screens and up, cards below.
export default function ReviewList({ reviews, onAccept, onReject, onTogglePortfolio }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="hidden md:flex flex-1 min-h-0 flex-col overflow-hidden">
        <ReviewTable reviews={reviews} onAccept={onAccept} onReject={onReject} onTogglePortfolio={onTogglePortfolio} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden overflow-y-auto p-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id || review._id} review={review} onAccept={onAccept} onReject={onReject} onTogglePortfolio={onTogglePortfolio} />
        ))}
      </div>
    </div>
  );
}
