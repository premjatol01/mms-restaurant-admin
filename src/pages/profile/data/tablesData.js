// Dummy data for the Table Configuration tab. Replace with the real API response later.

// Start empty to see the first-time "Set Up Tables" flow.
// Add entries like { id: "t-1", number: 1, label: "Table 1", qrCode: { code: "QR-AB12CD", url: "..." } }
// (qrCode: null for a table without a QR code) to start with tables already configured.
export const DUMMY_TABLES = [];

export const createDummyQr = () => {
  const code = `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return { code, url: `${window.location.origin}/order?qr=${code}` };
};

export const createDummyTable = (number, withQr) => ({
  id: `table-${number}-${Math.random().toString(36).slice(2, 6)}`,
  number,
  label: `Table ${number}`,
  qrCode: withQr ? createDummyQr() : null,
});
