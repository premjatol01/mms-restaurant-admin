import { create } from "zustand";

const defaultTables = [
  { id: "table-1", tableId: "Table 01", status: "active", qrCodeId: "qr-1" },
  { id: "table-2", tableId: "Table 02", status: "active", qrCodeId: "qr-2" },
  { id: "table-3", tableId: "Table 03", status: "active", qrCodeId: null },
  { id: "table-4", tableId: "Table 04", status: "inactive", qrCodeId: "qr-4" },
  { id: "table-5", tableId: "Table 05", status: "active", qrCodeId: "qr-5" },
  { id: "table-6", tableId: "Table 06", status: "active", qrCodeId: null },
  { id: "table-7", tableId: "Table 07", status: "inactive", qrCodeId: null },
  { id: "table-8", tableId: "Table 08", status: "active", qrCodeId: "qr-8" },
];

const defaultQRCodes = [
  { id: "qr-1", name: "QR-001", type: "default", layout: "classic", status: "assigned", tableId: "table-1" },
  { id: "qr-2", name: "QR-002", type: "premium", layout: "modern", status: "assigned", tableId: "table-2" },
  { id: "qr-3", name: "QR-003", type: "paid", layout: "elegant", status: "available", tableId: null },
  { id: "qr-4", name: "QR-004", type: "default", layout: "classic", status: "assigned", tableId: "table-4" },
  { id: "qr-5", name: "QR-005", type: "premium", layout: "modern", status: "assigned", tableId: "table-5" },
  { id: "qr-6", name: "QR-006", type: "default", layout: "elegant", status: "available", tableId: null },
  { id: "qr-7", name: "QR-007", type: "premium", layout: "classic", status: "inactive", tableId: null },
  { id: "qr-8", name: "QR-008", type: "paid", layout: "modern", status: "assigned", tableId: "table-8" },
];

const subscription = {
  defaultQR: { unlimited: true, available: true },
  premiumQR: { total: 5, used: 3, available: 2 },
  paidQR: { available: true, price: 99 },
};

const qrLayouts = [
  { id: "classic", name: "Classic", description: "Traditional QR design" },
  { id: "modern", name: "Modern", description: "Sleek contemporary design" },
  { id: "elegant", name: "Elegant", description: "Premium minimal design" },
];

export const useTablesQRStore = create((set, get) => ({
  tables: [...defaultTables],
  qrCodes: [...defaultQRCodes],
  subscription,
  qrLayouts,
  loading: false,

  // Table operations
  addTable: (table) => set((state) => ({
    tables: [...state.tables, { ...table, id: `table-${Date.now()}`, qrCodeId: table.qrCodeId || null, status: table.status || "active" }]
  })),

  updateTable: (id, data) => set((state) => ({
    tables: state.tables.map((t) => t.id === id ? { ...t, ...data } : t)
  })),

  deleteTable: (id) => set((state) => {
    const table = state.tables.find((t) => t.id === id);
    return {
      tables: state.tables.filter((t) => t.id !== id),
      qrCodes: state.qrCodes.map((qr) => 
        qr.tableId === id ? { ...qr, tableId: null, status: "available" } : qr
      )
    };
  }),

  assignQRToTable: (tableId, qrCodeId) => set((state) => {
    const oldQR = state.qrCodes.find((qr) => qr.tableId === tableId);
    const newQR = state.qrCodes.find((qr) => qr.id === qrCodeId);
    return {
      tables: state.tables.map((t) => t.id === tableId ? { ...t, qrCodeId } : t),
      qrCodes: state.qrCodes.map((qr) => {
        if (qr.id === qrCodeId) return { ...qr, tableId, status: "assigned" };
        if (oldQR && qr.id === oldQR.id) return { ...qr, tableId: null, status: "available" };
        return qr;
      })
    };
  }),

  unassignQRFromTable: (tableId) => set((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    return {
      tables: state.tables.map((t) => t.id === tableId ? { ...t, qrCodeId: null } : t),
      qrCodes: state.qrCodes.map((qr) => 
        qr.id === table?.qrCodeId ? { ...qr, tableId: null, status: "available" } : qr
      )
    };
  }),

  // QR operations
  addQRCode: (qr) => set((state) => {
    const newQR = { ...qr, id: `qr-${Date.now()}`, status: qr.tableId ? "assigned" : "available" };
    const isPremium = qr.type === "premium";
    return {
      qrCodes: [...state.qrCodes, newQR],
      subscription: isPremium ? {
        ...state.subscription,
        premiumQR: { ...state.subscription.premiumQR, used: state.subscription.premiumQR.used + 1 }
      } : state.subscription
    };
  }),

  updateQRCode: (id, data) => set((state) => ({
    qrCodes: state.qrCodes.map((qr) => qr.id === id ? { ...qr, ...data } : qr)
  })),

  assignQR: (qrId, tableId) => set((state) => {
    const oldQR = state.qrCodes.find((qr) => qr.tableId === tableId);
    return {
      qrCodes: state.qrCodes.map((qr) => {
        if (qr.id === qrId) return { ...qr, tableId, status: "assigned" };
        if (oldQR && qr.id === oldQR.id) return { ...qr, tableId: null, status: "available" };
        return qr;
      }),
      tables: state.tables.map((t) => t.id === tableId ? { ...t, qrCodeId: qrId } : t)
    };
  }),

  unassignQR: (qrId) => set((state) => {
    const qr = state.qrCodes.find((q) => q.id === qrId);
    return {
      qrCodes: state.qrCodes.map((q) => q.id === qrId ? { ...q, tableId: null, status: "available" } : q),
      tables: state.tables.map((t) => t.id === qr?.tableId ? { ...t, qrCodeId: null } : t)
    };
  }),

  toggleQRStatus: (id) => set((state) => ({
    qrCodes: state.qrCodes.map((qr) => 
      qr.id === id ? { ...qr, status: qr.status === "active" ? "inactive" : "active" } : qr
    )
  })),
}));