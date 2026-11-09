import { apiClient } from "./client";

export const bizGrowthApi = {
  getAll: (params) => apiClient.get("/biz-growth", { params }),
  getById: (id) => apiClient.get(`/biz-growth/${id}`),
};
