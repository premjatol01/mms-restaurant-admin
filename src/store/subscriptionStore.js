import { create } from "zustand";
import { subscriptionApi } from "../api/subscription.api";

export const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  restaurant: null,
  packages: [],
  paymentConfig: null,
  hasPendingPayment: false,
  pendingPayment: null,
  history: [],
  tickets: [],
  status: "idle",
  error: null,
  submitting: false,

  loadSubscription: async () => {
    const firstLoad = get().status !== "ready";
    if (firstLoad) set({ status: "loading", error: null });
    try {
      const res = await subscriptionApi.getOverview();
      const payload = res.data || res;
      set({
        subscription: payload.subscription || null,
        restaurant: payload.restaurant || null,
        packages: payload.packages || [],
        paymentConfig: payload.paymentConfig || null,
        hasPendingPayment: Boolean(payload.hasPendingPayment),
        pendingPayment: payload.pendingPayment || null,
        history: payload.history || [],
        tickets: payload.tickets || [],
        status: "ready",
        error: null,
      });
      return true;
    } catch (err) {
      console.error("Failed to load subscription:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load subscription";
      if (firstLoad) set({ status: "error", error: msg });
      return false;
    }
  },

  submitPayment: async (formData) => {
    set({ submitting: true });
    try {
      const res = await subscriptionApi.submitPayment(formData);
      await get().loadSubscription();
      return res;
    } catch (err) {
      throw err;
    } finally {
      set({ submitting: false });
    }
  },

  createTicket: async ({ subject, message, paymentRequestId }) => {
    set({ submitting: true });
    try {
      const res = await subscriptionApi.createTicket({ subject, message, paymentRequestId });
      await get().loadSubscription();
      return res;
    } catch (err) {
      throw err;
    } finally {
      set({ submitting: false });
    }
  },
}));
