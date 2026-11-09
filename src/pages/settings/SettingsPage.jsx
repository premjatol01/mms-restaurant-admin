import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Percent, 
  Building2, 
  ShieldCheck, 
  Save, 
  HelpCircle, 
  Sparkles, 
  UtensilsCrossed,
  Info,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../../store/profileStore";
import Button from "../../components/ui/Button";

const GST_PRESETS = [
  { label: "0% (Exempt)", value: 0 },
  { label: "5% (Standard F&B)", value: 5 },
  { label: "12% (AC / Packaged)", value: 12 },
  { label: "18% (Luxury / Bar)", value: 18 },
];

export default function SettingsPage() {
  const profile = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [saving, setSaving] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(5);
  const [gstNumber, setGstNumber] = useState("");
  const [chargeType, setChargeType] = useState("exclusive");

  const [acceptOrders, setAcceptOrders] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Sync state from profile
  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      setGstEnabled(Boolean(profile.gstSettings?.enabled));
      setGstPercentage(profile.gstSettings?.percentage ?? 5);
      setGstNumber(profile.gstSettings?.gstNumber || "");
      setChargeType(profile.gstSettings?.chargeType || "exclusive");
      setAcceptOrders(profile.settings?.acceptOrders !== false);
      setIsActive(profile.settings?.isActive !== false);
    }
  }, [profile, fetchProfile]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        gstSettings: {
          enabled: Boolean(gstEnabled),
          percentage: Math.max(0, Number(gstPercentage) || 0),
          gstNumber: gstNumber.trim().toUpperCase(),
          chargeType: chargeType || "exclusive",
        },
        settings: {
          acceptOrders: Boolean(acceptOrders),
          isActive: Boolean(isActive),
        },
      };

      const res = await updateProfile(payload);
      if (res?.success || res?.data) {
        toast.success("Settings updated successfully!");
      } else {
        toast.success("Settings saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  // Preview calculations for an illustrative ₹500 order
  const previewSubtotal = 500;
  let previewGst = 0;
  let previewTotal = previewSubtotal;
  if (gstEnabled && gstPercentage > 0) {
    if (chargeType === "inclusive") {
      previewGst = Math.round(previewSubtotal * (gstPercentage / (100 + gstPercentage)));
      previewTotal = previewSubtotal;
    } else {
      previewGst = Math.round(previewSubtotal * (gstPercentage / 100));
      previewTotal = previewSubtotal + previewGst;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2">
      {/* Main GST Control Section */}
      <section className="bg-surface rounded-2xl border border-theme shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme/60 bg-primary-light/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Percent size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-theme">GST &amp; Tax Configuration</h2>
                <p className="text-xs text-secondary mt-0.5">
                  Control how GST is calculated on manual orders, table bills, and the customer QR ordering portal.
                </p>
              </div>
            </div>

            {/* Main Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!gstEnabled ? (
            <div className="rounded-xl border border-dashed border-theme p-5 bg-surface/50 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center mx-auto text-secondary">
                <Percent size={18} />
              </div>
              <h3 className="text-sm font-semibold text-theme">GST Billing is Currently Disabled</h3>
              <p className="text-xs text-secondary max-w-md mx-auto">
                Customer orders will be charged without additional taxes. Turn on the switch above to collect GST on orders and show tax breakdown on bills.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* GSTIN / Number */}
              <div>
                <label className="block text-sm font-medium text-theme mb-1">
                  GSTIN (Goods and Services Tax Identification Number)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme bg-surface text-theme font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-[11px] text-secondary mt-1">
                  Printed on digital receipts and shown on final customer invoices.
                </p>
              </div>

              {/* Tax Percentage */}
              <div>
                <label className="block text-sm font-medium text-theme mb-1.5">
                  GST Rate Percentage (%)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {GST_PRESETS.map((preset) => {
                    const isSelected = Number(gstPercentage) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setGstPercentage(preset.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface border-theme text-theme hover:bg-primary-light/10"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="w-48">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(e.target.value)}
                      className="w-full pr-8 pl-3.5 py-2 rounded-xl border border-theme bg-surface text-theme text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-secondary text-sm font-bold">
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* Charge Type */}
              <div>
                <label className="block text-sm font-medium text-theme mb-2">
                  Tax Application Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setChargeType("exclusive")}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      chargeType === "exclusive"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-theme bg-surface hover:border-theme/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-theme">Exclusive (Added on top)</span>
                      {chargeType === "exclusive" && <CheckCircle2 size={16} className="text-primary" />}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                      GST is added to the subtotal during checkout and billing (e.g. ₹500 dish + {gstPercentage}% GST = ₹{Math.round(500 * (1 + (gstPercentage/100)))} total). Recommended for restaurants.
                    </p>
                  </div>

                  <div
                    onClick={() => setChargeType("inclusive")}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      chargeType === "inclusive"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-theme bg-surface hover:border-theme/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-theme">Inclusive (Prices include GST)</span>
                      {chargeType === "inclusive" && <CheckCircle2 size={16} className="text-primary" />}
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                      Menu prices already include GST. The GST amount is shown as a tax breakup on the customer bill without adding extra cost.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill Simulation Preview */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles size={14} />
                  Live Bill Preview Example
                </div>
                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between text-secondary">
                    <span>Sample Order Subtotal</span>
                    <span className="font-semibold text-theme">₹{previewSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>
                      Taxes (GST {gstPercentage}% {chargeType === "inclusive" ? "inclusive" : "exclusive"})
                    </span>
                    <span className="font-semibold text-theme">₹{previewGst}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-theme pt-1 border-t border-theme/40">
                    <span>Final Bill Total</span>
                    <span>₹{previewTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Operations & Ordering Controls */}
      <section className="bg-surface rounded-2xl border border-theme shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-theme/60">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-theme">Ordering &amp; Operations</h2>
            <p className="text-xs text-secondary mt-0.5">
              Control ordering availability on customer digital menus and table QR codes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-theme bg-surface hover:bg-primary-light/5 transition-colors">
            <div>
              <p className="text-sm font-semibold text-theme">Accept QR &amp; Online Orders</p>
              <p className="text-xs text-secondary mt-0.5">
                When disabled, customers can view menu items but cannot place new orders from their phones.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={acceptOrders}
                onChange={(e) => setAcceptOrders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-theme bg-surface hover:bg-primary-light/5 transition-colors">
            <div>
              <p className="text-sm font-semibold text-theme">Restaurant Active Status</p>
              <p className="text-xs text-secondary mt-0.5">
                Mark restaurant as active or temporarily closed for maintenance.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-theme/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5"
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
