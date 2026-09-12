import { create } from "zustand";

const defaultSessions = [
  { id: "session-5", sessionNumber: "#S-1005", tableId: "table-5", status: "active", paymentStatus: "pending", orderIds: ["order-1001", "order-1002", "order-1003"], startedAt: "2026-09-12T19:15:00", closedAt: null, total: 1500 },
  { id: "session-3", sessionNumber: "#S-1004", tableId: "table-3", status: "active", paymentStatus: "pending", orderIds: ["order-1004", "order-1005"], startedAt: "2026-09-12T19:30:00", closedAt: null, total: 950 },
  { id: "session-8", sessionNumber: "#S-1003", tableId: "table-8", status: "active", paymentStatus: "pending", orderIds: ["order-1006"], startedAt: "2026-09-12T19:45:00", closedAt: null, total: 450 },
];

const defaultOrders = [
  { id: "order-1001", orderNumber: "#1001", tableId: "table-5", sessionId: "session-5", source: "qr", customer: { mobile: null }, items: [{ menuItemId: "item-1", name: "Margherita Pizza", quantity: 1, price: 299 }, { menuItemId: "item-5", name: "French Fries", quantity: 1, price: 99 }, { menuItemId: "item-7", name: "Cold Coffee", quantity: 1, price: 149 }], subtotal: 547, discount: 0, total: 547, status: "new", createdAt: "2026-09-12T19:15:00" },
  { id: "order-1002", orderNumber: "#1002", tableId: "table-5", sessionId: "session-5", source: "qr", customer: { mobile: "+91 98765 43210" }, items: [{ menuItemId: "item-3", name: "Chicken Burger", quantity: 2, price: 249 }, { menuItemId: "item-7", name: "Cold Coffee", quantity: 1, price: 149 }], subtotal: 647, discount: 0, total: 647, status: "preparing", createdAt: "2026-09-12T19:22:00" },
  { id: "order-1003", orderNumber: "#1003", tableId: "table-5", sessionId: "session-5", source: "manual", customer: { mobile: null }, items: [{ menuItemId: "item-9", name: "Butter Chicken", quantity: 1, price: 349 }], subtotal: 349, discount: 0, total: 349, status: "ready", createdAt: "2026-09-12T19:30:00" },
  { id: "order-1004", orderNumber: "#1004", tableId: "table-3", sessionId: "session-3", source: "qr", customer: { mobile: "+91 91234 56789" }, items: [{ menuItemId: "item-2", name: "Veggie Supreme", quantity: 1, price: 349 }, { menuItemId: "item-6", name: "Garlic Bread", quantity: 1, price: 79 }], subtotal: 428, discount: 0, total: 428, status: "new", createdAt: "2026-09-12T19:30:00" },
  { id: "order-1005", orderNumber: "#1005", tableId: "table-3", sessionId: "session-3", source: "qr", customer: { mobile: null }, items: [{ menuItemId: "item-10", name: "Paneer Tikka", quantity: 1, price: 299 }, { menuItemId: "item-12", name: "Gulab Jamun", quantity: 2, price: 69 }], subtotal: 522, discount: 0, total: 522, status: "preparing", createdAt: "2026-09-12T19:40:00" },
  { id: "order-1006", orderNumber: "#1006", tableId: "table-8", sessionId: "session-8", source: "qr", customer: { mobile: null }, items: [{ menuItemId: "item-4", name: "Veg Burger", quantity: 2, price: 199 }, { menuItemId: "item-5", name: "French Fries", quantity: 1, price: 99 }], subtotal: 497, discount: 0, total: 497, status: "served", createdAt: "2026-09-12T19:45:00" },
];

const completedSessions = [
  { id: "session-1", sessionNumber: "#S-1001", tableId: "table-1", status: "completed", paymentStatus: "successful", orderIds: ["order-901", "order-902", "order-903"], startedAt: "2026-09-12T18:00:00", closedAt: "2026-09-12T18:45:00", total: 1500 },
  { id: "session-2", sessionNumber: "#S-1002", tableId: "table-2", status: "completed", paymentStatus: "successful", orderIds: ["order-904", "order-905"], startedAt: "2026-09-12T18:30:00", closedAt: "2026-09-12T19:00:00", total: 850 },
];

const tableNames = { "table-1": "Table 01", "table-2": "Table 02", "table-3": "Table 03", "table-4": "Table 04", "table-5": "Table 05", "table-6": "Table 06", "table-7": "Table 07", "table-8": "Table 08" };

export const useOrdersStore = create((set, get) => ({
  orders: [...defaultOrders],
  sessions: [...defaultSessions],
  completedSessions: [...completedSessions],
  loading: false,

  addOrder: (order) => set((state) => {
    const orderNumber = "#" + (1007 + state.orders.length);
    const newOrder = { ...order, id: "order-" + Date.now(), orderNumber, status: "new", createdAt: new Date().toISOString() };
    let newSessions = [...state.sessions];
    let newOrders = [...state.orders, newOrder];

    const activeSession = newSessions.find((s) => s.tableId === order.tableId && s.status === "active");
    
    if (activeSession) {
      newSessions = newSessions.map((s) => 
        s.id === activeSession.id 
          ? { ...s, orderIds: [...s.orderIds, newOrder.id], total: s.total + newOrder.total }
          : s
      );
    } else {
      const sessionNumber = "#S-" + (1001 + newSessions.length + state.completedSessions.length);
      const newSession = {
        id: "session-" + Date.now(),
        sessionNumber,
        tableId: order.tableId,
        status: "active",
        paymentStatus: "pending",
        orderIds: [newOrder.id],
        startedAt: new Date().toISOString(),
        closedAt: null,
        total: newOrder.total
      };
      newSessions.push(newSession);
      newOrder.sessionId = newSession.id;
    }

    return { orders: newOrders, sessions: newSessions };
  }),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === orderId ? { ...o, status } : o)
  })),

  markPaymentSuccessful: (sessionId) => set((state) => ({
    sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, paymentStatus: "successful" } : s)
  })),

  closeSession: (sessionId) => set((state) => {
    const session = state.sessions.find((s) => s.id === sessionId);
    if (!session) return state;
    return {
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      completedSessions: [...state.completedSessions, { ...session, status: "completed", closedAt: new Date().toISOString() }]
    };
  }),

  getOrdersBySession: (sessionId) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === sessionId) || state.completedSessions.find((s) => s.id === sessionId);
    if (!session) return [];
    return session.orderIds.map((oid) => state.orders.find((o) => o.id === oid)).filter(Boolean);
  },

  getTableName: (tableId) => tableNames[tableId] || tableId
}));