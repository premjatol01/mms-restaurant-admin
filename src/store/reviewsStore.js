import { create } from "zustand";
import { DUMMY_REVIEWS, SIMULATE_LOAD_ERROR } from "../pages/reviews/data/reviewsData";

// ===========================================================================
// Reviews store.
//
// Runs on the dummy data in pages/reviews/data for now, held in memory (it resets on
// page reload). Filtering and pagination are done the way a server would do them
// (page, pageSize and filters go in; one page of results, the total and the status
// counts come out), so switching to the real API means replacing the bodies of
// fetchReviews and moderateReview — the page and components don't need to change.
// Look for TODO.
// ===========================================================================

export const PAGE_SIZE = 10;

const EMPTY_FILTERS = { status: "", rating: "", dateFrom: "", dateTo: "" };

const SIMULATED_DELAY_MS = 350;
const wait = (ms = SIMULATED_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// Dummy "server" ---------------------------------------------------------------
const queryDummy = (all, { filters, page, pageSize }) => {
  const filtered = all
    .filter((r) => !filters.status || r.status === filters.status)
    .filter((r) => !filters.rating || r.rating === Number(filters.rating))
    // submittedAt is "YYYY-MM-DDTHH:mm:ss", so the first 10 characters are the calendar date
    .filter((r) => !filters.dateFrom || r.submittedAt.slice(0, 10) >= filters.dateFrom)
    .filter((r) => !filters.dateTo || r.submittedAt.slice(0, 10) <= filters.dateTo)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)); // newest first

  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length };
};

const countDummy = (all) => ({
  total: all.length,
  pending: all.filter((r) => r.status === "pending").length,
  accepted: all.filter((r) => r.status === "accepted").length,
  rejected: all.filter((r) => r.status === "rejected").length,
});
// -------------------------------------------------------------------------------

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

  _db: DUMMY_REVIEWS.map((r) => ({ ...r })), // dummy data; remove when the API is wired up

  fetchReviews: async () => {
    const seq = ++requestSeq;
    set({ loading: true, error: null });
    try {
      // TODO: const { filters, page, pageSize } = get();
      //       const { data } = await reviewsApi.list({ ...filters, page, pageSize });
      //       -> expects { items, total, stats: { total, pending, accepted, rejected } }
      await wait();
      if (SIMULATE_LOAD_ERROR) throw new Error("Simulated load error");
      if (seq !== requestSeq) return;

      const { filters, page, pageSize, _db } = get();
      let nextPage = page;
      let result = queryDummy(_db, { filters, page: nextPage, pageSize });

      // The current page may no longer exist (e.g. the last review on it was just moderated
      // while a status filter is on), so step back to the last page that does.
      const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
      if (nextPage > lastPage) {
        nextPage = lastPage;
        result = queryDummy(_db, { filters, page: nextPage, pageSize });
      }

      set({
        reviews: result.items,
        total: result.total,
        stats: countDummy(_db),
        page: nextPage,
        shownPage: nextPage,
        loading: false,
        loaded: true,
      });
    } catch (err) {
      if (seq !== requestSeq) return;
      set({ loading: false, error: err?.response?.data?.message || "Failed to load reviews." });
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
      // TODO: await reviewsApi.updateStatus(id, status);
      await wait();
      const review = get()._db.find((r) => r.id === id);
      if (!review) return { success: false, message: "Review not found." };
      if (review.status !== "pending") return { success: false, message: "This review has already been moderated." };

      set((s) => ({ _db: s._db.map((r) => (r.id === id ? { ...r, status } : r)) }));
      await get().fetchReviews(); // refresh the list and the counts
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to update the review." };
    }
  },
}));
