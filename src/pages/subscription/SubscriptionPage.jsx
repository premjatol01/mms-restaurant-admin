import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import SubscriptionSkeleton from "./components/SubscriptionSkeleton";
import SubscriptionOverviewCard from "./components/SubscriptionOverviewCard";
import AvailablePlansSection from "./components/AvailablePlansSection";
import PlanHistory from "./components/PlanHistory";
import StateMessage from "./components/StateMessage";
import RenewalDrawer from "./modals/RenewalDrawer";
import PlanChangeModal from "./modals/PlanChangeModal";
import ScreenshotPreviewModal from "./modals/ScreenshotPreviewModal";
import { getSubscriptionState, getRenewalState } from "./utils/subscriptionUtils";

export default function SubscriptionPage() {
  const { subscription, requests, status, error, loadSubscription } = useSubscriptionStore();
  const [showRenew, setShowRenew] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // plan chosen for upgrade/downgrade
  const [previewRequest, setPreviewRequest] = useState(null);

  const load = async () => {
    const ok = await loadSubscription();
    if (!ok && useSubscriptionStore.getState().status === "error") {
      toast.error("Couldn't load your subscription. Please try again.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renewal = getRenewalState(requests);
  const state = subscription ? getSubscriptionState(subscription) : null;

  const openRenew = () => {
    if (renewal.hasPending) {
      toast.error("A renewal request is already pending review.");
      return;
    }
    setShowRenew(true);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-theme">Subscription</h1>
        <p className="text-sm text-secondary">Manage your current plan, explore available plans, and track your renewal history.</p>
      </div>

      {/* Loading state */}
      {(status === "idle" || status === "loading") && <SubscriptionSkeleton />}

      {/* Error state */}
      {status === "error" && (
        <StateMessage
          tone="error"
          icon={AlertTriangle}
          title="Couldn't load your subscription"
          description={error || "Something went wrong while loading your subscription details."}
          actionLabel="Try Again"
          actionIcon={RefreshCw}
          onAction={load}
        />
      )}

      {/* No subscription state */}
      {status === "ready" && !subscription && (
        <StateMessage
          icon={CreditCard}
          title="No subscription found"
          description="Your restaurant doesn't have a subscription yet. Please contact the platform team to get started."
        />
      )}

      {/* Main content — 3 sections */}
      {status === "ready" && subscription && (
        <>
          {/* Section 1: Current plan overview */}
          <SubscriptionOverviewCard
            subscription={subscription}
            state={state}
            renewal={renewal}
            onRenew={openRenew}
            onChangePlan={() => setSelectedPlan(null)} // opens modal with no pre-selection; user picks from Section 2
          />

          {/* Section 2: Available plans (upgrade / downgrade) */}
          <AvailablePlansSection
            subscription={subscription}
            onSelectPlan={(plan) => setSelectedPlan(plan)}
          />

          {/* Section 3: Plan history */}
          <PlanHistory requests={requests} onViewScreenshot={setPreviewRequest} />
        </>
      )}

      {/* Modals / drawers */}
      <RenewalDrawer isOpen={showRenew} onClose={() => setShowRenew(false)} />
      <PlanChangeModal
        isOpen={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        selectedPlan={selectedPlan}
        subscription={subscription}
      />
      <ScreenshotPreviewModal request={previewRequest} onClose={() => setPreviewRequest(null)} />
    </div>
  );
}
