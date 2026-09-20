import { DUMMY_PAYMENT_QR } from "./paymentQr";
import { DEFAULT_PAYMENT_INSTRUCTIONS } from "./subscriptionConfig";
import { addDays, toISODate } from "../utils/dateUtils";

/**
 * DEV FLAGS - only for previewing the UI with dummy data. Remove once the real API is wired.
 *
 * scenario:
 *   "expiring" -> active, expires soon (warning)      "active"   -> healthy subscription
 *   "expired"  -> expired                             "pending"  -> renewal request under review
 *   "rejected" -> latest renewal request rejected     "none"     -> restaurant has no subscription (empty state)
 * apiError:         loading the page fails (error state + Retry)
 * missingPaymentQr: Super Admin hasn't configured a payment QR yet
 * submitError:      submitting a renewal fails (error toast)
 */
export const DEV_FLAGS = {
  scenario: "expiring",
  apiError: false,
  missingPaymentQr: false,
  submitError: false,
  latencyMs: 700,
};

// A tiny receipt-like image so dummy screenshots have something to show.
function makeScreenshot(name, amount) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">` +
    `<rect width="360" height="640" fill="#f3f4f6"/><rect x="20" y="60" width="320" height="420" rx="18" fill="#fff"/>` +
    `<circle cx="180" cy="130" r="32" fill="#22c55e"/><path d="M164 130l12 12 22-24" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="180" y="210" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#111827">Payment successful</text>` +
    `<text x="180" y="260" font-family="sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#111827">₹${amount}</text>` +
    `<text x="180" y="310" font-family="sans-serif" font-size="15" text-anchor="middle" fill="#6b7280">Paid to Restaurant Platform</text>` +
    `<text x="180" y="350" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#9ca3af">UPI Ref: 4${amount}20938451</text>` +
    `</svg>`;
  return { name, size: svg.length, type: "image/svg+xml", dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
}

const PLAN = { id: "sub-1", planName: "Premium Plan", billingCycle: "yearly", amount: 4999 };

const PERIODS = {
  active: { start: -120, expiry: 245 },
  expiring: { start: -353, expiry: 12 },
  pending: { start: -353, expiry: 12 },
  rejected: { start: -353, expiry: 12 },
  expired: { start: -395, expiry: -30 },
};

export function buildInitialData(scenario = DEV_FLAGS.scenario) {
  const now = new Date();
  const daysFromNow = (n) => addDays(now, n);
  const paymentConfig = {
    qrImage: DEV_FLAGS.missingPaymentQr ? null : DUMMY_PAYMENT_QR,
    payeeName: "Restaurant Platform Pvt. Ltd.",
    upiId: "platform@upi",
    instructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  };

  if (scenario === "none") return { subscription: null, paymentConfig, requests: [] };

  const period = PERIODS[scenario] || PERIODS.expiring;
  const subscription = {
    ...PLAN,
    startDate: toISODate(daysFromNow(period.start)),
    expiryDate: toISODate(daysFromNow(period.expiry)),
  };

  // Past renewals, newest first
  const requests = [
    {
      id: "rr-2",
      requestedAt: daysFromNow(period.start - 2).toISOString(),
      planName: PLAN.planName,
      amount: PLAN.amount,
      transactionRef: "UTR402938451",
      screenshot: makeScreenshot("payment-oct.png", PLAN.amount),
      status: "approved",
      reviewedAt: daysFromNow(period.start).toISOString(),
      reviewNote: "",
    },
    {
      id: "rr-1",
      requestedAt: daysFromNow(period.start - 6).toISOString(),
      planName: PLAN.planName,
      amount: PLAN.amount,
      transactionRef: "",
      screenshot: makeScreenshot("blurry-screenshot.png", 4500),
      status: "rejected",
      reviewedAt: daysFromNow(period.start - 5).toISOString(),
      reviewNote: "Amount paid (₹4500) does not match the renewal amount.",
    },
  ];

  if (scenario === "pending") {
    requests.unshift({
      id: "rr-3",
      requestedAt: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      planName: PLAN.planName,
      amount: PLAN.amount,
      transactionRef: "UTR509182736",
      screenshot: makeScreenshot("renewal-payment.png", PLAN.amount),
      status: "pending",
      reviewedAt: null,
      reviewNote: "",
    });
  }

  if (scenario === "rejected") {
    requests.unshift({
      id: "rr-3",
      requestedAt: daysFromNow(-1).toISOString(),
      planName: PLAN.planName,
      amount: PLAN.amount,
      transactionRef: "",
      screenshot: makeScreenshot("payment-screenshot.png", 4999),
      status: "rejected",
      reviewedAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      reviewNote: "We couldn't find this payment. Please upload a clear screenshot showing the transaction ID.",
    });
  }

  return { subscription, paymentConfig, requests };
}
