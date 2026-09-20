// Dummy data for the Orders module.
// Replace these exports with API responses when the backend is ready.
//
// Timestamps are generated relative to "now" so the demo always has orders
// from today (for the Pending / Sessions tabs) and about 2.5 months of paid
// history (so the month / year Excel export has something to export).

import { applyCancellation, getSessionTotal, recalcOrder } from "../utils/orderUtils";

// ---------------------------------------------------------------------------
// Tables & menu
// ---------------------------------------------------------------------------
export const TABLES = [
  { id: "table-1", name: "Table 01" },
  { id: "table-2", name: "Table 02" },
  { id: "table-3", name: "Table 03" },
  { id: "table-4", name: "Table 04" },
  { id: "table-5", name: "Table 05" },
  { id: "table-6", name: "Table 06" },
  { id: "table-7", name: "Table 07" },
  { id: "table-8", name: "Table 08" },
];

export const TABLE_NAMES = Object.fromEntries(TABLES.map((t) => [t.id, t.name]));

const MENU = {
  "item-1": { name: "Margherita Pizza", price: 299 },
  "item-2": { name: "Veggie Supreme", price: 349 },
  "item-3": { name: "Chicken Burger", price: 249 },
  "item-4": { name: "Veg Burger", price: 199 },
  "item-5": { name: "French Fries", price: 99 },
  "item-6": { name: "Garlic Bread", price: 79 },
  "item-7": { name: "Cold Coffee", price: 149 },
  "item-9": { name: "Butter Chicken", price: 349 },
  "item-10": { name: "Paneer Tikka", price: 299 },
  "item-12": { name: "Gulab Jamun", price: 69 },
};

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

// lines: [{ menuItemId, quantity, status? }]
// cancel (optional): { lines: [{ index, quantity }], reason, comment }
function makeOrder({ id, orderNumber, tableId, sessionId, source = "qr", mobile = null, createdAt, lines, cancel }) {
  let order = recalcOrder({
    id,
    orderNumber,
    tableId,
    sessionId,
    source,
    customer: { mobile },
    items: lines.map((line, index) => ({
      id: `${id}-i${index + 1}`,
      menuItemId: line.menuItemId,
      name: MENU[line.menuItemId].name,
      price: MENU[line.menuItemId].price,
      quantity: line.quantity,
      cancelledQty: 0,
      status: line.status || "pending",
    })),
    discount: 0,
    createdAt,
    cancellations: [],
  });

  if (cancel) {
    order = applyCancellation(
      order,
      cancel.lines.map((l) => ({ itemId: `${id}-i${l.index + 1}`, quantity: l.quantity })),
      { reason: cancel.reason, comment: cancel.comment }
    );
    // Log the cancellation a few minutes after the order was placed.
    order.cancellations = order.cancellations.map((entry) => ({
      ...entry,
      at: new Date(new Date(createdAt).getTime() + 6 * 60000).toISOString(),
    }));
  }
  return order;
}

// ---------------------------------------------------------------------------
// Today: orders and sessions that are still open
// ---------------------------------------------------------------------------
const activeOrders = [
  // Table 05 – three orders in different states (pending, under process, served)
  makeOrder({
    id: "order-1001", orderNumber: "#1001", tableId: "table-5", sessionId: "session-5",
    createdAt: minutesAgo(42),
    lines: [
      { menuItemId: "item-1", quantity: 1 },
      { menuItemId: "item-5", quantity: 1 },
      { menuItemId: "item-7", quantity: 1 },
    ],
  }),
  makeOrder({
    id: "order-1002", orderNumber: "#1002", tableId: "table-5", sessionId: "session-5",
    mobile: "+91 98765 43210", createdAt: minutesAgo(33),
    lines: [
      { menuItemId: "item-3", quantity: 2, status: "processing" },
      { menuItemId: "item-7", quantity: 1, status: "processing" },
    ],
  }),
  makeOrder({
    id: "order-1003", orderNumber: "#1003", tableId: "table-5", sessionId: "session-5",
    source: "manual", createdAt: minutesAgo(25),
    lines: [{ menuItemId: "item-9", quantity: 1, status: "served" }],
  }),

  // Table 03 – one order waiting, one under process with a partial cancellation
  makeOrder({
    id: "order-1004", orderNumber: "#1004", tableId: "table-3", sessionId: "session-3",
    mobile: "+91 91234 56789", createdAt: minutesAgo(28),
    lines: [
      { menuItemId: "item-2", quantity: 1 },
      { menuItemId: "item-6", quantity: 1 },
    ],
  }),
  makeOrder({
    id: "order-1005", orderNumber: "#1005", tableId: "table-3", sessionId: "session-3",
    createdAt: minutesAgo(15),
    lines: [
      { menuItemId: "item-10", quantity: 1, status: "processing" },
      { menuItemId: "item-12", quantity: 2, status: "processing" },
    ],
    cancel: {
      lines: [{ index: 1, quantity: 1 }],
      reason: "customer_request",
      comment: "Only one dessert needed.",
    },
  }),

  // Table 08 – everything served, ready for payment
  makeOrder({
    id: "order-1006", orderNumber: "#1006", tableId: "table-8", sessionId: "session-8",
    createdAt: minutesAgo(20),
    lines: [
      { menuItemId: "item-4", quantity: 2, status: "served" },
      { menuItemId: "item-5", quantity: 1, status: "served" },
    ],
  }),

  // Table 02 – brand-new session, just ordered
  makeOrder({
    id: "order-1007", orderNumber: "#1007", tableId: "table-2", sessionId: "session-2",
    createdAt: minutesAgo(4),
    lines: [
      { menuItemId: "item-1", quantity: 2 },
      { menuItemId: "item-6", quantity: 1 },
    ],
  }),
];

