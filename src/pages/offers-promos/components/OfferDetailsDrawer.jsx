import { useState } from "react";
import { X, Copy, Phone, Mail, Edit2, RefreshCw, Ticket, IndianRupee, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useOffersStore } from "../../../store/offersStore";
import Button from "../../../components/ui/Button";
import CreateOfferDrawer from "./CreateOfferDrawer";

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

function getBenefitBadgeText(offer) {
  if (offer.benefit?.type === "flat") {
    return `₹${offer.benefit.value} FLAT OFF`;
  }
  return `${offer.benefit?.value || 0}% OFF`;
}

function generateSocialPrompt(offer) {
  const restaurantName = "Our Restaurant";
  const benefitStr = getBenefitBadgeText(offer);
  const startStr = offer.validity?.startDate ? new Date(offer.validity.startDate).toLocaleDateString() : "";
  const endStr = offer.validity?.endDate ? new Date(offer.validity.endDate).toLocaleDateString() : "";
  const validityText = startStr && endStr ? `Valid from ${startStr} to ${endStr}.` : "";
  
  if (offer.type === "repeat_order") {
    return `Create an engaging Instagram promotional post for ${restaurantName}'s "${offer.name}" offer. Customers who spent ₹${offer.previousOrderAmount}+ on their previous order and order again within ${offer.repeatWithinDays} days get ${benefitStr} on their new order. ${validityText} Modern, appetizing food photography style.`;
  }
  
  if (offer.type === "order_value") {
    return `Create an engaging Instagram promotional post for ${restaurantName}'s "${offer.name}" offer. Get ${benefitStr} on orders of ₹${offer.minimumOrderAmount} or more! ${validityText} Make it eye-catching with delicious food visuals.`;
  }
  
  if (offer.type === "low_traffic") {
    if (offer.promotionMode === "menu_item") {
      return `Create an engaging Instagram promotional post for ${restaurantName}'s "${offer.name}" offer. Enjoy ${benefitStr} on ${offer.menuItemName} every ${offer.dayOfWeek || offer.specificDate}! ${validityText} Show the delicious ${offer.menuItemName} prominently.`;
    }
    return `Create an engaging Instagram promotional post for ${restaurantName}'s "${offer.name}" offer. Get ${benefitStr} on orders of ₹${offer.minimumOrderAmount}+ every ${offer.dayOfWeek || offer.specificDate}! ${validityText} Vibrant, appetizing food photography.`;
  }
  
  return `Create an engaging promotional post for ${restaurantName}'s "${offer.name}" - ${benefitStr}!`;
}

