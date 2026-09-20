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
