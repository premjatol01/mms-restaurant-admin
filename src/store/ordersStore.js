import { create } from "zustand";
import { ordersApi } from "../api/orders.api";
import { useTablesQRStore } from "./tablesQRStore";
import { TABLE_NAMES } from "../pages/orders/data/ordersData";
import {
  applyCancellation,
  getSessionDiscount,
  getSessionGst,
  getSessionOrders,
  getSessionSubtotal,
  getSessionTotal,
  getUnresolvedItems,
  isItemCancellable,
  isItemCancelled,
  recalcOrder,
} from "../pages/orders/utils/orderUtils";

const EDITABLE_STATUSES = ["pending", "processing", "served"];

// Normalizers
const normOrder = (order) => {
  if (!order) return order;
  const { _id, ...rest } = order;
  const id = _id?.toString?.() || _id || rest.id;
  const tableId =
    typeof rest.tableId === "object"
      ? rest.tableId?._id?.toString?.() || rest.tableId?.tableId || rest.tableId
      : rest.tableId;
  const sessionId =
    typeof rest.sessionId === "object"
      ? rest.sessionId?._id?.toString?.() || rest.sessionId?.id || rest.sessionId
      : rest.sessionId;
  const items = (rest.items || []).map((item) => {
    const itemId = item._id?.toString?.() || item._id || item.id;
    return { ...item, id: itemId };
  });
  return { ...rest, id, _id: id, tableId, sessionId, items };
};

const normSession = (session) => {
  if (!session) return session;
  const { _id, ...rest } = session;
  const id = _id?.toString?.() || _id || rest.id;
  const tableId =
    typeof rest.tableId === "object"
      ? rest.tableId?._id?.toString?.() || rest.tableId?.tableId || rest.tableId
      : rest.tableId;
  const orderIds = (rest.orderIds || []).map((o) =>
    typeof o === "object" ? o._id?.toString?.() || o.id : o
  );
  return { ...rest, id, _id: id, tableId, orderIds };
};

// Keeps each open session's total in step with its orders including 5% GST
const syncSessionTotals = (sessions, orders) =>
  sessions.map((session) => {
    const sOrders = getSessionOrders(session, orders);
    const subtotal = session.subtotal ?? getSessionSubtotal(sOrders);
    const discount = session.discount ?? getSessionDiscount(sOrders);
    const gst = session.gst ?? Math.round(subtotal * 0.05);
    const total = session.total ?? Math.max(0, subtotal + gst - discount);
    return {
      ...session,
      subtotal,
      discount,
      gst,
      total,
    };
  });

// Applies `fn` to a single order and re-derives its totals / status.
const mapOrder = (orders, orderId, fn) =>
  orders.map((order) => (order.id === orderId ? recalcOrder(fn(order)) : order));

