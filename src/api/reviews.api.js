import { apiClient } from "./client";

export const reviewsApi = {
  list: (params) => apiClient.get("/reviews", { params }),
  updateStatus: (id, status) => apiClient.patch(`/reviews/${id}/status`, { status }),
};
