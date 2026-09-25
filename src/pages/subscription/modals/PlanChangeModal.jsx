import { ArrowUp, ArrowDown, Check, Mail, Phone } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { BILLING_CYCLE_LABELS, AVAILABLE_PLANS } from "../data/subscriptionConfig";
import { formatCurrency } from "../utils/subscriptionUtils";

/**
 * Confirmation modal shown when a user selects a different plan.
 * Plan changes are handled manually by the Super Admin team, so this
 * modal shows the selected plan details and instructs the user to contact support.
 */
export default function PlanChangeModal({ isOpen, onClose, selectedPlan, subscription }) {
  if (!selectedPlan || !subscription) return null;

  const currentPlan = AVAILABLE_PLANS.find(
    (p) => p.name.toLowerCase() === subscription.planName?.toLowerCase()
  );
  const isUpgrade = selectedPlan.tier > (currentPlan?.tier ?? 0);
  const ActionIcon = isUpgrade ? ArrowUp : ArrowDown;
  const actionLabel = isUpgrade ? "Upgrade" : "Downgrade";
  const actionColor = isUpgrade ? "text-green-600" : "text-amber-600";
  const actionBg = isUpgrade ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${actionLabel} Plan`} size="md">
      <div className="space-y-5">
        {/* Direction banner */}
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${actionBg}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isUpgrade ? "bg-green-100" : "bg-amber-100"}`}>
            <ActionIcon size={18} className={actionColor} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${actionColor}`}>{actionLabel} to {selectedPlan.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              From <span className="font-medium">{subscription.planName}</span> → <span className="font-medium">{selectedPlan.name}</span>
            </p>
          </div>
        </div>

        {/* New plan details */}
        <div className="rounded-xl border border-theme bg-surface p-4 space-y-3">
          <h3 className="text-sm font-semibold text-theme">{selectedPlan.name} Plan Details</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-theme">{formatCurrency(selectedPlan.amount)}</span>
            <span className="text-sm text-secondary">/ {selectedPlan.durationDisplay}</span>
          </div>
          <p className="text-xs text-secondary">{BILLING_CYCLE_LABELS[selectedPlan.billingCycle] || selectedPlan.billingCycle} billing</p>
          <ul className="space-y-1.5 pt-1 border-t border-theme">
            {selectedPlan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-theme">
                <Check size={12} className="text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact instruction */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800">How to change your plan</p>
          <p className="text-xs text-blue-700">
            Plan changes are processed by our team. Please contact us with your preferred plan and we'll get it updated for you.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <a
              href="mailto:support@tablly.in"
              className="inline-flex items-center gap-2 text-xs text-blue-700 hover:underline font-medium"
            >
              <Mail size={13} />
              support@tablly.in
            </a>
            <a
              href="tel:+919999999999"
              className="inline-flex items-center gap-2 text-xs text-blue-700 hover:underline font-medium"
            >
              <Phone size={13} />
              +91 99999 99999
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              window.location.href = "mailto:support@tablly.in?subject=Plan Change Request&body=Hi, I'd like to " + actionLabel.toLowerCase() + " my plan to " + selectedPlan.name + ".";
            }}
          >
            <Mail size={14} />
            Contact Support
          </Button>
        </div>
      </div>
    </Modal>
  );
}