const makeActiveSession = (id, number, tableId, orderIds, startedMinutesAgo) => ({
  id,
  sessionNumber: number,
  tableId,
  status: "active",
  paymentStatus: "pending",
  orderIds,
  startedAt: minutesAgo(startedMinutesAgo),
  closedAt: null,
  paidAt: null,
  total: getSessionTotal(orderIds.map((oid) => activeOrders.find((o) => o.id === oid))),
});

const activeSessions = [
  makeActiveSession("session-5", "#S-1005", "table-5", ["order-1001", "order-1002", "order-1003"], 45),
  makeActiveSession("session-3", "#S-1004", "table-3", ["order-1004", "order-1005"], 30),
  makeActiveSession("session-8", "#S-1003", "table-8", ["order-1006"], 22),
  makeActiveSession("session-2", "#S-1006", "table-2", ["order-1007"], 5),
];

// ---------------------------------------------------------------------------
// History: paid & closed sessions over roughly the last 75 days
// ---------------------------------------------------------------------------

// Small seeded random generator so the history is the same on every reload.
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory() {
  const rand = mulberry32(2026);
  const menuIds = Object.keys(MENU);
  const orders = [];
  const sessions = [];
  let orderSeq = 100;
  let sessionSeq = 100;

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  for (let day = 75; day >= 1; day--) {
    const sessionsThatDay = Math.floor(rand() * 3); // 0, 1 or 2

    for (let s = 0; s < sessionsThatDay; s++) {
      const start = new Date(midnight);
      start.setDate(start.getDate() - day);
      start.setHours(12 + Math.floor(rand() * 9), Math.floor(rand() * 60), 0, 0);

      sessionSeq += 1;
      const sessionId = `session-h${sessionSeq}`;
      const tableId = TABLES[Math.floor(rand() * TABLES.length)].id;
      const orderCount = 1 + Math.floor(rand() * 3);
      const sessionOrders = [];

      for (let o = 0; o < orderCount; o++) {
        orderSeq += 1;
        const createdAt = new Date(start.getTime() + o * 18 * 60000).toISOString();

        const picked = new Set();
        const lineCount = 1 + Math.floor(rand() * 3);
        while (picked.size < lineCount) picked.add(menuIds[Math.floor(rand() * menuIds.length)]);
        const lines = [...picked].map((menuItemId) => ({
          menuItemId,
          quantity: 1 + Math.floor(rand() * 2),
          status: "served",
        }));

        // ~5% fully cancelled, ~9% with one line removed.
        const roll = rand();
        let cancel;
        if (roll < 0.05) {
          lines.forEach((line) => { line.status = "pending"; });
          cancel = {
            lines: lines.map((line, index) => ({ index, quantity: line.quantity })),
            reason: "customer_request",
            comment: "Customer left before the order was prepared.",
          };
        } else if (roll < 0.14 && lines.length > 1) {
          lines[0].status = "pending";
          cancel = {
            lines: [{ index: 0, quantity: lines[0].quantity }],
            reason: "item_unavailable",
            comment: "",
          };
        }

        const order = makeOrder({
          id: `order-h${orderSeq}`,
          orderNumber: `#${orderSeq}`,
          tableId,
          sessionId,
          source: rand() < 0.8 ? "qr" : "manual",
          mobile: rand() < 0.35 ? `+91 9${Math.floor(100000000 + rand() * 899999999)}` : null,
          createdAt,
          lines,
          cancel,
        });
        orders.push(order);
        sessionOrders.push(order);
      }

      const total = getSessionTotal(sessionOrders);
      const closedAt = new Date(start.getTime() + (orderCount * 18 + 35) * 60000).toISOString();
      sessions.push({
        id: sessionId,
        sessionNumber: `#S-${sessionSeq}`,
        tableId,
        status: "completed",
        paymentStatus: total > 0 ? "successful" : "not_required",
        orderIds: sessionOrders.map((order) => order.id),
        startedAt: start.toISOString(),
        closedAt,
        paidAt: closedAt,
        total,
      });
    }
  }

  return { orders, sessions };
}

const history = buildHistory();

// ---------------------------------------------------------------------------
// What the store starts with
// ---------------------------------------------------------------------------
export const initialOrders = [...history.orders, ...activeOrders];
export const initialSessions = activeSessions;
export const initialCompletedSessions = history.sessions;
