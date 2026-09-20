import { format } from "date-fns";
import { MONTHS, STATUS_LABELS, getReasonLabel } from "../constants";
import { getActiveQty, getCancelledAmount, getGrossAmount, isItemCancelled } from "./orderUtils";

const HEADER_FILL = "FFF29191"; // brand primary (#f29191)
const CURRENCY_FORMAT = '"₹"#,##0';

const joinUnique = (values) => [...new Set(values.filter(Boolean))].join("; ");

function paymentLabel(session) {
  if (!session) return "—";
  if (session.status !== "completed") return "Pending";
  return session.paymentStatus === "not_required" ? "No bill" : "Paid";
}

// Turns store data into plain rows. Kept separate from the workbook code so
// the numbers can be checked without loading the Excel library.
export function buildExportData({ orders, sessions, getTableName }) {
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const orderColumns = [
    { header: "Order #", key: "orderNumber", width: 12 },
    { header: "Date", key: "date", width: 13 },
    { header: "Time", key: "time", width: 11 },
    { header: "Table", key: "table", width: 11 },
    { header: "Session", key: "session", width: 12 },
    { header: "Source", key: "source", width: 11 },
    { header: "Customer Mobile", key: "mobile", width: 18 },
    { header: "Items (billed)", key: "items", width: 46 },
    { header: "Units Billed", key: "units", width: 13 },
    { header: "Gross Amount", key: "gross", width: 14, money: true },
    { header: "Cancelled Amount", key: "cancelled", width: 17, money: true },
    { header: "Discount", key: "discount", width: 11, money: true },
    { header: "Net Amount", key: "net", width: 13, money: true },
    { header: "Order Status", key: "status", width: 15 },
    { header: "Payment", key: "payment", width: 11 },
    { header: "Paid On", key: "paidOn", width: 19 },
    { header: "Cancelled Items", key: "cancelledItems", width: 34 },
    { header: "Cancellation Reason", key: "reason", width: 30 },
    { header: "Cancellation Comment", key: "comment", width: 34 },
  ];

  const itemColumns = [
    { header: "Order #", key: "orderNumber", width: 12 },
    { header: "Date", key: "date", width: 13 },
    { header: "Table", key: "table", width: 11 },
    { header: "Item", key: "item", width: 24 },
    { header: "Unit Price", key: "price", width: 12, money: true },
    { header: "Qty Ordered", key: "ordered", width: 13 },
    { header: "Qty Cancelled", key: "cancelledQty", width: 15 },
    { header: "Qty Billed", key: "billed", width: 12 },
    { header: "Billed Amount", key: "amount", width: 14, money: true },
    { header: "Item Status", key: "status", width: 15 },
    { header: "Cancellation Reason", key: "reason", width: 30 },
  ];

  const orderRows = [];
  const itemRows = [];

  sorted.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const session = sessionById.get(order.sessionId);
    const cancellations = order.cancellations || [];
    const date = format(createdAt, "yyyy-MM-dd");
    const table = getTableName(order.tableId);

    orderRows.push({
      orderNumber: order.orderNumber,
      date,
      time: format(createdAt, "hh:mm a"),
      table,
      session: session?.sessionNumber || "",
      source: order.source === "manual" ? "Manual" : "QR Menu",
      mobile: order.customer?.mobile || "",
      items: order.items
        .filter((item) => !isItemCancelled(item))
        .map((item) => `${item.name} × ${getActiveQty(item)}`)
        .join(", "),
      units: order.items.reduce((sum, item) => sum + getActiveQty(item), 0),
      gross: getGrossAmount(order),
      cancelled: getCancelledAmount(order),
      discount: order.discount || 0,
      net: order.total,
      status: STATUS_LABELS[order.status] || order.status,
      payment: paymentLabel(session),
      paidOn: session?.paidAt ? format(new Date(session.paidAt), "yyyy-MM-dd hh:mm a") : "",
      cancelledItems: cancellations
        .flatMap((entry) => entry.items.map((i) => `${i.name} × ${i.quantity}`))
        .join(", "),
      reason: joinUnique(cancellations.map((entry) => getReasonLabel(entry.reason))),
      comment: joinUnique(cancellations.map((entry) => entry.comment)),
    });

    order.items.forEach((item) => {
      const cancelledQty = item.cancelledQty || 0;
      const billed = getActiveQty(item);
      const reasons = cancellations
        .filter((entry) => entry.items.some((i) => i.itemId === item.id))
        .map((entry) => getReasonLabel(entry.reason));

      itemRows.push({
        orderNumber: order.orderNumber,
        date,
        table,
        item: item.name,
        price: item.price,
        ordered: item.quantity,
        cancelledQty,
        billed,
        amount: item.price * billed,
        status: STATUS_LABELS[item.status] || item.status,
        reason: joinUnique(reasons),
      });
    });
  });

  // Summary
  const sum = (fn) => sorted.reduce((total, order) => total + fn(order), 0);
  const count = (fn) => sorted.filter(fn).length;
  const collected = sum((order) => {
    const session = sessionById.get(order.sessionId);
    return session?.status === "completed" && session.paymentStatus === "successful" ? order.total : 0;
  });
  const sessionIds = new Set(sorted.map((order) => order.sessionId));
  const paidSessions = [...sessionIds].filter((id) => {
    const session = sessionById.get(id);
    return session?.status === "completed" && session.paymentStatus === "successful";
  }).length;

  const summary = [
    ["Total orders", sorted.length],
    ["Served", count((o) => o.status === "served")],
    ["Still open (Pending / Under Process)", count((o) => o.status === "pending" || o.status === "processing")],
    ["Fully cancelled", count((o) => o.status === "cancelled")],
    ["Partially cancelled", count((o) => o.status !== "cancelled" && getCancelledAmount(o) > 0)],
    ["Table sessions", sessionIds.size],
    ["Table sessions paid", paidSessions],
    ["Gross order value", sum(getGrossAmount), true],
    ["Cancelled / removed", sum(getCancelledAmount), true],
    ["Discounts", sum((o) => o.discount || 0), true],
    ["Net order value", sum((o) => o.total), true],
    ["Collected (paid sessions)", collected, true],
  ];

  return { summary, orderColumns, orderRows, itemColumns, itemRows };
}

