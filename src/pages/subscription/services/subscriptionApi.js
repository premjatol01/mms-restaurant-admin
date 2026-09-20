import { DEV_FLAGS, buildInitialData } from "../data/subscriptionData";
import { addMonths, diffCalendarDays, toISODate } from "../utils/dateUtils";

/**
 * MOCK API - every function returns a Promise, exactly like the real endpoints will.
 * Replace the bodies with axios calls (GET /subscription, POST /subscription/renewals ...)
 * and nothing else in the module has to change.
 *
 * Note: the workflow is manual - there is NO payment gateway. The restaurant pays the
 * Super Admin's QR, uploads a screenshot, and the Super Admin verifies it.
 */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const apiError = (code, message) => Object.assign(new Error(message), { code });

let db = buildInitialData();

// Reset the in-memory "server" (used by tests / scenario switching)
export function __resetMockDb(scenario) {
  db = buildInitialData(scenario);
}

export async function getSubscriptionOverview() {
  await wait(DEV_FLAGS.latencyMs);
  if (DEV_FLAGS.apiError) throw apiError("SERVER_ERROR", "We couldn't load your subscription details.");
  return clone(db);
}

export async function submitRenewalRequest({ screenshot, transactionRef }) {
  await wait(DEV_FLAGS.latencyMs);
  if (DEV_FLAGS.submitError) throw apiError("SERVER_ERROR", "Something went wrong while submitting your request. Please try again.");
  if (!db.subscription) throw apiError("NO_SUBSCRIPTION", "No subscription found for this restaurant.");
  if (!db.paymentConfig.qrImage) throw apiError("PAYMENT_NOT_CONFIGURED", "Payment details are not available yet. Please contact support.");
  if (db.requests.some((r) => r.status === "pending")) {
    throw apiError("PENDING_EXISTS", "A renewal request is already pending review.");
  }
  if (!screenshot?.dataUrl) throw apiError("SCREENSHOT_REQUIRED", "Please upload your payment screenshot.");

  const request = {
    id: `rr-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    planName: db.subscription.planName,
    amount: db.subscription.amount,
    transactionRef: (transactionRef || "").trim(),
    screenshot,
    status: "pending",
    reviewedAt: null,
    reviewNote: "",
  };
  db.requests.unshift(request);
  return clone(request);
}

/**
 * STAND-IN FOR THE SUPER ADMIN APP - not used by any Restaurant Admin screen.
 * Approving extends the subscription; rejecting records the reason.
 */
export async function mockReviewRequest(id, decision, note = "") {
  const request = db.requests.find((r) => r.id === id);
  if (!request || request.status !== "pending") throw apiError("NOT_PENDING", "Only pending requests can be reviewed.");
  request.status = decision;
  request.reviewedAt = new Date().toISOString();
  request.reviewNote = decision === "rejected" ? note : "";

  if (decision === "approved" && db.subscription) {
    const sub = db.subscription;
    const months = { monthly: 1, quarterly: 3, yearly: 12 }[sub.billingCycle] ?? 12;
    const expired = diffCalendarDays(sub.expiryDate, new Date()) < 0;
    const base = expired ? new Date() : sub.expiryDate;
    if (expired) sub.startDate = toISODate(new Date()); // fresh period
    sub.expiryDate = toISODate(addMonths(base, months));
  }
  return clone(request);
}
