import { apiClient } from "./client";

export const subscriptionApi = {
  getOverview: async () => {
    const res = await apiClient.get("/restaurant/subscription");
    return res.data;
  },

  submitPayment: async (formData) => {
    const res = await apiClient.post("/restaurant/subscription/payment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  createTicket: async (ticketData) => {
    const res = await apiClient.post("/restaurant/subscription/ticket", ticketData);
    return res.data;
  },

  getTickets: async () => {
    const res = await apiClient.get("/restaurant/subscription/tickets");
    return res.data;
  },
};
