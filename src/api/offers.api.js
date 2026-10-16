import { apiClient } from "./client";

export const offersApi = {
  getOffers: () => apiClient.get("/offers"),
  getOffer: (id) => apiClient.get(`/offers/${id}`),
  createOffer: (data) => apiClient.post("/offers", data),
  updateOffer: (id, data) => apiClient.put(`/offers/${id}`, data),
  updateOfferStatus: (id, status) => apiClient.patch(`/offers/${id}/status`, { status }),
  deleteOffer: (id) => apiClient.delete(`/offers/${id}`),
};
