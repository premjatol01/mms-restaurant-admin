import { apiClient } from "./client";

export const profileApi = {
  // Profile
  get: () => apiClient.get("/restaurant/profile"),
  update: (data) => apiClient.put("/restaurant/profile", data),

  // Logo
  uploadLogo: (formData) =>
    apiClient.post("/restaurant/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeLogo: () => apiClient.delete("/restaurant/profile/logo"),

  // Cover image
  uploadCover: (formData) =>
    apiClient.post("/restaurant/profile/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeCover: () => apiClient.delete("/restaurant/profile/cover"),

  // Master Menu (Super Admin data)
  getMasterCategories: () => apiClient.get("/master-menu/categories"),
  getMasterItems: () => apiClient.get("/master-menu/items"),

  // Save Menu Selection
  saveMenuSelection: (selection) => apiClient.post("/restaurant/profile/menu-selection", selection),

  // Templates
  getTemplates: () => apiClient.get("/qr-templates"),

  // Tables
  getTables: () => apiClient.get("/restaurant/tables"),
  createTables: (data) => apiClient.post("/restaurant/tables", data),
};
