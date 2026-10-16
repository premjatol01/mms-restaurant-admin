import { useState, useEffect } from "react";
import { Tag, CheckCircle, XCircle, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOffersStore } from "../../store/offersStore";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import OfferDetailsDrawer from "./components/OfferDetailsDrawer";
import CreateOfferDrawer from "./components/CreateOfferDrawer";

const formatCount = (n) => Number(n ?? 0).toLocaleString("en-IN");
const formatInr = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function SummaryCards() {
  const { getStats } = useOffersStore();
  const stats = getStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Tag className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Total Offers</p>
            <p className="text-xl font-bold text-theme">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Active Offers</p>
            <p className="text-xl font-bold text-theme">{stats.active}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <XCircle className="text-gray-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Inactive</p>
            <p className="text-xl font-bold text-theme">{stats.inactive}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferTypeBadge({ type }) {
  const labels = {
    repeat_order: "Repeat Order",
    order_value: "Order Value",
    low_traffic: "Low Traffic"
  };
  const colors = {
    repeat_order: "bg-blue-100 text-blue-700",
    order_value: "bg-green-100 text-green-700",
    low_traffic: "bg-purple-100 text-purple-700"
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type] || "bg-gray-100 text-gray-700"}`}>
      {labels[type] || type}
    </span>
  );
}

function StatusBadge({ status }) {
  const labels = { active: "Active", inactive: "Inactive" };
  const colors = { active: "bg-green-100 text-green-700", inactive: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || "bg-gray-100 text-gray-500"}`}>
      {labels[status] || status}
    </span>
  );
}

function getBenefitText(offer) {
  if (offer.benefit?.type === "flat") {
    return `₹${offer.benefit.value} FLAT OFF`;
  }
  return `${offer.benefit?.value || 0}% OFF`;
}

