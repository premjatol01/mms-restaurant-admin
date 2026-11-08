import { useState } from "react";
import { Check, Crown, Zap, IndianRupee, Layers, ArrowUpRight } from "lucide-react";
import Button from "../../../components/ui/Button";

const FEATURE_NAMES = {
  qr: "Digital QR Menu & Ordering",
  premium_qr: "Custom QR Stand Templates",
  additional_qr: "Multi-Zone QR Codes",
  website: "Branded Restaurant Website",
  inquiry: "Customer Inquiries & Leads",
  offers: "Promotions, Banners & Offers",
  google_review: "Google Review Growth Integration",
};

export default function AvailablePlansSection({ packages = [], currentSubscription, onSelectPackage }) {
  const [selectedDuration, setSelectedDuration] = useState("1_month");

  const durationOptions = [
    { key: "1_month", label: "1 Month (30 Days)", days: 30 },
    { key: "6_months", label: "6 Months (180 Days)", days: 180 },
    { key: "12_months", label: "1 Year (365 Days)", days: 365, badge: "Best Value" },
  ];

  const currentPlanName = currentSubscription?.packageName || currentSubscription?.planName || "";

  return (
    <div id="available-packages-section" className="bg-surface rounded-xl border border-theme p-6 space-y-6 shadow-sm">
      {/* Header & Duration Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-4">
        <div>
          <h2 className="text-lg font-bold text-theme">Subscription Packages</h2>
          <p className="text-xs text-secondary mt-0.5">
            Select any package according to your restaurant table capacity and feature requirements.
          </p>
        </div>

        {/* Duration selector tabs */}
        <div className="inline-flex p-1 bg-primary-light/40 border border-theme rounded-xl self-start sm:self-auto">
          {durationOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedDuration(opt.key)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === opt.key
                  ? "bg-surface text-theme shadow-sm border border-theme/40"
                  : "text-secondary hover:text-theme"
              }`}
            >
              {opt.label}
              {opt.badge && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-primary text-white font-bold">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const isCurrentPlan = currentPlanName.toLowerCase() === pkg.name.toLowerCase();

          // Match pricing tier for selected duration
          const pricingTier =
            pkg.pricing?.find((p) => p.duration === selectedDuration) ||
            pkg.pricing?.[0] || {
              duration: selectedDuration,
              durationDays: selectedDuration === "12_months" ? 365 : selectedDuration === "6_months" ? 180 : 30,
              durationDisplay: selectedDuration === "12_months" ? "12 Months / 1 Year" : selectedDuration === "6_months" ? "6 Months (180 Days)" : "1 Month (30 Days)",
              price: pkg.price || 0,
            };

          const isPopular = pkg.name.toLowerCase() === "standard" || pricingTier.isPopular;

          return (
            <div
              key={pkg._id || pkg.id || pkg.name}
              className={`relative rounded-xl border-2 p-5 flex flex-col justify-between transition-all ${
                isCurrentPlan
                  ? "border-primary bg-primary-light/10 shadow-sm"
                  : isPopular
                  ? "border-primary/60 bg-surface shadow-md"
                  : "border-theme bg-surface hover:border-primary/40"
              }`}
            >
              {/* Badges */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-theme">{pkg.name}</h3>
                  <p className="text-xs text-secondary mt-0.5 line-clamp-2">{pkg.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isCurrentPlan && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-primary text-white shadow-xs">
                      <Crown size={11} /> Current
                    </span>
                  )}
                  {isPopular && !isCurrentPlan && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white shadow-xs">
                      <Zap size={11} /> Popular
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Capacity Box */}
              <div className="py-3 px-3.5 my-2 rounded-lg bg-primary-light/20 border border-theme/40">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-theme">
                    ₹{Number(pricingTier.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-secondary font-medium">/ {pricingTier.durationDisplay}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-1.5">
                  <Layers size={13} />
                  <span>Up to {pkg.maxTables || 15} Tables Allowed</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 my-4 flex-1">
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Features Included:</p>
                <ul className="space-y-1.5">
                  {(pkg.features || []).map((featKey) => (
                    <li key={featKey} className="flex items-center gap-2 text-xs text-theme">
                      <Check size={13} className="text-green-600 dark:text-green-400 shrink-0" strokeWidth={2.5} />
                      <span>{FEATURE_NAMES[featKey] || featKey}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                variant={isCurrentPlan ? "secondary" : "primary"}
                className="w-full mt-2"
                onClick={() => onSelectPackage(pkg, pricingTier)}
              >
                {isCurrentPlan ? "Renew This Plan" : `Buy ${pkg.name} Plan`}
                <ArrowUpRight size={14} />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
