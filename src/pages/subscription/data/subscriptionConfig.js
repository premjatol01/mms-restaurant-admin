// Constants for the Subscription module.

// Show the "expiring soon" warning when this many days (or fewer) remain.
export const EXPIRY_WARNING_DAYS = 15;

export const SUBSCRIPTION_STATUS = {
  active: {
    label: "Active",
    badge: "bg-green-100 text-green-700",
    panel: "bg-green-50 border-green-300",
    accent: "text-green-700",
    bar: "bg-green-500",
  },
  expiring: {
    label: "Expiring Soon",
    badge: "bg-amber-100 text-amber-700",
    panel: "bg-amber-50 border-amber-300",
    accent: "text-amber-700",
    bar: "bg-amber-500",
  },
  expired: {
    label: "Expired",
    badge: "bg-red-100 text-red-700",
    panel: "bg-red-50 border-red-300",
    accent: "text-red-700",
    bar: "bg-red-500",
  },
};

export const RENEWAL_STATUS = {
  none: { label: "No Request", badge: "bg-gray-100 text-gray-500" },
  pending: { label: "Pending Review", badge: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved / Activated", badge: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", badge: "bg-red-100 text-red-700" },
};

export const SCREENSHOT_RULES = {
  maxSizeMB: 5,
  mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  accept: "image/png,image/jpeg,image/webp",
  label: "PNG, JPG or WEBP up to 5 MB",
};

export const BILLING_CYCLE_LABELS = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

// Used when the Super Admin hasn't configured custom instructions. {amount} is replaced at render time.
export const DEFAULT_PAYMENT_INSTRUCTIONS = [
  "Open any UPI app (Google Pay, PhonePe, Paytm, BHIM) and scan the QR code.",
  "Pay exactly {amount}. Payments with a different amount may be rejected.",
  "Take a screenshot of the successful payment. It should show the amount, date/time and transaction ID.",
  "Upload the screenshot below and submit your renewal request.",
  "Our team will verify the payment and activate your renewal.",
];

/**
 * Available plans catalog — shown in the "Available Plans" section.
 * tier: lower number = lower plan. Used to decide Upgrade vs Downgrade label.
 */
export const AVAILABLE_PLANS = [
  {
    id: "PKG-001",
    name: "Basic",
    tier: 1,
    duration: 30,
    durationDisplay: "30 Days",
    amount: 999,
    billingCycle: "monthly",
    description: "Essential tools to get your restaurant online.",
    features: [
      "QR Menu",
      "Restaurant Website",
    ],
  },
  {
    id: "PKG-002",
    name: "Standard",
    tier: 2,
    duration: 90,
    durationDisplay: "90 Days",
    amount: 2499,
    billingCycle: "quarterly",
    description: "Advanced features to grow your restaurant.",
    features: [
      "QR Menu",
      "Premium QR",
      "Restaurant Website",
      "Customer Inquiry",
      "Offers & Promotions",
      "Google Review Integration",
    ],
    popular: true,
  },
  {
    id: "PKG-003",
    name: "Premium",
    tier: 3,
    duration: 365,
    durationDisplay: "1 Year",
    amount: 4999,
    billingCycle: "yearly",
    description: "Full suite for high-volume restaurants.",
    features: [
      "QR Menu",
      "Premium QR",
      "Additional QR Code",
      "Restaurant Website",
      "Customer Inquiry",
      "Offers & Promotions",
      "Google Review Integration",
    ],
  },
];
