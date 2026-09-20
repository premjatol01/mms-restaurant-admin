import { create } from "zustand";
import {
  initialOrders,
  initialSessions,
  initialCompletedSessions,
  TABLE_NAMES,
} from "../pages/orders/data/ordersData";
import {
  applyCancellation,
  getSessionOrders,
  getSessionTotal,
  getUnresolvedItems,
  isItemCancellable,
  isItemCancelled,
  nextSequence,
  recalcOrder,
} from "../pages/orders/utils/orderUtils";

const EDITABLE_STATUSES = ["pending", "processing", "served"];

// Keeps each open session's total in step with its orders.
const syncSessionTotals = (sessions, orders) =>
  sessions.map((session) => ({
    ...session,
    total: getSessionTotal(getSessionOrders(session, orders)),
  }));

// Applies `fn` to a single order and re-derives its totals / status.
const mapOrder = (orders, orderId, fn) =>
  orders.map((order) => (order.id === orderId ? recalcOrder(fn(order)) : order));

export const useOrdersStore = create((set, get) => ({
  orders: [...initialOrders],
  sessions: [...initialSessions],
  completedSessions: [...initialCompletedSessions],
  loading: false,

  // -------------------------------------------------------------------------
  // Creating orders (QR menu + manual orders from the admin)
  // -------------------------------------------------------------------------
  addOrder: (order) =>
    set((state) => {
      const id = "order-" + Date.now();
      const orderNumber = "#" + nextSequence(state.orders.map((o) => o.orderNumber), 1001);

      let sessions = [...state.sessions];
      let session = sessions.find((s) => s.tableId === order.tableId && s.status === "active");

      if (!session) {
        const sessionLabels = [...state.sessions, ...state.completedSessions].map((s) => s.sessionNumber);
        session = {
          id: "session-" + Date.now(),
          sessionNumber: "#S-" + nextSequence(sessionLabels, 1001),
          tableId: order.tableId,
          status: "active",
          paymentStatus: "pending",
          orderIds: [],
          startedAt: new Date().toISOString(),
          closedAt: null,
          paidAt: null,
          total: 0,
        };
        sessions.push(session);
      }

      const newOrder = recalcOrder({
        ...order,
        id,
        orderNumber,
        sessionId: session.id,
        discount: order.discount || 0,
        createdAt: new Date().toISOString(),
        cancellations: [],
        // Every new order starts as Pending.
        items: order.items.map((item, index) => ({
          ...item,
          id: item.id || `${id}-i${index + 1}`,
          status: "pending",
          cancelledQty: 0,
        })),
      });

      const orders = [...state.orders, newOrder];
      sessions = sessions.map((s) =>
        s.id === session.id ? { ...s, orderIds: [...s.orderIds, newOrder.id] } : s
      );

      return { orders, sessions: syncSessionTotals(sessions, orders) };
    }),

  // -------------------------------------------------------------------------
  // Status updates (manual, by the restaurant admin)
  // -------------------------------------------------------------------------

  // Moves every item that is still on the order to `status`.
  updateOrderStatus: (orderId, status) => {
    if (!EDITABLE_STATUSES.includes(status)) return;
    set((state) => ({
      orders: mapOrder(state.orders, orderId, (order) => ({
        ...order,
        items: order.items.map((item) => (isItemCancelled(item) ? item : { ...item, status })),
      })),
    }));
  },

  // Changes a single item; the order status follows from its items.
  updateItemStatus: (orderId, itemId, status) => {
    if (!EDITABLE_STATUSES.includes(status)) return;
    set((state) => ({
      orders: mapOrder(state.orders, orderId, (order) => ({
        ...order,
        items: order.items.map((item) =>
          item.id === itemId && !isItemCancelled(item) ? { ...item, status } : item
        ),
      })),
    }));
  },

  // Marks everything still open in a session as served.
  serveAllInSession: (sessionId) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;
      return {
        orders: state.orders.map((order) =>
          order.sessionId === sessionId
            ? recalcOrder({
                ...order,
                items: order.items.map((item) =>
                  isItemCancelled(item) ? item : { ...item, status: "served" }
                ),
              })
            : order
        ),
      };
    }),

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------

  // Cancels whole or part of an order.
  // selections: [{ itemId, quantity }]; meta: { reason, comment }
  cancelOrderItems: (orderId, selections, meta) =>
    set((state) => {
      const orders = mapOrder(state.orders, orderId, (order) =>
        applyCancellation(order, selections, meta)
      );
      return { orders, sessions: syncSessionTotals(state.sessions, orders) };
    }),

  // Full cancellation: everything that has not been served yet.
  cancelOrder: (orderId, meta) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    const selections = order.items
      .filter(isItemCancellable)
      .map((item) => ({ itemId: item.id, quantity: item.quantity - (item.cancelledQty || 0) }));
    get().cancelOrderItems(orderId, selections, meta);
  },

  // Removes an item that cannot be served (cancels its remaining quantity).
  removeItem: (orderId, itemId, meta) => {
    const order = get().orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!item || !isItemCancellable(item)) return;
    get().cancelOrderItems(
      orderId,
      [{ itemId, quantity: item.quantity - (item.cancelledQty || 0) }],
      meta
    );
  },

  // -------------------------------------------------------------------------
  // Payment
  // -------------------------------------------------------------------------

  // Marks the bill as paid and closes the session (frees the table).
  // Refuses while any item is still Pending / Under Process.
  markSessionPaid: (sessionId) => {
    const { sessions, orders } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return { ok: false, reason: "not_found" };

    const sessionOrders = getSessionOrders(session, orders);
    if (getUnresolvedItems(sessionOrders).length > 0) return { ok: false, reason: "unresolved" };

    const total = getSessionTotal(sessionOrders);
    const now = new Date().toISOString();

    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      completedSessions: [
        ...state.completedSessions,
        {
          ...session,
          total,
          status: "completed",
          // Nothing to collect if every order was cancelled.
          paymentStatus: total > 0 ? "successful" : "not_required",
          paidAt: now,
          closedAt: now,
        },
      ],
    }));
    return { ok: true, total };
  },

  // -------------------------------------------------------------------------
  // Selectors / helpers
  // -------------------------------------------------------------------------
  getOrdersBySession: (sessionId) => {
    const { sessions, completedSessions, orders } = get();
    const session =
      sessions.find((s) => s.id === sessionId) || completedSessions.find((s) => s.id === sessionId);
    return session ? getSessionOrders(session, orders) : [];
  },

  getTableName: (tableId) => TABLE_NAMES[tableId] || tableId,
}));
