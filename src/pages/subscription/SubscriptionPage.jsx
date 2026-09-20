import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import SubscriptionSkeleton from "./components/SubscriptionSkeleton";
import SubscriptionAlerts from "./components/SubscriptionAlerts";
import SubscriptionOverviewCard from "./components/SubscriptionOverviewCard";
import RenewalHistory from "./components/RenewalHistory";
import StateMessage from "./components/StateMessage";
import RenewalDrawer from "./modals/RenewalDrawer";
import ScreenshotPreviewModal from "./modals/ScreenshotPreviewModal";
import { getSubscriptionState, getRenewalState } from "./utils/subscriptionUtils";

export default function SubscriptionPage() {
  const { subscription, requests, status, error, loadSubscription } = useSubscriptionStore();
  const [showRenew, setShowRenew] = useState(false);
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
      <div>
        <h1 className="text-xl font-bold text-theme">Subscription</h1>
        <p className="text-sm text-secondary">View your current plan and renew it by paying through the platform's payment QR.</p>
      </div>

      {(status === "idle" || status === "loading") && <SubscriptionSkeleton />}

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

      {status === "ready" && !subscription && (
        <StateMessage
          icon={CreditCard}
          title="No subscription found"
          description="Your restaurant doesn't have a subscription yet. Please contact the platform team to get started."
        />
      )}

      {status === "ready" && subscription && (
        <>
          <SubscriptionAlerts
            subscription={subscription}
            state={state}
            renewal={renewal}
            onRenew={openRenew}
            onViewScreenshot={setPreviewRequest}
          />
          <SubscriptionOverviewCard subscription={subscription} state={state} renewal={renewal} onRenew={openRenew} />
          <RenewalHistory requests={requests} onViewScreenshot={setPreviewRequest} />
        </>
      )}

      <RenewalDrawer isOpen={showRenew} onClose={() => setShowRenew(false)} />
      <ScreenshotPreviewModal request={previewRequest} onClose={() => setPreviewRequest(null)} />
    </div>
  );
}
