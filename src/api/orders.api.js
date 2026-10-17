import { apiClient } from "./client";

export const ordersApi = {
  getOrders: (params) => apiClient.get("/orders", { params }),
  getSessions: (params) => apiClient.get("/orders/sessions", { params }),
  createManualOrder: (data) => apiClient.post("/orders/manual", data),
  updateOrderStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
  updateItemStatus: (id, itemId, status) => apiClient.put(`/orders/${id}/items/${itemId}/status`, { status }),
  cancelOrderItems: (id, data) => apiClient.post(`/orders/${id}/cancel`, data),
  serveAllInSession: (sessionId) => apiClient.post(`/orders/sessions/${sessionId}/serve-all`),
  markSessionPaid: (sessionId, force = false) => apiClient.post(`/orders/sessions/${sessionId}/pay`, { force }),
};
