import { create } from "zustand";

const mockOffers = [
  {
    id: "OFF-001",
    name: "Repeat Customer Special",
    type: "repeat_order",
    benefit: { type: "percentage", value: 10 },
    previousOrderAmount: 1000,
    repeatWithinDays: 7,
    validity: { startDate: "2026-09-01", endDate: "2026-09-30" },
    terms: "Valid on eligible repeat orders only. Cannot be combined with other offers.",
    status: "active",
    createdAt: "2026-09-01T10:00:00"
  },
  {
    id: "OFF-002",
    name: "Big Order Bonus",
    type: "order_value",
    minimumOrderAmount: 1500,
    benefit: { type: "percentage", value: 15 },
    validity: { startDate: "2026-09-01", endDate: "2026-09-30" },
    terms: "Applicable when the order value reaches ₹1,500 or more.",
    status: "active",
    createdAt: "2026-09-01T10:00:00"
  },
  {
    id: "OFF-003",
    name: "Tuesday Special",
    type: "low_traffic",
    promotionMode: "order_value",
    dayType: "day_of_week",
    dayOfWeek: "Tuesday",
    minimumOrderAmount: 1000,
    benefit: { type: "percentage", value: 20 },
    validity: { startDate: "2026-09-01", endDate: "2026-09-30" },
    terms: "Valid every Tuesday during the offer period. Minimum order ₹1,000.",
    status: "active",
    createdAt: "2026-09-01T10:00:00"
  },
  {
    id: "OFF-004",
    name: "Pizza Wednesday",
    type: "low_traffic",
    promotionMode: "menu_item",
    dayType: "day_of_week",
    dayOfWeek: "Wednesday",
    menuItemId: "item-1",
    menuItemName: "Margherita Pizza",
    benefit: { type: "percentage", value: 20 },
    validity: { startDate: "2026-10-01", endDate: "2026-10-31" },
    terms: "Valid on Margherita Pizza every Wednesday in October.",
    status: "scheduled",
    createdAt: "2026-09-10T10:00:00"
  },
  {
    id: "OFF-005",
    name: "Weekend Treat",
    type: "order_value",
    minimumOrderAmount: 800,
    benefit: { type: "percentage", value: 12 },
    validity: { startDate: "2026-08-01", endDate: "2026-08-31" },
    terms: "Valid on weekends only.",
    status: "inactive",
    createdAt: "2026-08-01T10:00:00"
  }
];

const designerContact = {
  phone: "+91 98765 43210",
  email: "design-service@mmseats.com"
};

export const useOffersStore = create((set, get) => ({
  offers: [...mockOffers],
  loading: false,
  error: null,
  designerContact,

  addOffer: (offer) => set((state) => ({
    offers: [...state.offers, { ...offer, id: `OFF-${Date.now()}`, createdAt: new Date().toISOString() }]
  })),

  updateOffer: (id, data) => set((state) => ({
    offers: state.offers.map((o) => o.id === id ? { ...o, ...data } : o)
  })),

  updateOfferStatus: (id, status) => set((state) => ({
    offers: state.offers.map((o) => o.id === id ? { ...o, status } : o)
  })),

  deleteOffer: (id) => set((state) => ({
    offers: state.offers.filter((o) => o.id !== id)
  })),

  getOfferById: (id) => get().offers.find((o) => o.id === id),

  getStats: () => {
    const { offers } = get();
    const total = offers.length;
    const active = offers.filter((o) => o.status === "active").length;
    const scheduled = offers.filter((o) => o.status === "scheduled").length;
    const inactive = offers.filter((o) => o.status === "inactive").length;
    return { total, active, scheduled, inactive };
  }
}));