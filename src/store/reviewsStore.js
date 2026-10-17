import { create } from "zustand";
import { reviewsApi } from "../api/reviews.api";

export const PAGE_SIZE = 10;

const EMPTY_FILTERS = { status: "", rating: "", dateFrom: "", dateTo: "" };

let requestSeq = 0; // ignore responses that arrive after a newer request was made

export const useReviewsStore = create((set, get) => ({
  reviews: [], // the current page
  total: 0, // total reviews matching the current filters
  stats: { total: 0, pending: 0, accepted: 0, rejected: 0 }, // counts across ALL reviews
  filters: { ...EMPTY_FILTERS },
  page: 1, // the page being requested
  shownPage: 1, // the page the rows currently on screen belong to
  pageSize: PAGE_SIZE,
  loading: false,
  loaded: false, // true once the first successful load has finished
  error: null,

  fetchReviews: async () => {
    const seq = ++requestSeq;
    set({ loading: true, error: null });
    try {
      const { filters, page, pageSize } = get();
      const res = await reviewsApi.list({ ...filters, page, pageSize });
      if (seq !== requestSeq) return;

      const {
        items = [],
        total = 0,
        stats = { total: 0, pending: 0, accepted: 0, rejected: 0 }
      } = res.data?.data || {};

      set({
        reviews: items,
        total,
        stats,
        shownPage: page,
        loading: false,
        loaded: true,
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      set({
        loading: false,
        error: err?.response?.data?.message || err?.message || "Failed to load reviews."
      });
    }
  },

  // Changing any filter goes back to page 1.
  setFilters: (patch) => {
    set((s) => ({ filters: { ...s.filters, ...patch }, page: 1 }));
    return get().fetchReviews();
  },

  clearFilters: () => {
    set({ filters: { ...EMPTY_FILTERS }, page: 1 });
    return get().fetchReviews();
  },

  setPage: (page) => {
    set({ page });
    return get().fetchReviews();
  },

  // status: "accepted" | "rejected". Only pending reviews can be moderated.
  moderateReview: async (id, status) => {
    try {
      const res = await reviewsApi.updateStatus(id, status);
      if (res.data?.success) {
        await get().fetchReviews(); // refresh list & stats
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Failed to update review status." };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err?.message || "Failed to update the review."
      };
    }
  },
}));
