// Shared constants for the Orders module.

// ---------------------------------------------------------------------------
// Statuses
// ---------------------------------------------------------------------------
// The same four statuses are used for orders and for individual items.
//   pending    -> received, kitchen has not started
//   processing -> "Under Process"
//   served     -> handed over to the customer
//   cancelled  -> fully cancelled / removed
export const STATUS_LABELS = {
  pending: "Pending",
  processing: "Under Process",
  served: "Served",
  cancelled: "Cancelled",
};

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  served: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

// Statuses the admin can set manually on an item.
export const ITEM_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Under Process" },
  { value: "served", label: "Served" },
];

// ---------------------------------------------------------------------------
// Cancellation
// ---------------------------------------------------------------------------
export const CANCEL_REASONS = [
  { value: "customer_request", label: "Customer changed their mind" },
  { value: "item_unavailable", label: "Item not available" },
  { value: "out_of_stock", label: "Ingredient out of stock" },
  { value: "delay", label: "Taking too long to prepare" },
  { value: "wrong_order", label: "Wrong / duplicate order" },
  { value: "other", label: "Other" },
];

export const getReasonLabel = (value) =>
  CANCEL_REASONS.find((r) => r.value === value)?.label || value || "—";

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
// Buttons (same look as the drawers' footer buttons). Usage: btn("primary"),
// btn("danger", "lg"). Page-level actions use the shared <Button /> instead.
const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SIZES = { sm: "px-3 py-1.5", lg: "px-4 py-2.5" };
const BTN_TONES = {
  primary: "bg-primary text-white hover:opacity-90",
  success: "bg-green-500 text-white hover:opacity-90",
  danger: "bg-red-500 text-white hover:opacity-90",
  outline: "border border-theme text-theme hover:bg-gray-500/10",
  outlineDanger: "border border-red-300 text-red-600 hover:bg-red-500/10",
};

export const btn = (tone, size = "sm") => `${btnBase} ${BTN_SIZES[size]} ${BTN_TONES[tone]}`;

export const ICON_BTN =
  "p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-500/10 transition-colors";

// Soft brand-colour tints. Written as arbitrary values so they always resolve
// from the theme variables in index.css.
export const TINT = "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";
export const TINT_SOFT = "bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]";

// Text field used by the modals (textarea / native select).
export const FIELD =
  "w-full rounded-lg border border-theme bg-surface text-theme px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]";

// Compact native <select> used to change an item's status inline.
export const SELECT_SM =
  "rounded-md border border-theme bg-surface text-theme text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]";
