import { AlertTriangle, XCircle, Clock, Eye, RefreshCw } from "lucide-react";
import Button from "../../../components/ui/Button";
import { formatDate, formatDateTime } from "../utils/dateUtils";

function Banner({ tone, icon: Icon, title, children, action }) {
  const tones = {
    red: "bg-red-50 border-red-300 text-red-700",
    amber: "bg-amber-50 border-amber-300 text-amber-700",
    blue: "bg-blue-50 border-blue-300 text-blue-700",
  };
  return (
    <div role="alert" className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 ${tones[tone]}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-gray-700 mt-0.5">{children}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

/**
 * Banners for: expired / expiring soon, and the latest renewal request (pending / rejected).
 * The "Renew" call-to-action is hidden while a request is pending (no duplicate requests).
 */
export default function SubscriptionAlerts({ subscription, state, renewal, onRenew, onViewScreenshot }) {
  const canRenew = !renewal.hasPending;
  const renewButton = (label) =>
    canRenew && (
      <Button size="sm" onClick={onRenew}>
        <RefreshCw size={14} /> {label}
      </Button>
    );

  const daysText = state.daysRemaining === 0 ? "today" : `in ${state.daysRemaining} ${state.daysRemaining === 1 ? "day" : "days"}`;

  return (
    <div className="space-y-3">
      {state.key === "expired" && (
        <Banner tone="red" icon={XCircle} title="Your subscription has expired" action={renewButton("Renew Now")}>
          It expired on {formatDate(subscription.expiryDate)}. Renew your subscription to continue using the platform.
        </Banner>
      )}

      {state.key === "expiring" && (
        <Banner tone="amber" icon={AlertTriangle} title={`Your subscription expires ${daysText}`} action={renewButton("Renew Now")}>
          Renew before {formatDate(subscription.expiryDate)} to avoid any interruption.
        </Banner>
      )}

      {renewal.pending && (
        <Banner
          tone="blue"
          icon={Clock}
          title="Renewal request is under review"
          action={
            <Button size="sm" variant="secondary" onClick={() => onViewScreenshot(renewal.pending)}>
              <Eye size={14} /> View Screenshot
            </Button>
          }
        >
          Submitted on {formatDateTime(renewal.pending.requestedAt)}. Our team is verifying your payment, and you can submit a new request once this one is reviewed.
        </Banner>
      )}

      {!renewal.hasPending && renewal.latest?.status === "rejected" && (
        <Banner tone="red" icon={XCircle} title="Your last renewal request was rejected" action={renewButton("Renew Again")}>
          {renewal.latest.reviewNote || "The payment could not be verified."} You can submit a new request with a fresh payment screenshot.
        </Banner>
      )}
    </div>
  );
}
