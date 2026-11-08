import { Crown, CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, ArrowRightLeft, MessageSquare, Layers } from "lucide-react";
import Button from "../../../components/ui/Button";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function SubscriptionOverviewCard({
  subscription,
  hasPendingPayment,
  pendingPayment,
  onRenew,
  onChangePlan,
  onRaiseTicket,
}) {
  if (!subscription) return null;

  const planName = subscription.packageName || subscription.planName || "Basic";
  const amount = subscription.price || subscription.amount || 0;
  const durationDisplay = subscription.durationDisplay || (subscription.duration ? `${subscription.duration} Days` : "30 Days");
  const maxTables = subscription.maxTables || 15;
  const daysRemaining = subscription.daysRemaining ?? 0;
  const isExpired = subscription.status === "expired" || subscription.isExpired;
  const isExpiring = subscription.status === "expiring" || subscription.isExpiring;

  // Progress percentage calculation
  let progressPercent = 0;
  if (subscription.startDate && subscription.endDate) {
    const start = new Date(subscription.startDate).getTime();
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const total = end - start;
    if (total > 0) {
      const elapsed = now - start;
      progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-theme overflow-hidden shadow-sm">
      {/* Header: Plan Name, Price, and Action Buttons */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-light)]/30 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Crown size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Current Subscription</span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-theme truncate">{planName} Plan</h2>
              {/* Status Badge */}
              {hasPendingPayment ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                  <Clock size={11} className="animate-spin" /> Payment Verification Pending
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200">
                  <XCircle size={11} /> Plan Expired
                </span>
              ) : isExpiring ? (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                  <AlertTriangle size={11} /> Expiring Soon ({daysRemaining} days left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-200">
                  <CheckCircle size={11} /> Active Plan
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-0.5">
              ₹{Number(amount).toLocaleString("en-IN")} · {durationDisplay} · Max {maxTables} Tables Capacity
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button variant="secondary" size="sm" onClick={onRaiseTicket} title="Send note or get update">
            <MessageSquare size={14} />
            Raise Ticket / Note
          </Button>
          <Button variant="secondary" size="sm" onClick={onChangePlan} title="Choose another package">
            <ArrowRightLeft size={14} />
            Change Plan
          </Button>
          <Button size="sm" onClick={onRenew} disabled={hasPendingPayment} title={hasPendingPayment ? "Verification in progress" : "Renew current plan"}>
            {hasPendingPayment ? <Clock size={14} /> : <RefreshCw size={14} />}
            {hasPendingPayment ? "Verification Pending" : "Renew Plan"}
          </Button>
        </div>
      </div>

      {/* Validity & Progress Section */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-theme bg-surface/50">
          <div>
            <p className="text-xs text-secondary mb-1">Start Date</p>
            <p className="text-sm font-semibold text-theme">{formatDate(subscription.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Expiration Date</p>
            <p className="text-sm font-semibold text-theme">{formatDate(subscription.endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Days Remaining</p>
            <p className={`text-sm font-bold ${isExpired ? "text-red-600" : isExpiring ? "text-amber-600" : "text-green-600"}`}>
              {isExpired ? "0 Days (Expired)" : `${daysRemaining} Days`}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Table Capacity</p>
            <p className="text-sm font-semibold text-theme flex items-center gap-1">
              <Layers size={14} className="text-primary" /> Up to {maxTables} Tables
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-secondary mb-1.5 font-medium">
            <span>Period Usage</span>
            <span>{isExpired ? "100% (Period Ended)" : `${progressPercent}% Used`}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-theme/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExpired ? "bg-red-500" : isExpiring ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${isExpired ? 100 : progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
