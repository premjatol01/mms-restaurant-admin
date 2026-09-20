// Pure helpers for orders and table sessions. No React, no store access, so
// they can be reused by the store, the components and the Excel export.

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

// Units of an item that are still part of the bill (not cancelled).
export const getActiveQty = (item) => item.quantity - (item.cancelledQty || 0);

export const isItemCancelled = (item) => getActiveQty(item) <= 0;

// Items the kitchen still owes the customer.
export const isItemUnresolved = (item) =>
  !isItemCancelled(item) && (item.status === "pending" || item.status === "processing");

// Items that can still be cancelled / removed (anything not cancelled or served).
export const isItemCancellable = (item) =>
  !isItemCancelled(item) && item.status !== "served";

export const getItemsAmount = (items) =>
  items.reduce((sum, item) => sum + item.price * getActiveQty(item), 0);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

// Order status is always derived from its items:
//   nothing left            -> cancelled
//   every item served       -> served
//   every item still waiting-> pending
//   anything in between     -> processing ("Under Process")
export function deriveOrderStatus(items) {
  const live = items.filter((item) => !isItemCancelled(item));
  if (live.length === 0) return "cancelled";
  if (live.every((item) => item.status === "served")) return "served";
  if (live.every((item) => item.status === "pending")) return "pending";
  return "processing";
}

// Recomputes subtotal / total / status after any change to the items.
export function recalcOrder(order) {
  const subtotal = getItemsAmount(order.items);
  const discount = Math.min(order.discount || 0, subtotal);
  return {
    ...order,
    subtotal,
    discount,
    total: subtotal - discount,
    status: deriveOrderStatus(order.items),
  };
}

export const canCancelOrder = (order) => order.items.some(isItemCancellable);

export const getCancelledAmount = (order) =>
  order.items.reduce((sum, item) => sum + item.price * (item.cancelledQty || 0), 0);

export const getGrossAmount = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// Cancels the given quantities and records why. `selections` is
// [{ itemId, quantity }]. Served or already-cancelled items are ignored.
// Returns the same order object when nothing was actually cancelled.
export function applyCancellation(order, selections, { reason, comment } = {}) {
  const cancelled = [];

  const items = order.items.map((item) => {
    const selection = selections.find((s) => s.itemId === item.id);
    if (!selection || !isItemCancellable(item)) return item;

    const quantity = Math.min(Math.max(0, selection.quantity), getActiveQty(item));
    if (quantity === 0) return item;

    const cancelledQty = (item.cancelledQty || 0) + quantity;
    cancelled.push({ itemId: item.id, name: item.name, quantity, price: item.price });
    return {
      ...item,
      cancelledQty,
      status: cancelledQty >= item.quantity ? "cancelled" : item.status,
    };
  });

  if (cancelled.length === 0) return order;

  const updated = recalcOrder({ ...order, items });
  const previous = order.cancellations || [];
  const entry = {
    id: `${order.id}-cx-${previous.length + 1}`,
    at: new Date().toISOString(),
    // "full" = the order has nothing left; otherwise the order carries on.
    type: updated.status === "cancelled" ? "full" : "partial",
    reason: reason || "other",
    comment: (comment || "").trim(),
    items: cancelled,
    amount: cancelled.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };

  return { ...updated, cancellations: [...previous, entry] };
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const getSessionOrders = (session, orders) =>
  session.orderIds
    .map((id) => orders.find((o) => o.id === id))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

export const getSessionTotal = (sessionOrders) =>
  sessionOrders.reduce((sum, order) => sum + order.total, 0);

// Every pending / under-process item across the session's orders.
export function getUnresolvedItems(sessionOrders) {
  const result = [];
  sessionOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (isItemUnresolved(item)) result.push({ order, item });
    });
  });
  return result;
}

// ---------------------------------------------------------------------------
// Numbering
// ---------------------------------------------------------------------------

// Next number after the highest one already used, e.g. ["#1001", "#1007"] -> 1008.
export function nextSequence(labels, start) {
  const highest = labels.reduce((max, label) => {
    const n = parseInt(String(label).replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, start - 1);
  return highest + 1;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
