import { EXPIRY_WARNING_DAYS, SCREENSHOT_RULES } from "../data/subscriptionConfig";
import { diffCalendarDays, parseDate } from "./dateUtils";

export const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

/**
 * Derives the subscription state from its dates (the source of truth), so the badge
 * can never disagree with the expiry date.
 *  - expired  : expiry date is before today
 *  - expiring : EXPIRY_WARNING_DAYS or fewer days left (including "expires today")
 *  - active   : anything else
 */
export function getSubscriptionState(subscription, now = new Date()) {
  const daysRemaining = diffCalendarDays(subscription.expiryDate, now);
  const totalDays = Math.max(1, diffCalendarDays(subscription.expiryDate, subscription.startDate));
  const key = daysRemaining < 0 ? "expired" : daysRemaining <= EXPIRY_WARNING_DAYS ? "expiring" : "active";
  const progress = Math.min(1, Math.max(0, (totalDays - daysRemaining) / totalDays));
  return { key, daysRemaining, totalDays, progress };
}

export function formatDaysRemaining(daysRemaining) {
  if (daysRemaining < 0) {
    const ago = Math.abs(daysRemaining);
    return `Expired ${ago} ${ago === 1 ? "day" : "days"} ago`;
  }
  if (daysRemaining === 0) return "Expires today";
  return `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`;
}

/** Latest request decides the "renewal status"; at most one request can be pending. */
export function getRenewalState(requests) {
  const sorted = [...requests].sort((a, b) => parseDate(b.requestedAt) - parseDate(a.requestedAt));
  const latest = sorted[0] || null;
  const pending = sorted.find((r) => r.status === "pending") || null;
  return { key: pending ? "pending" : latest?.status ?? "none", latest, pending, hasPending: Boolean(pending) };
}

/** Returns an error message, or "" if the file is acceptable. */
export function validateScreenshot(file) {
  if (!file) return "Please choose a screenshot.";
  if (!SCREENSHOT_RULES.mimeTypes.includes(file.type)) return `Unsupported file type. Please upload ${SCREENSHOT_RULES.label}.`;
  if (file.size > SCREENSHOT_RULES.maxSizeMB * 1024 * 1024) return `File is too large. Maximum size is ${SCREENSHOT_RULES.maxSizeMB} MB.`;
  return "";
}

export const formatFileSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall back to the legacy method below
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
