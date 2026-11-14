import { useEffect } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useProfileStore } from "../store/profileStore";

export const FEATURE_INFO = {
  qr_menu: {
    name: "Digital QR Menu & Ordering",
    tier: "Starter Plan",
    description: "Contactless digital menu scanning, item modifiers, and table order placing.",
  },
  designer_qr: {
    name: "Branded Designer QR Standees",
    tier: "Pro Growth Plan",
    description: "Custom restaurant logo, colors, and premium printable acrylic standee templates.",
  },
  sharp_download: {
    name: "Sharp High-Res PNG / ZIP Export",
    tier: "Starter Plan",
    description: "300 DPI print-ready QR codes for table stands and marketing material.",
  },
  table_sessions: {
    name: "Live Table Sessions & Bill Calculation",
    tier: "Starter Plan",
    description: "Real-time table tracking, order tallying, and automatic session closing.",
  },
  waiter_request: {
    name: "Request Waiter Handler",
    tier: "Starter Plan",
    description: "Instant diner service calls for water refills, bill requests, and captain calls.",
  },
  live_orders: {
    name: "Live Kitchen Order Display (KOT)",
    tier: "Starter Plan",
    description: "Real-time kitchen management with sound chimes and instant status dispatch.",
  },
  table_games: {
    name: "Interactive Table Games Hub",
    tier: "Pro Growth Plan",
    description: "Keep diners entertained with Foodie Trivia, Dare & Spin, and Tic-Tac-Toe.",
  },
  trivia_game: {
    name: "Foodie Trivia Showdown",
    tier: "Pro Growth Plan",
    description: "Multiplayer table quiz showdown with timed questions and podium rewards.",
  },
  dare_spin: {
    name: "Table Dare & Spin Wheel",
    tier: "Pro Growth Plan",
    description: "Dinner table spinning wheel icebreaker with humorous culinary dares.",
  },
  tictactoe: {
    name: "Table Tic-Tac-Toe vs Chef Bot",
    tier: "Pro Growth Plan",
    description: "Classic 3x3 table game against friends or intelligent AI Chef Bot.",
  },
  offers_promos: {
    name: "Offers & Promo Code Engine",
    tier: "Pro Growth Plan",
    description: "Create table coupon discounts, percentage cuts, and banner announcements.",
  },
  social_campaign: {
    name: "Instagram Follow & Win 10% Off",
    tier: "Pro Growth Plan",
    description: "Incentivize diners to follow your Instagram to unlock instant dining discounts.",
  },
  wifi_sharing: {
    name: "Guest Wi-Fi QR Code Sharing",
    tier: "Pro Growth Plan",
    description: "One-tap secure guest Wi-Fi connection directly from the mobile table portal.",
  },
  google_review: {
    name: "Google Review 5-Star Booster",
    tier: "Pro Growth Plan",
    description: "Automated prompts to satisfied diners to leave 5-star Google reviews.",
  },
  biz_growth: {
    name: "Biz Growth Hub & Masterclasses",
    tier: "Pro Growth Plan",
    description: "Curated restaurant playbooks, video masterclasses, and revenue strategies.",
  },
  website: {
    name: "Restaurant Website & Subdomain",
    tier: "Starter Plan",
    description: "Branded online web page at yourbrand.tablly.com with menu showcase.",
  },
  ai_prompts: {
    name: "AI Menu Engineering Assistant",
    tier: "Enterprise Plan",
    description: "AI-generated dish descriptions, pairing prompts, and marketing copy.",
  },
  multi_staff: {
    name: "Multi-Staff & Role Access Control",
    tier: "Enterprise Plan",
    description: "Granular permissions for kitchen staff, waiters, managers, and administrators.",
  },
  gst_reports: {
    name: "GST Billing, Taxes & Detailed Reports",
    tier: "Enterprise Plan",
    description: "Automated GST invoices, revenue breakdown, and exportable order audit trails.",
  },
  design_requests: {
    name: "Custom Graphic Design Requests",
    tier: "Enterprise Plan",
    description: "Dedicated graphic designer service for customized table standee artwork.",
  },
};

export function useSubscriptionPlan() {
  const subscription = useSubscriptionStore((s) => s.subscription);
  const profile = useProfileStore((s) => s.profile);

  const sub = subscription || profile?.subscription || {};
  const planName = sub.packageName || sub.planName || "Starter Plan";
  const rawFeatures = sub.features || sub.package?.features || [];

  const lowerPlan = planName.toLowerCase();
  const isTrial = lowerPlan.includes("trial") || lowerPlan.includes("free");
  const isStarter = lowerPlan.includes("starter") || lowerPlan.includes("basic");
  const isPro = lowerPlan.includes("pro") || lowerPlan.includes("growth") || lowerPlan.includes("standard");
  const isEnterprise = lowerPlan.includes("enterprise") || lowerPlan.includes("premium");

  // Table limits
  const maxTables =
    sub.maxTables ||
    (isStarter ? 10 : isTrial ? 15 : isPro ? 35 : isEnterprise ? 100 : 15);

  const isExpired = sub.status === "expired" || sub.isExpired;
  const daysRemaining = sub.daysRemaining ?? 30;

  const hasFeature = (featureKey) => {
    if (!featureKey) return true;
    // 1 Month Free Trial and Enterprise Plan get full access to all features
    if (isTrial || isEnterprise) return true;

    // Direct check against features list from database
    if (Array.isArray(rawFeatures) && rawFeatures.includes(featureKey)) {
      return true;
    }

    // Role/tier based fallback checks
    if (isStarter) {
      return [
        "qr_menu",
        "sharp_download",
        "table_sessions",
        "waiter_request",
        "live_orders",
        "website",
      ].includes(featureKey);
    }

    if (isPro) {
      // Pro Growth has all Starter features + Games, Offers, Social, WiFi, Reviews, Biz Growth, Designer QR
      return ![
        "ai_prompts",
        "multi_staff",
        "gst_reports",
        "design_requests",
      ].includes(featureKey);
    }

    return false;
  };

  const getRequiredPlan = (featureKey) => {
    return FEATURE_INFO[featureKey]?.tier || "Pro Growth Plan";
  };

  return {
    subscription: sub,
    planName,
    maxTables,
    isTrial,
    isStarter,
    isPro,
    isEnterprise,
    isExpired,
    daysRemaining,
    features: rawFeatures,
    hasFeature,
    getRequiredPlan,
  };
}
