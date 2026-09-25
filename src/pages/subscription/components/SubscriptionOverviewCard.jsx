import { Crown, CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, ArrowRightLeft } from "lucide-react";
import Button from "../../../components/ui/Button";
import { SUBSCRIPTION_STATUS, BILLING_CYCLE_LABELS } from "../data/subscriptionConfig";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency, formatDaysRemaining } from "../utils/subscriptionUtils";

const STATUS_ICONS = { active: CheckCircle, expiring: AlertTriangle, expired: XCircle };
const STATUS_MESSAGES = {
  active: "Your subscription is active and running smoothly.",
  expiring: "Your subscription is expiring soon. Renew to avoid interruption.",
  expired: "Your subscription has expired. Renew to restore access.",
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-secondary mb-1">{label}</p>
      <div className="text-sm font-medium text-theme">{children}</div>
    </div>
  );
}

export default function SubscriptionOverviewCard({ subscription, state, renewal, onRenew, onChangePlan }) {
  const meta = SUBSCRIPTION_STATUS[state.key];
  const StatusIcon = STATUS_ICONS[state.key];
  const percentUsed = Math.round(state.progress * 100);

  return (
    <div className="bg-surface rounded-xl border border-theme overflow-hidden">
      {/* Header: plan name + action */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Crown size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-secondary">Current Plan</p>
            <h2 className="text-lg font-semibold text-theme truncate">{subscription.planName}</h2>
            <p className="text-sm text-secondary">
              {BILLING_CYCLE_LABELS[subscription.billingCycle] || subscription.billingCycle} · {formatCurrency(subscription.amount)}
            </p>
          </div>
        </div>

        {/* Single action button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={onChangePlan}>
            <ArrowRightLeft size={14} />
            Change Plan
          </Button>
          <Button disabled={renewal.hasPending} onClick={onRenew} size="sm">
            {renewal.hasPending ? <Clock size={14} /> : <RefreshCw size={14} />}
            {renewal.hasPending ? "Renewal Pending" : "Renew"}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Inline status banner */}
        <div className={`rounded-xl border-2 p-4 ${meta.panel}`}>
          <div className="flex items-start gap-3">
            <StatusIcon size={22} className={`flex-shrink-0 mt-0.5 ${meta.accent}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${meta.accent}`}>{meta.label}</span>
                {renewal.hasPending && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                    <Clock size={10} /> Renewal Under Review
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-0.5">{STATUS_MESSAGES[state.key]}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatDate(subscription.startDate)}</span>
              <span>{state.key === "expired" ? "Period ended" : `${percentUsed}% used`}</span>
              <span>{formatDate(subscription.expiryDate)}</span>
            </div>
            <div
              className="w-full h-2 rounded-full bg-white/70"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentUsed}
              aria-label="Subscription period used"
            >
              <div className={`h-2 rounded-full ${meta.bar}`} style={{ width: `${percentUsed}%` }} />
            </div>
          </div>
        </div>

        {/* Detail fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Start Date">{formatDate(subscription.startDate)}</Field>
          <Field label="Expiry Date">{formatDate(subscription.expiryDate)}</Field>
          <Field label="Days Remaining">
            <span className={state.key === "expired" ? "text-red-600" : state.key === "expiring" ? "text-amber-600" : ""}>
              {formatDaysRemaining(state.daysRemaining)}
            </span>
          </Field>
          <Field label="Billing Cycle">
            {BILLING_CYCLE_LABELS[subscription.billingCycle] || subscription.billingCycle}
          </Field>
        </div>
      </div>
    </div>
  );
}