function addTable(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
  rows.forEach((row) => sheet.addRow(row));

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  header.alignment = { vertical: "middle", wrapText: true };
  header.height = 22;

  columns.forEach((column, index) => {
    if (column.money) sheet.getColumn(index + 1).numFmt = CURRENCY_FORMAT;
  });
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
}

function download(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Builds and downloads "orders-YYYY-MM.xlsx" with three sheets:
// Summary, Orders (one row per order) and Order Items (one row per item).
// `month` is 0-based (0 = January).
export async function exportOrdersToExcel({ orders, sessions, getTableName, month, year }) {
  const data = buildExportData({ orders, sessions, getTableName });

  // Loaded on demand so the Excel library isn't part of the main bundle.
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Restaurant Admin";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [{ width: 38 }, { width: 18 }];
  const title = summarySheet.addRow([`Orders report – ${MONTHS[month]} ${year}`]);
  title.font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  data.summary.forEach(([label, value, isMoney]) => {
    const row = summarySheet.addRow([label, value]);
    row.getCell(2).alignment = { horizontal: "right" };
    if (isMoney) row.getCell(2).numFmt = CURRENCY_FORMAT;
  });

  addTable(workbook, "Orders", data.orderColumns, data.orderRows);
  addTable(workbook, "Order Items", data.itemColumns, data.itemRows);

  const buffer = await workbook.xlsx.writeBuffer();
  download(buffer, `orders-${year}-${String(month + 1).padStart(2, "0")}.xlsx`);
}
