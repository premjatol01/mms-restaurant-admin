import { apiClient } from "./client";

export const tablesApi = {
  // Table Routes
  getTables: () => apiClient.get("/restaurant/tables"),
  createTable: (data) => apiClient.post("/restaurant/tables", data),
  updateTable: (id, data) => apiClient.put(`/restaurant/tables/${id}`, data),
  deleteTable: (id) => apiClient.delete(`/restaurant/tables/${id}`),

  // QR Code Routes
  getQRCodes: () => apiClient.get("/restaurant/tables/qr"),
  generateQRCodes: (count, templateId) => apiClient.post("/restaurant/tables/qr", { count, templateId }),
  deleteQRCode: (id) => apiClient.delete(`/restaurant/tables/qr/${id}`),

  // QR Templates (created by super-admin)
  getQRTemplates: () => apiClient.get("/qr-templates"),
};
