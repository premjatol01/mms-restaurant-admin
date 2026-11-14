import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Button from "./ui/Button";
import { useSubscriptionPlan, FEATURE_INFO } from "../hooks/useSubscriptionPlan";

export default function FeatureLockedScreen({ featureKey, title, description, requiredTier }) {
  const navigate = useNavigate();
  const { planName, getRequiredPlan } = useSubscriptionPlan();

  const feature = FEATURE_INFO[featureKey] || {};
  const displayTitle = title || feature.name || "Premium Module";
  const displayDesc =
    description ||
    feature.description ||
    "This specialized module is part of our higher-tier subscription plans. Upgrade your restaurant package to unlock full access.";
  const displayTier = requiredTier || feature.tier || getRequiredPlan(featureKey) || "Pro Growth Plan";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-surface border border-theme rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-xs">
          <Lock size={30} className="relative z-10" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Plan Restriction Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 mb-4">
          <ShieldAlert size={13} />
          <span>Requires {displayTier}</span>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-theme mb-3">{displayTitle}</h2>
        <p className="text-sm text-secondary leading-relaxed mb-6 max-w-md mx-auto">
          {displayDesc}
        </p>

        {/* Current vs Required Plan Comparison Box */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-soft border border-theme rounded-xl text-left mb-6">
          <div className="p-2.5 rounded-lg bg-surface border border-theme">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Your Plan</span>
            <span className="text-sm font-bold text-theme truncate block mt-0.5">{planName}</span>
            <span className="text-[11px] text-red-500 font-medium block mt-1">Module Locked</span>
          </div>

          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/30">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">Unlocked In</span>
            <span className="text-sm font-bold text-theme truncate block mt-0.5">{displayTier}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 size={11} /> Ready to Activate
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </Button>

          <Button
            className="w-full sm:flex-1 font-semibold"
            onClick={() => navigate("/subscription")}
          >
            <span>Upgrade to {displayTier}</span>
            <ArrowRight size={15} className="ml-1" />
          </Button>
        </div>

        <p className="text-[11px] text-secondary mt-5">
          Have questions or need assistance? Visit{" "}
          <button
            onClick={() => navigate("/subscription")}
            className="text-primary hover:underline font-medium"
          >
            Subscription & Plans
          </button>{" "}
          to review all package tiers.
        </p>
      </div>
    </div>
  );
}