function OfferTable({ offers, onViewOffer, onRequestDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getConditionText = (offer) => {
    if (offer.type === "repeat_order") {
      return `Order ≥ ₹${offer.previousOrderAmount} • Within ${offer.repeatWithinDays} days`;
    }
    if (offer.type === "order_value") {
      return `Order ≥ ₹${offer.minimumOrderAmount}`;
    }
    if (offer.type === "low_traffic") {
      if (offer.promotionMode === "order_value") {
        return `${offer.dayOfWeek || offer.specificDate} • Order ≥ ₹${offer.minimumOrderAmount}`;
      }
      return `${offer.dayOfWeek || offer.specificDate} • ${offer.menuItemName}`;
    }
    return "";
  };

  return (
    <div className="overflow-x-auto border border-theme rounded-lg bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-primary-light/30 border-b border-theme">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-theme">Offer Name</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Type</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Benefit</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Condition</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Validity</th>
            <th className="text-right px-4 py-3 font-medium text-theme whitespace-nowrap">Times Availed</th>
            <th className="text-right px-4 py-3 font-medium text-theme whitespace-nowrap">Total Discount (INR)</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
            <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10 transition-colors">
              <td className="px-4 py-3 font-medium text-theme">{offer.name}</td>
              <td className="px-4 py-3"><OfferTypeBadge type={offer.type} /></td>
              <td className="px-4 py-3 text-theme font-medium">{getBenefitText(offer)}</td>
              <td className="px-4 py-3 text-secondary">{getConditionText(offer)}</td>
              <td className="px-4 py-3 text-secondary text-xs">
                {formatDate(offer.validity?.startDate)} – {formatDate(offer.validity?.endDate)}
              </td>
              <td className="px-4 py-3 text-right text-theme">{formatCount(offer.performance?.timesAvailed)}</td>
              <td className="px-4 py-3 text-right text-theme">{formatInr(offer.performance?.totalDiscountGiven)}</td>
              <td className="px-4 py-3"><StatusBadge status={offer.status} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onViewOffer(offer)}
                    className="p-1.5 text-primary hover:bg-primary-light/20 rounded-md transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(offer)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Offer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OfferCard({ offer, onViewOffer, onRequestDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getConditionText = (offer) => {
    if (offer.type === "repeat_order") {
      return `Order ≥ ₹${offer.previousOrderAmount} • Within ${offer.repeatWithinDays} days`;
    }
    if (offer.type === "order_value") {
      return `Order ≥ ₹${offer.minimumOrderAmount}`;
    }
    if (offer.type === "low_traffic") {
      if (offer.promotionMode === "order_value") {
        return `${offer.dayOfWeek || offer.specificDate} • Order ≥ ₹${offer.minimumOrderAmount}`;
      }
      return `${offer.dayOfWeek || offer.specificDate} • ${offer.menuItemName}`;
    }
    return "";
  };

  return (
    <div className="bg-surface border border-theme rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-theme">{offer.name}</h3>
          <div className="mt-1">
            <OfferTypeBadge type={offer.type} />
          </div>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      <div>
        <p className="text-xl font-bold text-theme">{getBenefitText(offer)}</p>
        <p className="text-sm text-secondary mt-0.5">{getConditionText(offer)}</p>
      </div>

      <div className="flex justify-between items-center text-xs text-secondary">
        <span>
          {formatDate(offer.validity?.startDate)} – {formatDate(offer.validity?.endDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme">
        <div>
          <p className="text-xs text-secondary">Times Availed</p>
          <p className="text-sm font-semibold text-theme">{formatCount(offer.performance?.timesAvailed)}</p>
        </div>
        <div>
          <p className="text-xs text-secondary">Total Discount</p>
          <p className="text-sm font-semibold text-theme">{formatInr(offer.performance?.totalDiscountGiven)}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onViewOffer(offer)}
          className="flex-1 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-light/20 transition-colors font-medium"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={() => onRequestDelete(offer)}
          className="px-3 py-2 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Offer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function OffersPromosPage() {
  const { offers, fetchOffers, deleteOffer, loading, error, loaded } = useOffersStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = offers.filter((offer) => {
    const matchSearch = !search || offer.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || offer.type === typeFilter;
    const matchStatus = !statusFilter || offer.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const handleDeleteConfirmed = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOffer(offerToDelete.id);
      toast.success(`Offer "${offerToDelete.name}" deleted successfully.`);
      if (selectedOffer?.id === offerToDelete.id) {
        setSelectedOffer(null);
      }
      setOfferToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete offer.");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = search || typeFilter || statusFilter;

  if (loading && !loaded) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-secondary">Loading offers from server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search & Filters at top */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search offers by name..." />
          </div>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "", label: "All Types" },
              { value: "repeat_order", label: "Repeat Order" },
              { value: "order_value", label: "Order Value" },
              { value: "low_traffic", label: "Low Traffic" }
            ]}
            className="w-full sm:w-40"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
            className="w-full sm:w-36"
          />
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary">Active filters</span>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Table Section Header with Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-theme">
              Offers List
              {filteredOffers.length > 0 && (
                <span className="ml-2 text-xs font-normal text-secondary">
                  ({filteredOffers.length} {filteredOffers.length === 1 ? "offer" : "offers"})
                </span>
              )}
            </h2>
            {error && (
              <span className="text-xs text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md inline-block mt-1">
                {error}
              </span>
            )}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1.5" />
            Create Offer
          </Button>
        </div>

        {!offers.length ? (
          <EmptyState
            title="No offers created yet"
            description="Create an offer to give customers more reasons to order from your restaurant."
            actionLabel="Create Offer"
            onAction={() => setShowCreate(true)}
          />
        ) : filteredOffers.length === 0 ? (
          <div className="p-8 text-center text-secondary bg-surface rounded-lg border border-theme">
            No offers found matching your filters.{" "}
            <button onClick={clearFilters} className="text-primary hover:underline ml-1">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <OfferTable
                offers={filteredOffers}
                onViewOffer={setSelectedOffer}
                onRequestDelete={setOfferToDelete}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onViewOffer={setSelectedOffer}
                  onRequestDelete={setOfferToDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Offer Details Drawer */}
      {selectedOffer && (
        <OfferDetailsDrawer
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      {/* Create / Edit Drawer */}
      {showCreate && (
        <CreateOfferDrawer
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {offerToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setOfferToDelete(null)} />
          <div className="relative bg-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-red-100">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} />
              </div>
              <h3 className="font-semibold text-theme mb-2">Delete Offer?</h3>
              <p className="text-sm text-secondary">
                Are you sure you want to delete <span className="font-medium text-theme">"{offerToDelete.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-theme">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOfferToDelete(null)}
                className="flex-1 py-3 text-secondary hover:bg-primary-light/20 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirmed}
                className="flex-1 py-3 text-red-600 border-l border-theme font-semibold hover:bg-red-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}