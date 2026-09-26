import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useReviewsStore } from "../../store/reviewsStore";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ReviewFilters from "./components/ReviewFilters";
import ReviewList from "./components/ReviewList";
import Pagination from "./components/Pagination";
import ReviewActionModal from "./modals/ReviewActionModal";

const SUCCESS_MESSAGES = {
  accepted: "Review accepted. It's now visible to customers.",
  rejected: "Review rejected. It will stay hidden.",
};

function SummaryCards({ stats }) {
  const cards = [
    { label: "Total Reviews", value: stats.total, Icon: MessageSquare, tile: "bg-blue-100", icon: "text-blue-600" },
    { label: "Pending", value: stats.pending, Icon: Clock, tile: "bg-yellow-100", icon: "text-yellow-600" },
    { label: "Accepted", value: stats.accepted, Icon: CheckCircle, tile: "bg-green-100", icon: "text-green-600" },
    { label: "Rejected", value: stats.rejected, Icon: XCircle, tile: "bg-red-100", icon: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, tile, icon }) => (
        <div key={label} className="bg-surface rounded-xl border border-theme p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tile}`}>
              <Icon className={icon} size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary">{label}</p>
              <p className="text-xl font-bold text-theme">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Loading reviews">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-[74px] bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="bg-surface rounded-lg border border-theme p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />)}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-surface rounded-xl border border-theme p-8 flex flex-col items-center text-center gap-3" role="alert">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle size={20} className="text-red-600" />
      </div>
      <div>
        <p className="font-medium text-theme">Couldn't load reviews</p>
        <p className="text-sm text-secondary mt-0.5">{message}</p>
      </div>
      <Button variant="secondary" onClick={onRetry}>
        <RotateCcw size={16} className="mr-2" /> Try Again
      </Button>
    </div>
  );
}

export default function ReviewsPage() {
  const {
    reviews, total, stats, filters, shownPage, pageSize, loading, loaded, error,
    fetchReviews, setFilters, clearFilters, setPage, moderateReview,
  } = useReviewsStore();

  const [confirm, setConfirm] = useState(null); // { review, action }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const hasFilters = Object.values(filters).some(Boolean);

  const handleConfirm = async () => {
    setSubmitting(true);
    const result = await moderateReview(confirm.review.id, confirm.action);
    setSubmitting(false);
    if (result.success) {
      toast.success(SUCCESS_MESSAGES[confirm.action]);
      setConfirm(null);
    } else {
      toast.error(result.message); // keep the modal open so the action can be retried
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} onRetry={fetchReviews} />;

    if (stats.total === 0) {
      return (
        <EmptyState
          title="No reviews yet"
          description="Reviews that customers submit through your restaurant's ordering page will show up here."
        />
      );
    }

    if (total === 0) {
      return (
        <div className="p-8 text-center text-secondary">
          No reviews match your filters.{" "}
          <button type="button" onClick={clearFilters} className="text-primary hover:underline">Clear filters</button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <ReviewList
          reviews={reviews}
          onAccept={(review) => setConfirm({ review, action: "accepted" })}
          onReject={(review) => setConfirm({ review, action: "rejected" })}
        />
        <Pagination page={shownPage} pageSize={pageSize} total={total} onPageChange={setPage} disabled={loading} />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 px-4 py-3 bg-surface border border-theme rounded-lg text-sm text-secondary">
        <Eye size={16} className="mt-0.5 flex-shrink-0" />
        <p>
          Accepted reviews appear on your restaurant website and the customer ordering page. Rejected reviews stay hidden.
        </p>
      </div>

      {!loaded && !error ? (
        <SkeletonLoader />
      ) : (
        <>
          {loaded && <SummaryCards stats={stats} />}
          {/* Filters stay visible even when nothing matches, so they can be changed or cleared */}
          {(loaded && (stats.total > 0 || hasFilters)) && (
            <ReviewFilters filters={filters} onChange={setFilters} onClear={clearFilters} />
          )}
          <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"} aria-busy={loading}>
            {renderContent()}
          </div>
        </>
      )}

      {confirm && (
        <ReviewActionModal
          review={confirm.review}
          action={confirm.action}
          loading={submitting}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
