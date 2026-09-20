import { create } from "zustand";
import {
  defaultTables,
  defaultQRCodes,
  defaultSubscription,
  defaultQRLayouts,
} from "../pages/tables-qr/data/tablesQRData";
import { linkQRToTable, unlinkQRFromTable } from "../pages/tables-qr/utils/qrRules";

// Unique even when two records are created in the same millisecond
let idSeq = 0;
const newId = (prefix) => `${prefix}-${Date.now()}-${++idSeq}`;

/**
 * Table <-> QR mapping rules (all enforced here, never in the UI):
 *  - The ONLY way to change a mapping is assignQRToTable / unassignQRFromTable
 *    (assignQR / unassignQR are aliases). Both sides are always updated together.
 *  - A QR can only be assigned if it is free and visible to this restaurant.
 *  - addTable / updateTable / deleteTable never touch other tables' mappings.
 */
export const useTablesQRStore = create((set, get) => ({
  tables: [...defaultTables],
  qrCodes: [...defaultQRCodes],
  subscription: defaultSubscription,
  qrLayouts: defaultQRLayouts,
  loading: false,

  // ------------------------------------------------------------------ Tables
  // Appends a table. If a QR is given it is linked atomically through the same
  // rules as any other assignment. Returns { table, qrAssigned }.
  addTable: (table) => {
    const newTable = {
      id: newId("table"),
      tableId: table.tableId,
      status: table.status || "active",
      qrCodeId: null,
    };
    set((state) => ({ tables: [...state.tables, newTable] }));
    const qrAssigned = table.qrCodeId ? get().assignQRToTable(newTable.id, table.qrCodeId) : false;
    return { table: newTable, qrAssigned };
  },

  // QR mapping is deliberately NOT editable here (use assign / unassign).
  updateTable: (id, data) => {
    const safe = { ...data };
    delete safe.qrCodeId;
    delete safe.id;
    set((state) => ({ tables: state.tables.map((t) => (t.id === id ? { ...t, ...safe } : t)) }));
  },

  deleteTable: (id) =>
    set((state) => {
      const table = state.tables.find((t) => t.id === id);
      return {
        tables: state.tables.filter((t) => t.id !== id),
        qrCodes: state.qrCodes.map((qr) =>
          qr.tableId === id || qr.id === table?.qrCodeId ? { ...qr, tableId: null, status: "available" } : qr
        ),
      };
    }),

  // ------------------------------------------------------------- Assignment
  // Return true when the mapping changed, false when it was refused
  // (QR not free / not visible / unknown ids / already assigned).
  assignQRToTable: (tableId, qrCodeId) => {
    const next = linkQRToTable(get(), tableId, qrCodeId);
    if (!next) return false;
    set(next);
    return true;
  },

  unassignQRFromTable: (tableId) => {
    const next = unlinkQRFromTable(get(), tableId);
    if (!next) return false;
    set(next);
    return true;
  },

  // Aliases kept for existing callers (note the argument order).
  assignQR: (qrId, tableId) => get().assignQRToTable(tableId, qrId),
  unassignQR: (qrId) => {
    const qr = get().qrCodes.find((q) => q.id === qrId);
    return qr?.tableId ? get().unassignQRFromTable(qr.tableId) : false;
  },

  // -------------------------------------------------------------- QR codes
  // QR codes are provisioned outside this screen now (the QR Codes tab is gone);
  // these stay for other consumers and can no longer corrupt mappings.
  addQRCode: (qr) => {
    const { tableId, ...rest } = qr;
    const newQR = { restaurantId: null, ...rest, id: newId("qr"), tableId: null, status: "available" };
    set((state) => ({
      qrCodes: [...state.qrCodes, newQR],
      subscription:
        qr.type === "premium"
          ? { ...state.subscription, premiumQR: { ...state.subscription.premiumQR, used: state.subscription.premiumQR.used + 1 } }
          : state.subscription,
    }));
    if (tableId) get().assignQRToTable(tableId, newQR.id);
    return newQR;
  },

  updateQRCode: (id, data) =>
    set((state) => ({
      qrCodes: state.qrCodes.map((qr) => {
        if (qr.id !== id) return qr;
        const safe = { ...data };
        delete safe.tableId; // mapping only via assign / unassign
        if (qr.tableId) delete safe.status; // an assigned QR stays "assigned"
        return { ...qr, ...safe };
      }),
    })),

  // Only unassigned QRs can be switched between available <-> inactive.
  toggleQRStatus: (id) =>
    set((state) => ({
      qrCodes: state.qrCodes.map((qr) => {
        if (qr.id !== id || qr.tableId) return qr;
        return { ...qr, status: qr.status === "inactive" ? "available" : "inactive" };
      }),
    })),
}));
