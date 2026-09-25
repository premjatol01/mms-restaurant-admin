// Dummy data for the Table Configuration tab. Replace with the real API response later.

export const DUMMY_QR_TEMPLATES = [
  { id: "tpl-1", name: "Classic Standard", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template1" },
  { id: "tpl-2", name: "Modern Outline", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template2" },
  { id: "tpl-3", name: "Elegant Minimal", image: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Template3" },
];

// Start empty to see the first-time "Set Up Tables" flow.
export const DUMMY_TABLES = [];

export const createDummyQr = (templateId = "tpl-1") => {
  const code = `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return { code, type: templateId, url: `${window.location.origin}/order?qr=${code}` };
};

export const createDummyTable = (number, withQr, templateId = "tpl-1") => ({
  id: `table-${number}-${Math.random().toString(36).slice(2, 6)}`,
  number,
  label: `Table ${number}`,
  qrCode: withQr ? createDummyQr(qrType) : null,
});
