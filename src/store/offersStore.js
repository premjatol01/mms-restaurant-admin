import { create } from "zustand";
import { offersApi } from "../api/offers.api";

// Normalizes MongoDB _id to id so components consistently use `id`
const norm = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: ((_id?._id ?? _id)?.toString?.() || _id || rest.id) };
};

const designerContact = {
  phone: "+91 98765 43210",
  email: "design-service@mmseats.com"
};

export const useOffersStore = create((set, get) => ({
  offers: [],
  loading: false,
  error: null,
  loaded: false,
  designerContact,

  fetchOffers: async (force = false) => {
    if (get().loaded && !force) return;
    set({ loading: true, error: null });
    try {
      const res = await offersApi.getOffers();
      const serverOffers = (res.data?.data || []).map(norm);
      set({
        offers: serverOffers,
        loading: false,
        loaded: true,
        error: null
      });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message || "Failed to load offers from server."
      });
    }
  },

  addOffer: async (offerData) => {
    try {
      const res = await offersApi.createOffer(offerData);
      const newOffer = norm(res.data?.data);
      set((state) => ({ offers: [newOffer, ...state.offers] }));
      return newOffer;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to create offer";
      throw new Error(message);
    }
  },

  updateOffer: async (id, data) => {
    try {
      const res = await offersApi.updateOffer(id, data);
      const updated = norm(res.data?.data);
      set((state) => ({
        offers: state.offers.map((o) => (o.id === id ? { ...o, ...updated } : o))
      }));
      return updated;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to update offer";
      throw new Error(message);
    }
  },

  updateOfferStatus: async (id, status) => {
    try {
      const res = await offersApi.updateOfferStatus(id, status);
      const updated = norm(res.data?.data);
      set((state) => ({
        offers: state.offers.map((o) => (o.id === id ? { ...o, status: updated?.status || status } : o))
      }));
      return updated;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to update offer status";
      throw new Error(message);
    }
  },

  deleteOffer: async (id) => {
    try {
      await offersApi.deleteOffer(id);
      set((state) => ({
        offers: state.offers.filter((o) => o.id !== id)
      }));
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to delete offer";
      throw new Error(message);
    }
  },

  getOfferById: (id) => get().offers.find((o) => o.id === id),

  getStats: () => {
    const { offers } = get();
    const total = offers.length;
    const active = offers.filter((o) => o.status === "active").length;
    const inactive = offers.filter((o) => o.status === "inactive").length;
    return { total, active, inactive };
  }
}));