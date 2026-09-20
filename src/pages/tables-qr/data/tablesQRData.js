// Dummy data + constants for the Tables & QR module.

// TODO: replace with the logged-in restaurant's id (from your auth / profile store).
export const CURRENT_RESTAURANT_ID = "rest-1";

export const defaultTables = [
  { id: "table-1", tableId: "Table 01", status: "active", qrCodeId: "qr-1" },
  { id: "table-2", tableId: "Table 02", status: "active", qrCodeId: "qr-2" },
  { id: "table-3", tableId: "Table 03", status: "active", qrCodeId: null },
  { id: "table-4", tableId: "Table 04", status: "inactive", qrCodeId: "qr-4" },
  { id: "table-5", tableId: "Table 05", status: "active", qrCodeId: "qr-5" },
  { id: "table-6", tableId: "Table 06", status: "active", qrCodeId: null },
  { id: "table-7", tableId: "Table 07", status: "inactive", qrCodeId: null },
  { id: "table-8", tableId: "Table 08", status: "active", qrCodeId: "qr-8" },
];

// restaurantId: null = shared pool (default / premium / paid QRs).
// Custom QRs belong to ONE restaurant and are only visible to it.
export const defaultQRCodes = [
  { id: "qr-1", name: "QR-001", type: "default", layout: "classic", status: "assigned", tableId: "table-1", restaurantId: null },
  { id: "qr-2", name: "QR-002", type: "premium", layout: "modern", status: "assigned", tableId: "table-2", restaurantId: null },
  { id: "qr-3", name: "QR-003", type: "paid", layout: "elegant", status: "available", tableId: null, restaurantId: null },
  { id: "qr-4", name: "QR-004", type: "default", layout: "classic", status: "assigned", tableId: "table-4", restaurantId: null },
  { id: "qr-5", name: "QR-005", type: "premium", layout: "modern", status: "assigned", tableId: "table-5", restaurantId: null },
  { id: "qr-6", name: "QR-006", type: "default", layout: "elegant", status: "available", tableId: null, restaurantId: null },
  { id: "qr-7", name: "QR-007", type: "premium", layout: "classic", status: "inactive", tableId: null, restaurantId: null },
  { id: "qr-8", name: "QR-008", type: "paid", layout: "modern", status: "assigned", tableId: "table-8", restaurantId: null },
  // Custom QR provisioned for THIS restaurant -> visible
  { id: "qr-9", name: "QR-009", type: "custom", layout: "elegant", status: "available", tableId: null, restaurantId: "rest-1" },
  // Custom QR provisioned for ANOTHER restaurant -> must never show up here
  { id: "qr-10", name: "QR-010", type: "custom", layout: "modern", status: "available", tableId: null, restaurantId: "rest-2" },
];

export const defaultSubscription = {
  defaultQR: { unlimited: true, available: true },
  premiumQR: { total: 5, used: 3, available: 2 },
  paidQR: { available: true, price: 99 },
};

export const defaultQRLayouts = [
  { id: "classic", name: "Classic", description: "Traditional QR design" },
  { id: "modern", name: "Modern", description: "Sleek contemporary design" },
  { id: "elegant", name: "Elegant", description: "Premium minimal design" },
];

export const QR_TYPE_META = {
  default: { label: "Default", className: "bg-blue-100 text-blue-700" },
  premium: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  paid: { label: "Paid", className: "bg-amber-100 text-amber-700" },
  custom: { label: "Custom", className: "bg-pink-100 text-pink-700" },
};
