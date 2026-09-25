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
  { id: "qr-1", name: "QR-001", type: "template", layout: "tpl-1", status: "assigned", tableId: "table-1", restaurantId: null },
  { id: "qr-2", name: "QR-002", type: "template", layout: "tpl-2", status: "assigned", tableId: "table-2", restaurantId: null },
  { id: "qr-4", name: "QR-004", type: "template", layout: "tpl-1", status: "assigned", tableId: "table-4", restaurantId: null },
  { id: "qr-5", name: "QR-005", type: "template", layout: "tpl-2", status: "assigned", tableId: "table-5", restaurantId: null },
  { id: "qr-8", name: "QR-008", type: "template", layout: "tpl-3", status: "assigned", tableId: "table-8", restaurantId: null },
];

export const defaultSubscription = {
  defaultQR: { unlimited: true, available: true },
};

export const defaultQRLayouts = [
  { id: "tpl-1", name: "Classic Standard", description: "Traditional QR design", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template1" },
  { id: "tpl-2", name: "Modern Outline", description: "Sleek contemporary design", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template2" },
  { id: "tpl-3", name: "Elegant Minimal", description: "Premium minimal design", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template3" },
];
