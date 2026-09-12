import { useState } from "react";
import { Tag, CheckCircle, Clock, XCircle } from "lucide-react";
import { useOffersStore } from "../../store/offersStore";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import OfferDetailsDrawer from "./components/OfferDetailsDrawer";
import CreateOfferDrawer from "./components/CreateOfferDrawer";

function SummaryCards() {
  const { getStats } = useOffersStore();
  const stats = getStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Clock className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-secondary">Scheduled</p>
            <p className="text-xl font-bold text-theme">{stats.scheduled}</p>
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
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }) {
  const labels = { active: "Active", scheduled: "Scheduled", inactive: "Inactive" };
  const colors = { active: "bg-green-100 text-green-700", scheduled: "bg-yellow-100 text-yellow-700", inactive: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function OfferTable({ offers, onViewOffer }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getBenefitText = (offer) => {
    return `${offer.benefit.value}% OFF`;
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
    <div className="overflow-x-auto border border-theme rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-primary-light/30 border-b border-theme">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-theme">Offer Name</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Type</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Benefit</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Condition</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Validity</th>
            <th className="text-left px-4 py-3 font-medium text-theme">Status</th>
            <th className="text-right px-4 py-3 font-medium text-theme">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-b border-theme last:border-0 hover:bg-primary-light/10">
              <td className="px-4 py-3 font-medium text-theme">{offer.name}</td>
              <td className="px-4 py-3"><OfferTypeBadge type={offer.type} /></td>
              <td className="px-4 py-3 text-theme font-medium">{getBenefitText(offer)}</td>
              <td className="px-4 py-3 text-secondary">{getConditionText(offer)}</td>
              <td className="px-4 py-3 text-secondary">
                {formatDate(offer.validity.startDate)} – {formatDate(offer.validity.endDate)}
              </td>
              <td className="px-4 py-3"><StatusBadge status={offer.status} /></td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onViewOffer(offer)} className="text-primary hover:underline text-sm">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OfferCard({ offer, onViewOffer }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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
          <OfferTypeBadge type={offer.type} />
        </div>
        <StatusBadge status={offer.status} />
      </div>

      <div>
        <p className="text-xl font-bold text-theme">{offer.benefit.value}% OFF</p>
        <p className="text-sm text-secondary">{getConditionText(offer)}</p>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-secondary">
          {formatDate(offer.validity.startDate)} – {formatDate(offer.validity.endDate)}
        </span>
      </div>

      <button
        onClick={() => onViewOffer(offer)}
        className="w-full py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary-light/20 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

export default function OffersPromosPage() {
  const { offers } = useOffersStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

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

  const hasFilters = search || typeFilter || statusFilter;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-theme">Offers & Promotions</h1>
          <p className="text-sm text-secondary">
            Create and manage offers that customers can automatically discover and avail.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          + Create Offer
        </Button>
      </div>

      <SummaryCards />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search offers..." />
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
              { value: "scheduled", label: "Scheduled" },
              { value: "inactive", label: "Inactive" }
            ]}
            className="w-full sm:w-36"
          />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">
            Clear filters
          </button>
        )}

        {!offers.length ? (
          <EmptyState
            title="No offers created yet"
            description="Create an offer to give customers more reasons to order from your restaurant."
            actionLabel="Create Offer"
            onAction={() => setShowCreate(true)}
          />
        ) : filteredOffers.length === 0 ? (
          <div className="p-8 text-center text-secondary">No offers found. Try changing your filters.</div>
        ) : (
          <>
            <div className="hidden md:block">
              <OfferTable offers={filteredOffers} onViewOffer={setSelectedOffer} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onViewOffer={setSelectedOffer} />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedOffer && (
        <OfferDetailsDrawer
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      {showCreate && (
        <CreateOfferDrawer
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}