const formatCount = (n) => Number(n ?? 0).toLocaleString("en-IN");
const formatInr = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OfferDetailsDrawer({ offer, onClose }) {
  const { updateOfferStatus, deleteOffer, designerContact } = useOffersStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = offer.status === "active" ? "inactive" : "active";
    try {
      await updateOfferStatus(offer.id, newStatus);
      toast.success(`Offer ${newStatus === "active" ? "activated" : "deactivated"} successfully.`);
      setShowStatusConfirm(null);
    } catch (err) {
      toast.error(err.message || "Failed to update offer status.");
    }
  };

  const handleDeleteOffer = async () => {
    setIsDeleting(true);
    try {
      await deleteOffer(offer.id);
      toast.success(`Offer "${offer.name}" deleted successfully.`);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to delete offer.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPrompt = async () => {
    const prompt = generateSocialPrompt(offer);
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Social media prompt copied to clipboard.");
    } catch {
      toast.error("Unable to copy prompt. Please copy manually.");
    }
  };

  const getConditionText = () => {
    if (offer.type === "repeat_order") {
      return `Previous order: ₹${offer.previousOrderAmount}+ | Repeat within: ${offer.repeatWithinDays} days`;
    }
    if (offer.type === "order_value") {
      return `Minimum order: ₹${offer.minimumOrderAmount}`;
    }
    if (offer.type === "low_traffic") {
      if (offer.promotionMode === "order_value") {
        const day = offer.dayOfWeek || offer.specificDate;
        return `${day} | Minimum order: ₹${offer.minimumOrderAmount}`;
      }
      const day = offer.dayOfWeek || offer.specificDate;
      return `${day} | ${offer.menuItemName}`;
    }
    return "";
  };

  const prompt = generateSocialPrompt(offer);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-surface w-full max-w-md h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
            <div>
              <h2 className="text-lg font-semibold text-theme">{offer.name}</h2>
              <OfferTypeBadge type={offer.type} />
            </div>
            <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Main Benefit */}
            <div className="text-center py-4 bg-primary-light/20 rounded-lg">
              <p className="text-3xl font-bold text-theme">{getBenefitBadgeText(offer)}</p>
              <p className="text-sm text-secondary mt-1">{getConditionText()}</p>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary">Status</span>
              <StatusBadge status={offer.status} />
            </div>

            {/* Performance */}
            <div className="space-y-2">
              <h3 className="font-medium text-theme">Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-light/20 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <Ticket size={14} />
                    <span className="text-xs">No. of Times Availed</span>
                  </div>
                  <p className="text-lg font-bold text-theme mt-1">{formatCount(offer.performance?.timesAvailed)}</p>
                </div>
                <div className="bg-primary-light/20 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <IndianRupee size={14} />
                    <span className="text-xs">Total Discount Given (INR)</span>
                  </div>
                  <p className="text-lg font-bold text-theme mt-1">{formatInr(offer.performance?.totalDiscountGiven)}</p>
                </div>
              </div>
            </div>

            {/* Validity */}
            <div className="space-y-2">
              <h3 className="font-medium text-theme">Validity</h3>
              <div className="bg-primary-light/20 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Start Date</span>
                  <span className="text-theme">{formatDate(offer.validity?.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-secondary">End Date</span>
                  <span className="text-theme">{formatDate(offer.validity?.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            {offer.terms && (
              <div className="space-y-2">
                <h3 className="font-medium text-theme">Terms & Conditions</h3>
                <p className="text-sm text-secondary bg-primary-light/20 rounded-lg p-3 whitespace-pre-wrap">
                  {offer.terms}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowEdit(true)}>
                <Edit2 size={16} className="mr-2" /> Edit Offer
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowPrompt(true)}>
                <RefreshCw size={16} className="mr-2" /> Generate Social Prompt
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowDesigner(true)}>
                <Phone size={16} className="mr-2" /> Contact Designer
              </Button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex items-center justify-center transition-colors"
              >
                <Trash2 size={16} className="mr-2 text-red-500" /> Delete Offer
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-theme space-y-2">
            {offer.status === "inactive" ? (
              <Button className="w-full" onClick={() => setShowStatusConfirm("activate")}>
                Activate Offer
              </Button>
            ) : (
              <Button variant="secondary" className="w-full" onClick={() => setShowStatusConfirm("deactivate")}>
                Deactivate Offer
              </Button>
            )}
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Social Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrompt(false)} />
          <div className="relative bg-surface w-full max-w-lg rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h3 className="font-semibold text-theme">Social Media Prompt</h3>
              <button onClick={() => setShowPrompt(false)} className="p-1 text-secondary hover:text-theme">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-secondary mb-1">
                  Offer: <span className="text-theme font-medium">{offer.name}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">Type:</span>
                  <OfferTypeBadge type={offer.type} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-theme mb-2">Generated Instagram Prompt</p>
                <div className="bg-primary-light/20 p-4 rounded-lg text-sm text-theme whitespace-pre-wrap leading-relaxed">
                  {prompt}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-theme flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowPrompt(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={handleCopyPrompt}>
                <Copy size={16} className="mr-2" /> Copy Prompt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Designer Contact Modal */}
      {showDesigner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDesigner(false)} />
          <div className="relative bg-surface w-full max-w-md rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
              <h3 className="font-semibold text-theme">Professional Design</h3>
              <button onClick={() => setShowDesigner(false)} className="p-1 text-secondary hover:text-theme">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-secondary">
                Need high-resolution promotional graphics, banners, or Instagram story designs for this offer?
              </p>
              <div className="bg-primary-light/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-secondary">Phone</p>
                    <p className="text-theme font-medium">{designerContact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-secondary">Email</p>
                    <p className="text-theme font-medium">{designerContact.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-theme">
              <a
                href={`tel:${designerContact.phone}`}
                className="block w-full py-2.5 bg-primary text-white text-center rounded-lg font-medium hover:bg-primary-light transition-colors"
              >
                Call Design Support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Dialog */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStatusConfirm(null)} />
          <div className="relative bg-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="font-semibold text-theme mb-2">
                {showStatusConfirm === "deactivate" ? "Deactivate Offer?" : "Activate Offer?"}
              </h3>
              <p className="text-sm text-secondary">
                {showStatusConfirm === "deactivate"
                  ? `"${offer.name}" will no longer be visible or applicable to customer orders.`
                  : `"${offer.name}" will become active and available according to its eligibility rules.`}
              </p>
            </div>
            <div className="flex border-t border-theme">
              <button
                type="button"
                onClick={() => setShowStatusConfirm(null)}
                className="flex-1 py-3 text-secondary hover:bg-primary-light/20 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="flex-1 py-3 text-primary border-l border-theme font-semibold hover:bg-primary-light/20 transition-colors"
              >
                {showStatusConfirm === "deactivate" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-red-100">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} />
              </div>
              <h3 className="font-semibold text-theme mb-2">Delete Offer?</h3>
              <p className="text-sm text-secondary">
                Are you sure you want to delete <span className="font-medium text-theme">"{offer.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-theme">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 text-secondary hover:bg-primary-light/20 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOffer}
                className="flex-1 py-3 text-red-600 border-l border-theme font-semibold hover:bg-red-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <CreateOfferDrawer
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          editOffer={offer}
        />
      )}
    </>
  );
}