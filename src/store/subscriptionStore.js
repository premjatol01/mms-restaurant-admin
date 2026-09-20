import { create } from "zustand";
import * as api from "../pages/subscription/services/subscriptionApi";

/**
 * status: "idle" | "loading" | "ready" | "error"
 * The server (mock API) is the source of truth; this store just mirrors it.
 */
export const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  paymentConfig: null,
  requests: [],
  status: "idle",
  error: null,
  submitting: false,

  // First load shows the loading state; later refreshes are silent (no flicker).
  loadSubscription: async () => {
    const firstLoad = get().status !== "ready";
    if (firstLoad) set({ status: "loading", error: null });
    try {
      const data = await api.getSubscriptionOverview();
      set({ ...data, status: "ready", error: null });
      return true;
    } catch (error) {
      // A failed silent refresh keeps showing the last good data.
      if (firstLoad) set({ status: "error", error: error.message });
      return false;
    }
  },

  // Throws on failure (error.code / error.message) so the caller can show a toast.
  submitRenewal: async ({ screenshot, transactionRef }) => {
    if (get().submitting) throw Object.assign(new Error("Submission already in progress."), { code: "BUSY" });
    if (get().requests.some((r) => r.status === "pending")) {
      throw Object.assign(new Error("A renewal request is already pending review."), { code: "PENDING_EXISTS" });
    }
    set({ submitting: true });
    try {
      const request = await api.submitRenewalRequest({ screenshot, transactionRef });
      set((state) => ({ requests: [request, ...state.requests] }));
      return request;
    } catch (error) {
      // Server says one is pending (e.g. submitted from another tab): sync our view.
      if (error.code === "PENDING_EXISTS") await get().loadSubscription();
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  // MOCK ONLY - stands in for the Super Admin decision so the flow can be previewed.
  simulateReview: async (id, decision, note) => {
    await api.mockReviewRequest(id, decision, note);
    await get().loadSubscription();
  },
}));
