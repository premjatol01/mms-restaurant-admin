import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Eye, Filter, MessageSquare, RotateCcw, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { useReviewsStore } from "../../store/reviewsStore";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ReviewFilterDrawer from "./components/ReviewFilterDrawer";
import ReviewList from "./components/ReviewList";
import Pagination from "../../components/ui/Pagination";
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
    {
      label: "Portfolio Top 5",
      value: `${stats.portfolioSelected || 0}/5 Picked`,
      Icon: Star,
      tile: "bg-amber-100",
      icon: "text-amber-600 fill-amber-500"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map(({ label, value, Icon, tile, icon }) => (
        <div key={label} className="bg-surface rounded-xl border border-theme p-3.5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tile}`}>
              <Icon className={icon} size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-secondary truncate">{label}</p>
              <p className="text-lg font-bold text-theme truncate">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4 flex-1 flex flex-col" aria-busy="true" aria-label="Loading reviews">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-[74px] bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="flex-1 bg-surface rounded-xl border border-theme p-4 space-y-3">
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
    fetchReviews, setFilters, clearFilters, setPage, moderateReview, togglePortfolio,
  } = useReviewsStore();

  const [confirm, setConfirm] = useState(null); // { review, action }
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const hasFilters = Object.values(filters).some(Boolean);
  const activeFiltersCount = [
    filters.status,
    filters.rating,
    filters.portfolioOnly,
    filters.datePreset || (filters.dateFrom || filters.dateTo),
  ].filter(Boolean).length;

  const handleConfirm = async () => {
    setSubmitting(true);
    const reviewId = confirm.review.id || confirm.review._id;
    const result = await moderateReview(reviewId, confirm.action);
    setSubmitting(false);
    if (result.success) {
      toast.success(SUCCESS_MESSAGES[confirm.action]);
      setConfirm(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleTogglePortfolio = async (review) => {
    const reviewId = review.id || review._id;
    const result = await togglePortfolio(reviewId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} onRetry={fetchReviews} />;

    if (stats.total === 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-surface border border-theme rounded-xl p-8">
          <EmptyState
            title="No reviews yet"
            description="Reviews that customers submit through your restaurant's ordering page will show up here."
          />
        </div>
      );
    }

    if (total === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-secondary bg-surface border border-theme rounded-xl">
          <div>
            <p>No reviews match your filters.</p>
            <button type="button" onClick={clearFilters} className="text-primary hover:underline mt-2 text-sm cursor-pointer">
              Clear filters
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-0 flex flex-col bg-surface border border-theme rounded-xl overflow-hidden shadow-sm">
        <ReviewList
          reviews={reviews}
          onAccept={(review) => setConfirm({ review, action: "accepted" })}
          onReject={(review) => setConfirm({ review, action: "rejected" })}
          onTogglePortfolio={handleTogglePortfolio}
        />
        <Pagination page={shownPage} pageSize={pageSize} total={total} onPageChange={setPage} disabled={loading} itemName="reviews" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Top Header Row: Info Line & Filter Button */}
      <div className="flex-none mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-surface border border-theme rounded-lg text-sm text-secondary flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <Eye size={16} className="flex-shrink-0 text-primary" />
            <p className="truncate sm:whitespace-normal">
              Accepted reviews appear on your website. Pick your top 5 favorite reviews below to feature directly on your portfolio page.
            </p>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0">
            <Star size={12} className="fill-amber-500" />
            <span>{stats.portfolioSelected || 0}/5 Selected for Portfolio</span>
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(true)}
          className="shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Filter size={16} /> Filters
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {!loaded && !error ? (
        <SkeletonLoader />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {loaded && <div className="flex-none mb-3"><SummaryCards stats={stats} /></div>}
          {hasFilters && (
            <div className="flex-none mb-3 flex items-center justify-between px-1">
              <span className="text-xs text-secondary">
                Filtered: {total} {total === 1 ? "review" : "reviews"} found
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
          <div className={`flex-1 min-h-0 flex flex-col ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`} aria-busy={loading}>
            {renderContent()}
          </div>
        </div>
      )}

      {/* Filter Sidebar Drawer */}
      <ReviewFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={clearFilters}
      />

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
