import { useEffect, useState } from "react";
import { AlertTriangle, Clock, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import SubscriptionSkeleton from "./components/SubscriptionSkeleton";
import SubscriptionOverviewCard from "./components/SubscriptionOverviewCard";
import AvailablePlansSection from "./components/AvailablePlansSection";
import PlanHistoryAndTickets from "./components/PlanHistoryAndTickets";
import StateMessage from "./components/StateMessage";
import PaymentModal from "./modals/PaymentModal";
import TicketModal from "./modals/TicketModal";
import ScreenshotPreviewModal from "./modals/ScreenshotPreviewModal";

export default function SubscriptionPage() {
  const {
    subscription,
    packages,
    hasPendingPayment,
    pendingPayment,
    history,
    tickets,
    status,
    error,
    loadSubscription,
  } = useSubscriptionStore();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState(null); // { pkg, pricingTier, requestType }
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [previewRequest, setPreviewRequest] = useState(null);

  const load = async () => {
    const ok = await loadSubscription();
    if (!ok && useSubscriptionStore.getState().status === "error") {
      toast.error("Couldn't load your subscription. Please try again.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Quick handler to renew current plan
  const handleRenewCurrent = () => {
    if (hasPendingPayment) {
      toast.error("A payment verification request is already pending super admin review.");
      return;
    }
    const currentPkg = packages.find(
      (p) => p.name.toLowerCase() === (subscription?.packageName || subscription?.planName || "").toLowerCase()
    ) || packages[0];

    setSelectedPackageData({
      pkg: currentPkg,
      pricingTier: {
        duration: subscription?.duration || "1_month",
        durationDays: subscription?.duration ? Number(subscription.duration) : 30,
        durationDisplay: subscription?.durationDisplay || "1 Month (30 Days)",
        price: subscription?.price || subscription?.amount || currentPkg?.price || 999,
      },
      requestType: "renew",
    });
    setPaymentModalOpen(true);
  };

  // Handler to buy any package from the packages section
  const handleSelectPackage = (pkg, pricingTier) => {
    if (hasPendingPayment) {
      toast.error("A payment verification request is already pending super admin review.");
      return;
    }
    const isSamePlan = (subscription?.packageName || "").toLowerCase() === pkg.name.toLowerCase();
    setSelectedPackageData({
      pkg,
      pricingTier,
      requestType: isSamePlan ? "renew" : "buy",
    });
    setPaymentModalOpen(true);
  };

  // Scroll to packages section
  const handleChangePlan = () => {
    const el = document.getElementById("available-packages-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pb-12">
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

      {/* Ready State */}
      {status === "ready" && (
        <>
          {/* Top Alerts */}
          {hasPendingPayment && pendingPayment && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-800 dark:text-amber-200 shadow-xs">
              <Clock size={20} className="text-amber-600 shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold">Payment Verification Pending</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  You submitted payment of <strong>₹{Number(pendingPayment.amount).toLocaleString("en-IN")}</strong> for the <strong>{pendingPayment.planName}</strong> plan (Ref: {pendingPayment.transactionRef || "N/A"}).
                  Super admin is reviewing your screenshot. Your plan will be confirmed shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 shrink-0 transition-colors"
              >
                Send Note
              </button>
            </div>
          )}

          {!hasPendingPayment && subscription?.isExpired && (
            <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-red-800 dark:text-red-200 shadow-xs">
              <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold">Subscription Plan Expired</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  Your subscription period ended. Please renew your plan or select an upgraded package below to maintain full table management and online ordering services.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRenewCurrent}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shrink-0 transition-colors"
              >
                Renew Now
              </button>
            </div>
          )}

          {/* Section 1: Current Plan Overview */}
          <SubscriptionOverviewCard
            subscription={subscription}
            hasPendingPayment={hasPendingPayment}
            pendingPayment={pendingPayment}
            onRenew={handleRenewCurrent}
            onChangePlan={handleChangePlan}
            onRaiseTicket={() => setTicketModalOpen(true)}
          />

          {/* Section 2: Available Packages (Buy according to new package details) */}
          <AvailablePlansSection
            packages={packages}
            currentSubscription={subscription}
            onSelectPackage={handleSelectPackage}
          />

          {/* Section 3: Payment History & Support Tickets */}
          <PlanHistoryAndTickets
            history={history}
            tickets={tickets}
            onViewScreenshot={(req) => setPreviewRequest(req)}
            onRaiseTicket={() => setTicketModalOpen(true)}
          />

          {/* Modals */}
          {selectedPackageData && (
            <PaymentModal
              isOpen={paymentModalOpen}
              onClose={() => {
                setPaymentModalOpen(false);
                setSelectedPackageData(null);
              }}
              targetPackage={selectedPackageData.pkg}
              selectedPricing={selectedPackageData.pricingTier}
              requestType={selectedPackageData.requestType}
            />
          )}

          <TicketModal
            isOpen={ticketModalOpen}
            onClose={() => setTicketModalOpen(false)}
          />

          <ScreenshotPreviewModal
            request={previewRequest}
            onClose={() => setPreviewRequest(null)}
          />
        </>
      )}
    </div>
  );
}
