import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useOffersStore } from "../../../store/offersStore";
import { useMenuStore } from "../../../store/menuStore";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

const OFFER_TYPES = [
  { id: "repeat_order", label: "Repeat Order Offer", description: "Reward customers who order again" },
  { id: "order_value", label: "Order Value-Based Offer", description: "Encourage higher order values" },
  { id: "low_traffic", label: "Low-Traffic / Promotional Offer", description: "Promote specific days/items" }
];

const DAYS_OF_WEEK = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" }
];

export default function CreateOfferDrawer({ isOpen, onClose, editOffer }) {
  const { addOffer, updateOffer } = useOffersStore();
  const { menuItems } = useMenuStore();
  
  const [step, setStep] = useState(editOffer ? 2 : 1);
  const [offerType, setOfferType] = useState(editOffer?.type || "");
  const [formData, setFormData] = useState({
    name: editOffer?.name || "",
    benefitValue: editOffer?.benefit?.value || "",
    previousOrderAmount: editOffer?.previousOrderAmount || "",
    repeatWithinDays: editOffer?.repeatWithinDays || "",
    minimumOrderAmount: editOffer?.minimumOrderAmount || "",
    promotionMode: editOffer?.promotionMode || "order_value",
    dayType: editOffer?.dayType || "day_of_week",
    dayOfWeek: editOffer?.dayOfWeek || "",
    specificDate: editOffer?.specificDate || "",
    menuItemId: editOffer?.menuItemId || "",
    startDate: editOffer?.validity?.startDate || "",
    endDate: editOffer?.validity?.endDate || "",
    terms: editOffer?.terms || "",
    status: editOffer?.status || "active"
  });

  const menuItemOptions = menuItems.map((item) => ({ value: item.id, label: item.name }));

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error("Please enter an offer name."); return; }
    if (!formData.benefitValue) { toast.error("Please enter a discount value."); return; }
    if (!formData.startDate || !formData.endDate) { toast.error("Please select validity dates."); return; }

    const offerData = {
      name: formData.name,
      benefit: { type: "percentage", value: parseInt(formData.benefitValue) },
      validity: { startDate: formData.startDate, endDate: formData.endDate },
      terms: formData.terms,
      status: formData.status
    };

    if (offerType === "repeat_order") {
      if (!formData.previousOrderAmount || !formData.repeatWithinDays) {
        toast.error("Please fill all required fields."); return;
      }
      Object.assign(offerData, {
        type: "repeat_order",
        previousOrderAmount: parseInt(formData.previousOrderAmount),
        repeatWithinDays: parseInt(formData.repeatWithinDays)
      });
    } else if (offerType === "order_value") {
      if (!formData.minimumOrderAmount) { toast.error("Please enter minimum order amount."); return; }
      Object.assign(offerData, {
        type: "order_value",
        minimumOrderAmount: parseInt(formData.minimumOrderAmount)
      });
    } else if (offerType === "low_traffic") {
      if (formData.promotionMode === "order_value") {
        if (!formData.minimumOrderAmount) { toast.error("Please enter minimum order amount."); return; }
        Object.assign(offerData, {
          type: "low_traffic",
          promotionMode: "order_value",
          dayType: formData.dayType,
          dayOfWeek: formData.dayType === "day_of_week" ? formData.dayOfWeek : "",
          specificDate: formData.dayType === "specific_date" ? formData.specificDate : "",
          minimumOrderAmount: parseInt(formData.minimumOrderAmount)
        });
      } else {
        if (!formData.menuItemId) { toast.error("Please select a menu item."); return; }
        const menuItem = menuItems.find((m) => m.id === formData.menuItemId);
        Object.assign(offerData, {
          type: "low_traffic",
          promotionMode: "menu_item",
          dayType: formData.dayType,
          dayOfWeek: formData.dayType === "day_of_week" ? formData.dayOfWeek : "",
          specificDate: formData.dayType === "specific_date" ? formData.specificDate : "",
          menuItemId: formData.menuItemId,
          menuItemName: menuItem?.name || ""
        });
      }
    }

    if (editOffer) {
      updateOffer(editOffer.id, offerData);
      toast.success("Offer updated successfully.");
    } else {
      addOffer(offerData);
      toast.success("Offer created successfully.");
    }
    onClose();
  };

  if (!isOpen) return null;

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-theme">Choose Offer Type</h3>
      <div className="space-y-3">
        {OFFER_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => { setOfferType(type.id); setStep(2); }}
            className={`w-full p-4 text-left border rounded-lg transition-colors ${
              offerType === type.id ? "border-primary bg-primary-light/20" : "border-theme hover:border-primary"
            }`}
          >
            <p className="font-medium text-theme">{type.label}</p>
            <p className="text-sm text-secondary">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-theme">Configure Offer</h3>
        <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline">Change Type</button>
      </div>

      <Input
        label="Offer Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="e.g., Tuesday Special"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={offerType === "repeat_order" ? "Discount (%)" : "Discount (%)"}
          type="number"
          value={formData.benefitValue}
          onChange={(e) => handleChange("benefitValue", e.target.value)}
          placeholder="10"
        />
        <Select
          label="Status"
          value={formData.status}
          onChange={(v) => handleChange("status", v)}
          options={[
            { value: "active", label: "Active" },
            { value: "scheduled", label: "Scheduled" },
            { value: "inactive", label: "Inactive" }
          ]}
        />
      </div>

      {/* Repeat Order Fields */}
      {offerType === "repeat_order" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Previous Order Amount (₹)"
              type="number"
              value={formData.previousOrderAmount}
              onChange={(e) => handleChange("previousOrderAmount", e.target.value)}
              placeholder="1000"
            />
            <Input
              label="Repeat Within (Days)"
              type="number"
              value={formData.repeatWithinDays}
              onChange={(e) => handleChange("repeatWithinDays", e.target.value)}
              placeholder="7"
            />
          </div>
        </>
      )}

      {/* Order Value Fields */}
      {offerType === "order_value" && (
        <Input
          label="Minimum Order Amount (₹)"
          type="number"
          value={formData.minimumOrderAmount}
          onChange={(e) => handleChange("minimumOrderAmount", e.target.value)}
          placeholder="1500"
        />
      )}

      {/* Low Traffic Fields */}
      {offerType === "low_traffic" && (
        <>
          <div>
            <label className="text-sm font-medium text-theme block mb-2">Promotion Based On</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.promotionMode === "order_value"}
                  onChange={() => handleChange("promotionMode", "order_value")}
                />
                <span className="text-sm text-theme">Order Value</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.promotionMode === "menu_item"}
                  onChange={() => handleChange("promotionMode", "menu_item")}
                />
                <span className="text-sm text-theme">Specific Menu Item</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-theme block mb-2">Apply On</label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.dayType === "day_of_week"}
                  onChange={() => handleChange("dayType", "day_of_week")}
                />
                <span className="text-sm text-theme">Day of Week</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.dayType === "specific_date"}
                  onChange={() => handleChange("dayType", "specific_date")}
                />
                <span className="text-sm text-theme">Specific Date</span>
              </label>
            </div>
            {formData.dayType === "day_of_week" ? (
              <Select
                value={formData.dayOfWeek}
                onChange={(v) => handleChange("dayOfWeek", v)}
                options={DAYS_OF_WEEK}
                placeholder="Select day"
              />
            ) : (
              <Input
                type="date"
                value={formData.specificDate}
                onChange={(e) => handleChange("specificDate", e.target.value)}
              />
            )}
          </div>

          {formData.promotionMode === "order_value" ? (
            <Input
              label="Minimum Order Amount (₹)"
              type="number"
              value={formData.minimumOrderAmount}
              onChange={(e) => handleChange("minimumOrderAmount", e.target.value)}
              placeholder="1000"
            />
          ) : (
            <Select
              label="Menu Item"
              value={formData.menuItemId}
              onChange={(v) => handleChange("menuItemId", v)}
              options={menuItemOptions}
              placeholder="Select menu item"
            />
          )}
        </>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-theme block mb-1">Terms & Conditions</label>
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-theme bg-surface text-theme text-sm focus:outline-none focus:border-primary"
          rows={3}
          value={formData.terms}
          onChange={(e) => handleChange("terms", e.target.value)}
          placeholder="Enter offer terms and conditions..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <h2 className="text-lg font-semibold text-theme">
            {editOffer ? "Edit Offer" : step === 1 ? "Create Offer" : "Configure Offer"}
          </h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-theme rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="px-6 py-4 border-t border-theme flex gap-3">
          {step === 2 && (
            <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          {step === 2 ? (
            <Button className="flex-1" onClick={handleSave}>
              {editOffer ? "Update Offer" : "Save Offer"}
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => { if (offerType) setStep(2); else toast.error("Please select an offer type."); }}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}