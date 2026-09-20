import { QR_TYPE_META, CURRENT_RESTAURANT_ID } from "../data/tablesQRData";

/**
 * Custom QR codes belong to one restaurant and are only visible to it.
 * Default / premium / paid QR codes come from the shared pool.
 */
export const isQRVisibleToRestaurant = (qr, restaurantId = CURRENT_RESTAURANT_ID) =>
  qr.type !== "custom" || qr.restaurantId === restaurantId;

/**
 * A QR is "free" only if it is available AND nothing references it:
 * neither its own tableId nor any table's qrCodeId.
 */
export const isQRFree = (qr, tables) =>
  qr.status === "available" && !qr.tableId && !tables.some((t) => t.qrCodeId === qr.id);

/** QR codes that may be offered in an assignment dropdown. */
export const getFreeQRCodes = (qrCodes, tables, restaurantId = CURRENT_RESTAURANT_ID) =>
  qrCodes.filter((qr) => isQRVisibleToRestaurant(qr, restaurantId) && isQRFree(qr, tables));

/** Tables that currently have a QR, paired with that QR (what "Download All" exports). */
export const getAssignedPairs = (tables, qrCodes, restaurantId = CURRENT_RESTAURANT_ID) =>
  tables
    .map((table) => ({ table, qr: qrCodes.find((qr) => qr.id === table.qrCodeId) }))
    .filter(({ qr }) => qr && isQRVisibleToRestaurant(qr, restaurantId));

export const formatQROption = (qr) => {
  const layout = qr.layout.charAt(0).toUpperCase() + qr.layout.slice(1);
  return `${qr.name} (${QR_TYPE_META[qr.type]?.label ?? qr.type}) - ${layout}`;
};

/**
 * Pure mapping change: link `qrId` to `tableId`, releasing the table's previous QR.
 * Returns the next { tables, qrCodes }, or null if the change isn't allowed
 * (unknown ids, QR not free, QR not visible to this restaurant, or no-op).
 */
export function linkQRToTable({ tables, qrCodes }, tableId, qrId, restaurantId = CURRENT_RESTAURANT_ID) {
  const table = tables.find((t) => t.id === tableId);
  const qr = qrCodes.find((q) => q.id === qrId);
  if (!table || !qr) return null;
  if (table.qrCodeId === qrId) return null;
  if (!isQRVisibleToRestaurant(qr, restaurantId) || !isQRFree(qr, tables)) return null;

  return {
    tables: tables.map((t) => (t.id === tableId ? { ...t, qrCodeId: qrId } : t)),
    qrCodes: qrCodes.map((q) => {
      if (q.id === qrId) return { ...q, tableId, status: "assigned" };
      if (q.id === table.qrCodeId) return { ...q, tableId: null, status: "available" };
      return q;
    }),
  };
}

/** Pure: release whatever QR the table holds. Returns null if it has none. */
export function unlinkQRFromTable({ tables, qrCodes }, tableId) {
  const table = tables.find((t) => t.id === tableId);
  if (!table?.qrCodeId) return null;
  return {
    tables: tables.map((t) => (t.id === tableId ? { ...t, qrCodeId: null } : t)),
    qrCodes: qrCodes.map((q) =>
      q.id === table.qrCodeId ? { ...q, tableId: null, status: "available" } : q
    ),
  };
}

/** Both sides of every mapping must agree. Returns a list of problems (empty = healthy). */
export function findMappingProblems({ tables, qrCodes }) {
  const problems = [];
  tables.forEach((t) => {
    if (!t.qrCodeId) return;
    const qr = qrCodes.find((q) => q.id === t.qrCodeId);
    if (!qr) problems.push(`${t.id} points at missing ${t.qrCodeId}`);
    else if (qr.tableId !== t.id || qr.status !== "assigned") problems.push(`${t.id} -> ${qr.id} but QR says ${qr.tableId}/${qr.status}`);
  });
  qrCodes.forEach((q) => {
    if (!q.tableId) return;
    const t = tables.find((x) => x.id === q.tableId);
    if (!t || t.qrCodeId !== q.id) problems.push(`${q.id} -> ${q.tableId} but table says ${t?.qrCodeId}`);
  });
  const seen = new Set();
  tables.forEach((t) => {
    if (t.qrCodeId && seen.has(t.qrCodeId)) problems.push(`${t.qrCodeId} used by more than one table`);
    if (t.qrCodeId) seen.add(t.qrCodeId);
  });
  return problems;
}
