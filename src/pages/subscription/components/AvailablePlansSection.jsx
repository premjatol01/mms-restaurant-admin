import { Check, ArrowUp, ArrowDown, Crown, Zap } from "lucide-react";
import Button from "../../../components/ui/Button";
import { AVAILABLE_PLANS, BILLING_CYCLE_LABELS } from "../data/subscriptionConfig";
import { formatCurrency } from "../utils/subscriptionUtils";

/**
 * Determines the action label + variant for a plan card relative to the current plan.
 * current plan ID match → "Current Plan" (disabled)
 * higher tier → "Upgrade"
 * lower tier → "Downgrade"
 */
function getPlanAction(plan, currentPlanId, currentTier) {
  if (plan.id === currentPlanId) return { label: "Current Plan", variant: "secondary", icon: null, disabled: true };
  if (plan.tier > currentTier) return { label: "Upgrade", variant: "primary", icon: ArrowUp, disabled: false };
  return { label: "Downgrade", variant: "secondary", icon: ArrowDown, disabled: false };
}

function PlanCard({ plan, currentPlanId, currentTier, onSelect }) {
  const isCurrent = plan.id === currentPlanId;
  const action = getPlanAction(plan, currentPlanId, currentTier);
  const ActionIcon = action.icon;

  return (
    <div
      className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 transition-all ${
        isCurrent
          ? "border-primary bg-primary-light/20"
          : plan.popular
          ? "border-amber-300 bg-amber-50/30"
          : "border-theme bg-surface"
      }`}
    >
      {/* Badges */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-theme">{plan.name}</h3>
          <p className="text-xs text-secondary mt-0.5">{plan.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isCurrent && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-primary text-white">
              <Crown size={10} /> Current
            </span>
          )}
          {plan.popular && !isCurrent && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
              <Zap size={10} /> Popular
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        <span className="text-2xl font-bold text-theme">{formatCurrency(plan.amount)}</span>
        <span className="text-sm text-secondary ml-1">/ {plan.durationDisplay}</span>
        <p className="text-xs text-secondary mt-0.5">{BILLING_CYCLE_LABELS[plan.billingCycle] || plan.billingCycle} billing</p>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-theme">
            <Check size={13} className="text-green-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* Action */}
      <Button
        variant={action.variant}
        className="w-full mt-auto"
        disabled={action.disabled}
        onClick={() => !action.disabled && onSelect(plan)}
      >
        {ActionIcon && <ActionIcon size={14} />}
        {action.label}
      </Button>
    </div>
  );
}

/**
 * Shows all available plans. The restaurant's current plan is highlighted.
 * Clicking Upgrade/Downgrade triggers `onSelectPlan(plan)` which opens PlanChangeModal.
 */
export default function AvailablePlansSection({ subscription, onSelectPlan }) {
  // Match by plan name (mock doesn't have plan IDs on subscription yet)
  const currentPlan = AVAILABLE_PLANS.find(
    (p) => p.name.toLowerCase() === subscription.planName?.toLowerCase()
  );
  const currentPlanId = currentPlan?.id ?? null;
  const currentTier = currentPlan?.tier ?? 0;

  return (
    <div className="bg-surface rounded-xl border border-theme p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-theme">Available Plans</h2>
        <p className="text-sm text-secondary">Upgrade or downgrade your plan at any time by contacting our team.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            currentTier={currentTier}
            onSelect={onSelectPlan}
          />
        ))}
      </div>
    </div>
  );
}
