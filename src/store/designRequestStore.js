import { create } from "zustand";
import { designRequestApi } from "../api/designRequest.api";

const norm = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: ((_id?._id ?? _id)?.toString?.() || _id || rest.id) };
};

export const useDesignRequestStore = create((set, get) => ({
  requests: [],
  loading: false,
  error: null,
  loaded: false,

  fetchRequests: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await designRequestApi.getRequests();
      set({ 
        requests: (res.data?.data || []).map(norm), 
        loading: false, 
        loaded: true 
      });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || "Failed to load requests" });
    }
  },

  addRequest: async ({ description, file = null }) => {
    try {
      const res = await designRequestApi.createRequest({ description, file });
      const newRequest = norm(res.data?.data);
      set((state) => ({ requests: [newRequest, ...state.requests] }));
      return newRequest;
    } catch (err) {
      throw err;
    }
  },
}));
