import { useState } from "react";
import { Check, Crown, Zap, IndianRupee, Layers, ArrowUpRight, Sparkles, Gift } from "lucide-react";
import Button from "../../../components/ui/Button";

const FEATURE_NAMES = {
  qr: "Digital QR Menu & Ordering",
  qr_menu: "Digital QR Menu & Contactless Ordering",
  plain_qr: "Printable QR Code Generation & PNG Downloads",
  premium_qr: "Custom Branded QR Standee Templates",
  designer_qr: "Custom Branded Designer QR Standee Templates",
  sharp_download: "High-Res Sharp PNG & ZIP Batch Downloads",
  additional_qr: "Multi-Zone QR Codes",
  table_sessions: "Live Table Sessions & Bill Calculation",
  waiter_request: "Request Waiter Handler (Call, Water, Bill)",
  live_orders: "Live Kitchen Display & Order Management",
  table_games: "Interactive Table Games (Trivia, Dare Spin, Tic-Tac-Toe)",
  website: "Dedicated Restaurant Website & Subdomain",
  inquiry: "Customer Inquiries & Lead Capture",
  offers: "Special Offers & Promotional Banners",
  offers_promos: "Promotional Offers & Coupon Code Engine",
  social_campaign: "Instagram Follow & Win 10% Discount Campaign",
  wifi_sharing: "Guest Wi-Fi QR Code Sharing",
  google_review: "Google Review Booster (Boost 5-Star Dine-In Ratings)",
  biz_growth: "Biz Growth Hub & Masterclasses",
  ai_prompts: "AI Menu Engineering & Smart Prompts",
  multi_staff: "Multi-Staff & Role Access Control",
  gst_reports: "Advanced Billing, GST Management & Sales Reports",
  design_requests: "Custom QR Standee Graphic Design Requests",
  vip_support: "Dedicated Account Manager & 24/7 VIP Support",
  priority_support: "Priority WhatsApp & Phone Support",
  email_support: "Email & Community Support",
  trial_full_access: "Full Platform Access for 30 Days",
};

export default function AvailablePlansSection({ packages = [], currentSubscription, onSelectPackage }) {
  const [selectedDuration, setSelectedDuration] = useState("1_month");

  const durationOptions = [
    { key: "1_month", label: "1 Month (30 Days)", days: 30 },
    { key: "6_months", label: "6 Months (180 Days)", days: 180 },
    { key: "12_months", label: "1 Year (365 Days)", days: 365, badge: "Best Value" },
  ];

  const currentPlanName = (currentSubscription?.packageName || currentSubscription?.planName || "").toLowerCase();

  return (
    <div id="available-packages-section" className="bg-surface rounded-xl border border-theme p-6 space-y-6 shadow-sm">
      {/* Header & Duration Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-theme">Subscription Packages</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              1-Month Free Trial Available
            </span>
          </div>
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

      {/* Packages Grid: 4 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {packages.map((pkg) => {
          const isFreeTrial = pkg.price === 0 || pkg.name.toLowerCase().includes("trial");
          const isCurrentPlan = currentPlanName === pkg.name.toLowerCase() || (isFreeTrial && currentPlanName.includes("trial"));

          // Match pricing tier for selected duration
          let pricingTier = null;
          if (isFreeTrial) {
            pricingTier = pkg.pricing?.[0] || {
              duration: "free_trial",
              durationDays: 30,
              durationDisplay: "1 Month Free Trial (30 Days)",
              price: 0,
            };
          } else {
            pricingTier =
              pkg.pricing?.find((p) => p.duration === selectedDuration) ||
              pkg.pricing?.[0] || {
                duration: selectedDuration,
                durationDays: selectedDuration === "12_months" ? 365 : selectedDuration === "6_months" ? 180 : 30,
                durationDisplay: selectedDuration === "12_months" ? "12 Months / 1 Year" : selectedDuration === "6_months" ? "6 Months (180 Days)" : "1 Month (30 Days)",
                price: pkg.price || 0,
              };
          }

          const isPopular = pkg.name.toLowerCase().includes("growth") || pkg.name.toLowerCase() === "standard" || (!isFreeTrial && pricingTier?.isPopular);

          return (
            <div
              key={pkg._id || pkg.id || pkg.name}
              className={`relative rounded-xl border-2 p-5 flex flex-col justify-between transition-all ${
                isCurrentPlan
                  ? "border-primary bg-primary-light/10 shadow-sm"
                  : isPopular
                  ? "border-primary/60 bg-surface shadow-md"
                  : isFreeTrial
                  ? "border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10"
                  : "border-theme bg-surface hover:border-primary/40"
              }`}
            >
              <div>
                {/* Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-theme">{pkg.name}</h3>
                    <p className="text-[11px] text-secondary mt-0.5 line-clamp-2">{pkg.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isCurrentPlan && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary text-white shadow-xs">
                        <Crown size={10} /> Current
                      </span>
                    )}
                    {isFreeTrial && !isCurrentPlan && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white shadow-xs">
                        <Gift size={10} /> 1 Mo Free
                      </span>
                    )}
                    {isPopular && !isCurrentPlan && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white shadow-xs">
                        <Zap size={10} /> Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Capacity Box */}
                <div className="py-2.5 px-3 my-2 rounded-lg bg-primary-light/20 border border-theme/40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-theme">
                      {isFreeTrial ? "₹0" : `₹${Number(pricingTier.price).toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      {isFreeTrial ? "/ 30 Days Free" : `/ ${pricingTier.durationDisplay}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-1">
                    <Layers size={12} />
                    <span>Up to {pkg.maxTables || 15} Tables Allowed</span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-1.5 my-3">
                  <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Features Included:</p>
                  <ul className="space-y-1.5">
                    {(pkg.features || []).map((featKey) => (
                      <li key={featKey} className="flex items-start gap-1.5 text-xs text-theme">
                        <Check size={13} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="leading-snug">{FEATURE_NAMES[featKey] || featKey}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-theme/60">
                <Button
                  variant={isCurrentPlan ? "secondary" : isFreeTrial ? "primary" : "primary"}
                  className="w-full text-xs font-bold"
                  onClick={() => onSelectPackage(pkg, pricingTier)}
                >
                  {isCurrentPlan ? "Current Plan Active" : isFreeTrial ? "Activate 1 Month Free Trial" : "Select Package"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
