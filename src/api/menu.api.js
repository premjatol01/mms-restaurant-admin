import { apiClient } from "./client";

export const menuApi = {
  // Categories
  getCategories: () => apiClient.get("/menu/categories"),
  createCategory: (data) => apiClient.post("/menu/categories", data),
  updateCategory: (id, data) => apiClient.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/menu/categories/${id}`),

  // Image Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post("/menu/upload-image", formData);
  },

  // Items
  getItems: (params) => apiClient.get("/menu/items", { params }),
  createItem: (data) => apiClient.post("/menu/items", data),
  updateItem: (id, data) => apiClient.put(`/menu/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/menu/items/${id}`),

  // Combos
  getCombos: () => apiClient.get("/menu/combos"),
  createCombo: (data) => apiClient.post("/menu/combos", data),
  updateCombo: (id, data) => apiClient.put(`/menu/combos/${id}`, data),
  deleteCombo: (id) => apiClient.delete(`/menu/combos/${id}`),
};