export const useOrdersStore = create((set, get) => ({
  orders: [],
  sessions: [],
  completedSessions: [],
  loading: false,
  loaded: false,

  // -------------------------------------------------------------------------
  // Fetching live data from API
  // -------------------------------------------------------------------------
  fetchData: async () => {
    try {
      const [ordersRes, sessionsRes] = await Promise.all([
        ordersApi.getOrders(),
        ordersApi.getSessions(),
      ]);
      const allOrders = (ordersRes.data?.data || []).map(normOrder);
      const allSessions = (sessionsRes.data?.data || []).map(normSession);

      const activeSessions = allSessions.filter((s) => s.status === "active");
      const completedSessions = allSessions.filter((s) => s.status === "completed");

      set({
        orders: allOrders,
        sessions: syncSessionTotals(activeSessions, allOrders),
        completedSessions,
        loading: false,
        loaded: true,
      });
    } catch (err) {
      console.error("Failed to fetch orders/sessions:", err);
      set({ loading: false });
    }
  },

  // -------------------------------------------------------------------------
  // Creating orders (QR menu + manual orders from the admin)
  // -------------------------------------------------------------------------
  addOrder: async (orderPayload) => {
    try {
      const res = await ordersApi.createManualOrder(orderPayload);
      await get().fetchData();
      return { ok: true, data: res.data?.data };
    } catch (err) {
      console.error("Failed to create manual order:", err);
      return { ok: false, error: err.response?.data?.message || err.message };
    }
  },

  // -------------------------------------------------------------------------
  // Status updates (manual, by the restaurant admin)
  // -------------------------------------------------------------------------

  // Moves every item that is still on the order to `status`.
  updateOrderStatus: async (orderId, status) => {
    if (!EDITABLE_STATUSES.includes(status)) return;
    set((state) => ({
      orders: mapOrder(state.orders, orderId, (order) => ({
        ...order,
        items: order.items.map((item) => (isItemCancelled(item) ? item : { ...item, status })),
      })),
    }));
    try {
      await ordersApi.updateOrderStatus(orderId, status);
      await get().fetchData();
    } catch (err) {
      console.error("Failed to update order status:", err);
      await get().fetchData();
    }
  },

  // Changes a single item; the order status follows from its items.
  updateItemStatus: async (orderId, itemId, status) => {
    if (!EDITABLE_STATUSES.includes(status)) return;
    set((state) => ({
      orders: mapOrder(state.orders, orderId, (order) => ({
        ...order,
        items: order.items.map((item) =>
          item.id === itemId && !isItemCancelled(item) ? { ...item, status } : item
        ),
      })),
    }));
    try {
      await ordersApi.updateItemStatus(orderId, itemId, status);
      await get().fetchData();
    } catch (err) {
      console.error("Failed to update item status:", err);
      await get().fetchData();
    }
  },

  // Marks everything still open in a session as served.
  serveAllInSession: async (sessionId) => {
    try {
      await ordersApi.serveAllInSession(sessionId);
      await get().fetchData();
    } catch (err) {
      console.error("Failed to serve all in session:", err);
      await get().fetchData();
    }
  },

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------
  cancelOrderItems: async (orderId, selections, meta) => {
    try {
      await ordersApi.cancelOrderItems(orderId, { selections, ...meta });
      await get().fetchData();
    } catch (err) {
      console.error("Failed to cancel order items:", err);
      await get().fetchData();
    }
  },

  cancelOrder: async (orderId, meta) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    const selections = order.items
      .filter(isItemCancellable)
      .map((item) => ({ itemId: item.id, quantity: item.quantity - (item.cancelledQty || 0) }));
    await get().cancelOrderItems(orderId, selections, meta);
  },

  removeItem: async (orderId, itemId, meta) => {
    const order = get().orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!item || !isItemCancellable(item)) return;
    await get().cancelOrderItems(
      orderId,
      [{ itemId: item.id, quantity: item.quantity - (item.cancelledQty || 0) }],
      meta
    );
  },

  // -------------------------------------------------------------------------
  // Payment
  // -------------------------------------------------------------------------
  markSessionPaid: async (sessionId, force = false) => {
    try {
      const res = await ordersApi.markSessionPaid(sessionId, force);
      await get().fetchData();
      return { ok: true, total: res.data?.data?.total || 0 };
    } catch (err) {
      console.error("Failed to mark session as paid:", err);
      return {
        ok: false,
        reason: err.response?.data?.reason || "error",
        message: err.response?.data?.message || err.message,
      };
    }
  },

  // -------------------------------------------------------------------------
  // Selectors / helpers
  // -------------------------------------------------------------------------
  getOrdersBySession: (sessionId) => {
    const { sessions, completedSessions, orders } = get();
    const session =
      sessions.find((s) => s.id === sessionId) ||
      completedSessions.find((s) => s.id === sessionId);
    return session ? getSessionOrders(session, orders) : [];
  },

  getTableName: (tableId) => {
    if (!tableId) return "Unknown Table";
    if (typeof tableId === "object") {
      return (
        tableId.tableNo ||
        tableId.tableId ||
        (tableId.number ? `Table ${tableId.number}` : "Table")
      );
    }
    const tables = useTablesQRStore.getState().tables || [];
    const found = tables.find(
      (t) =>
        String(t.id) === String(tableId) ||
        String(t._id) === String(tableId) ||
        String(t.tableId) === String(tableId)
    );
    if (found) {
      return (
        found.tableNo ||
        found.tableId ||
        (found.number ? `Table ${found.number}` : String(tableId))
      );
    }
    return TABLE_NAMES[tableId] || String(tableId);
  },
}));
