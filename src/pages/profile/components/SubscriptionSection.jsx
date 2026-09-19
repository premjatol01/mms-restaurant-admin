import { useEffect } from "react";
import { CalendarClock, Check, CreditCard } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { useProfileStore } from "../../../store/profileStore";
import FormSection from "../../../components/ui/FormSection";

const STATUS = {
  active: { label: "Active", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  trial: { label: "Trial", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  expired: { label: "Expired", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", badge: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

const USAGE_LABELS = { tables: "Tables", menuItems: "Menu items", staff: "Staff accounts" };

const formatDate = (value) => (value ? format(new Date(value), "dd MMM yyyy") : "—");

const formatPrice = (price, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs text-secondary">{label}</p>
      <div className="text-sm font-medium text-theme">{children}</div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse bg-surface rounded-xl border border-theme p-6 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />)}
      </div>
    </div>
  );
}

export default function SubscriptionSection() {
  const { subscription: sub, fetchSubscription } = useProfileStore();

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  if (!sub) return <SkeletonLoader />;

  const status = STATUS[sub.status] || STATUS.active;
  const daysLeft = sub.renewalDate ? differenceInCalendarDays(new Date(sub.renewalDate), new Date()) : null;
  const usage = Object.entries(sub.usage || {}).filter(([, v]) => v && typeof v.limit === "number");

  const renewalNote =
    daysLeft === null ? null
    : daysLeft < 0 ? "Ended"
    : daysLeft === 0 ? "Today"
    : `In ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;

  return (
    <div className="space-y-5">
      <FormSection title="Current Plan" description="Your restaurant's subscription and billing details.">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-theme border border-theme flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-theme">{sub.planName}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            {sub.price != null && (
              <p className="text-sm text-secondary">
                {formatPrice(sub.price, sub.currency)}{sub.billingCycle ? ` / ${sub.billingCycle === "yearly" ? "year" : sub.billingCycle === "monthly" ? "month" : sub.billingCycle}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Detail label="Started on">{formatDate(sub.startDate)}</Detail>
          <Detail label={sub.status === "expired" || sub.status === "cancelled" ? "Ended on" : "Renews on"}>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={14} className="text-secondary" />
              {formatDate(sub.renewalDate)}
            </span>
            {renewalNote && <span className="block text-xs font-normal text-secondary">{renewalNote}</span>}
          </Detail>
          {sub.billingCycle && <Detail label="Billing cycle"><span className="capitalize">{sub.billingCycle}</span></Detail>}
        </div>
      </FormSection>

      {usage.length > 0 && (
        <FormSection title="Plan Usage" description="How much of your plan limits you're using.">
          <div className="space-y-4">
            {usage.map(([key, { used, limit }]) => {
              const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-theme">{USAGE_LABELS[key] || key}</span>
                    <span className="text-xs text-secondary">{used} of {limit}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${pct >= 90 ? "bg-red-400" : "bg-[var(--color-primary)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </FormSection>
      )}

      {sub.features?.length > 0 && (
        <FormSection title="Included in Your Plan">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sub.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-theme">
                <Check size={15} className="text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </FormSection>
      )}
    </div>
  );
}
