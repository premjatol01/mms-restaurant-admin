import { create } from "zustand";

// Dummy data lives in the website module's data folder.
// NOTE: adjust "pages" below if your website folder is not at src/pages/website.
import { mockInquiries } from "../pages/website/data/inquiries";
import { defaultSections } from "../pages/website/data/sections";
import { DEFAULT_WEBSITE_COLORS, BASE_DOMAIN } from "../pages/website/utils/constants";

export const useWebsiteStore = create((set, get) => ({
  // Website config
  websiteStatus: "draft",
  restaurantName: "Tasty Bites",
  restaurantSlug: "tasty-bites", // subdomain: https://<restaurantSlug>.<baseDomain>
  baseDomain: BASE_DOMAIN,
  description: "Fresh and delicious food made with quality ingredients.",
  phone: "+91 98765 43210",
  email: "info@tastybites.com",
  address: "123 Food Street, Mumbai, Maharashtra",
  websiteColors: { ...DEFAULT_WEBSITE_COLORS },
  sections: [...defaultSections],
  loading: false,

  // Inquiries
  inquiries: [...mockInquiries],
  inquiriesLoading: false,

  // Actions
  setWebsiteStatus: (status) => set({ websiteStatus: status }),

  updateBasicInfo: (data) => set((state) => ({
    restaurantName: data.restaurantName ?? state.restaurantName,
    description: data.description ?? state.description,
    phone: data.phone ?? state.phone,
    email: data.email ?? state.email,
    address: data.address ?? state.address
  })),

  updateSubdomain: (slug) => set({ restaurantSlug: slug }),

  updateWebsiteColors: (colors) => set((state) => ({
    websiteColors: { ...state.websiteColors, ...colors }
  })),

  getWebsiteUrl: () => {
    const { restaurantSlug, baseDomain } = get();
    return `https://${restaurantSlug}.${baseDomain}`;
  },

  updateSection: (sectionId, content) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s
    )
  })),

  toggleSection: (sectionId) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    )
  })),

  moveSection: (sectionId, direction) => set((state) => {
    const sorted = [...state.sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === sectionId);
    if (index === -1) return state;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return state;

    [sorted[index], sorted[newIndex]] = [sorted[newIndex], sorted[index]];
    // Create new objects instead of mutating the ones already in state.
    return { sections: sorted.map((s, i) => ({ ...s, order: i + 1 })) };
  }),

  publishWebsite: () => set({ websiteStatus: "published" }),
  unpublishWebsite: () => set({ websiteStatus: "draft" }),

  // Inquiry actions
  updateInquiryStatus: (id, status) => set((state) => ({
    inquiries: state.inquiries.map((i) => i.id === id ? { ...i, status } : i)
  })),

  getInquiryStats: () => {
    const { inquiries } = get();
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      inProgress: inquiries.filter((i) => i.status === "in_progress").length,
      resolved: inquiries.filter((i) => i.status === "resolved").length
    };
  },

  getInquiryById: (id) => get().inquiries.find((i) => i.id === id)
}));
