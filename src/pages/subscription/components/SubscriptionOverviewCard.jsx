import { Crown, CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock } from "lucide-react";
import Button from "../../../components/ui/Button";
import { SUBSCRIPTION_STATUS, RENEWAL_STATUS, BILLING_CYCLE_LABELS } from "../data/subscriptionConfig";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency, formatDaysRemaining } from "../utils/subscriptionUtils";

const STATUS_ICONS = { active: CheckCircle, expiring: AlertTriangle, expired: XCircle };

const STATUS_MESSAGES = {
  active: "Your subscription is active.",
  expiring: "Your subscription is close to expiry.",
  expired: "Your subscription has expired.",
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm text-secondary mb-1">{label}</p>
      <div className="text-theme font-medium">{children}</div>
    </div>
  );
}

export default function SubscriptionOverviewCard({ subscription, state, renewal, onRenew }) {
  const meta = SUBSCRIPTION_STATUS[state.key];
  const StatusIcon = STATUS_ICONS[state.key];
  const renewalMeta = RENEWAL_STATUS[renewal.key];
  const percentUsed = Math.round(state.progress * 100);

  return (
    <div className="bg-surface rounded-xl border border-theme overflow-hidden">
      {/* Plan + renew action */}
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

        <div className="sm:text-right">
          <Button disabled={renewal.hasPending} onClick={onRenew} className="w-full sm:w-auto">
            {renewal.hasPending ? <Clock size={16} /> : <RefreshCw size={16} />}
            {renewal.hasPending ? "Renewal Pending" : "Renew Subscription"}
          </Button>
          {renewal.hasPending && (
            <p className="text-xs text-secondary mt-2">A request is already under review.</p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status highlight */}
        <div className={`rounded-xl border-2 p-5 ${meta.panel}`}>
          <div className="flex items-center gap-4">
            <StatusIcon size={36} className={`flex-shrink-0 ${meta.accent}`} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide font-medium text-gray-600">Subscription Status</p>
              <p className={`text-2xl font-bold ${meta.accent}`} data-testid="status-label">{meta.label}</p>
              <p className="text-sm text-gray-700">{STATUS_MESSAGES[state.key]}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{formatDate(subscription.startDate)}</span>
              <span>{state.key === "expired" ? "Period ended" : `${percentUsed}% of period used`}</span>
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

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Start Date">{formatDate(subscription.startDate)}</Field>
          <Field label="Expiry Date">{formatDate(subscription.expiryDate)}</Field>
          <Field label="Days Remaining">
            <span className={state.key === "expired" ? "text-red-600" : state.key === "expiring" ? "text-amber-600" : ""}>
              {formatDaysRemaining(state.daysRemaining)}
            </span>
          </Field>
          <Field label="Renewal Status">
            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${renewalMeta.badge}`}>{renewalMeta.label}</span>
          </Field>
        </div>
      </div>
    </div>
  );
}
