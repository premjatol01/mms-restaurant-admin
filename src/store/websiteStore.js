import { create } from "zustand";
import { websiteApi } from "../api/website.api";
import { defaultSections } from "../pages/website/data/sections";
import { DEFAULT_WEBSITE_COLORS, BASE_DOMAIN } from "../pages/website/utils/constants";
import { useProfileStore } from "./profileStore";

export const useWebsiteStore = create((set, get) => ({
  // Website config
  websiteStatus: "draft",
  restaurantName: "",
  restaurantSlug: "",
  baseDomain: BASE_DOMAIN,
  description: "",
  phone: "",
  email: "",
  address: "",
  websiteColors: { ...DEFAULT_WEBSITE_COLORS },
  sections: [...defaultSections],
  loading: false,

  // Inquiries
  inquiries: [],
  inquiryStats: { total: 0, new: 0, inProgress: 0, resolved: 0 },
  inquiriesLoading: false,

  // Load real website config & sections from backend API
  loadProfile: async () => {
    set({ loading: true });
    try {
      const res = await websiteApi.getConfig();
      const payload = res.data?.data;
      if (payload) {
        const { config, sections } = payload;
        set({
          websiteStatus: config?.websiteStatus || "draft",
          restaurantName: config?.restaurantName || "",
          restaurantSlug:
            config?.restaurantSlug ||
            payload?.subdomain ||
            useProfileStore.getState().profile?.website?.subdomain ||
            "",
          baseDomain: config?.baseDomain || BASE_DOMAIN,
          description: config?.description || "",
          phone: config?.phone || "",
          email: config?.email || "",
          address: config?.address || "",
          websiteColors: config?.websiteColors
            ? { ...DEFAULT_WEBSITE_COLORS, ...config.websiteColors }
            : { ...DEFAULT_WEBSITE_COLORS },
          sections: sections && sections.length > 0 ? sections : [...defaultSections],
        });
      }
    } catch (err) {
      console.warn("Could not load website config, using defaults:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Save Basic Information to backend
  updateBasicInfo: async (data) => {
    // Optimistic local update
    set((state) => ({
      restaurantName: data.restaurantName ?? state.restaurantName,
      description: data.description ?? state.description,
      phone: data.phone ?? state.phone,
      email: data.email ?? state.email,
      address: data.address ?? state.address,
    }));

    try {
      await websiteApi.updateConfig(data);
    } catch (err) {
      console.error("Failed to save basic info:", err);
      throw err;
    }
  },

  updateSubdomain: (slug) => set({ restaurantSlug: slug }),

  // Save Website Colors to backend
  updateWebsiteColors: async (colors) => {
    const updated = { ...get().websiteColors, ...colors };
    set({ websiteColors: updated });

    try {
      await websiteApi.updateConfig({ websiteColors: updated });
    } catch (err) {
      console.error("Failed to save website colors:", err);
      throw err;
    }
  },

  getWebsiteUrl: () => {
    const { restaurantSlug, baseDomain } = get();
    return `http://${restaurantSlug}.${baseDomain}`;
  },

  // Update Section Content in backend
  updateSection: async (sectionId, content) => {
    // Optimistic local update
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s
      ),
    }));

    try {
      await websiteApi.updateSection(sectionId, { content });
    } catch (err) {
      console.error("Failed to update section content:", err);
      throw err;
    }
  },

  // Dedicated Footer Update
  updateFooter: async (footerData) => {
    // Optimistic local update
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === "footer"
          ? {
              ...s,
              enabled: footerData.enabled !== undefined ? footerData.enabled : s.enabled,
              content: {
                ...s.content,
                ...(footerData.content || {}),
                ...(footerData.title !== undefined ? { title: footerData.title } : {}),
                ...(footerData.description !== undefined ? { description: footerData.description } : {}),
                ...(footerData.socialLinks ? { socialLinks: footerData.socialLinks } : {}),
                ...(footerData.sectionLinks ? { sectionLinks: footerData.sectionLinks } : {}),
              },
            }
          : s
      ),
    }));

    try {
      const res = await websiteApi.updateFooter(footerData);
      return res.data?.data;
    } catch (err) {
      console.error("Failed to update footer:", err);
      throw err;
    }
  },

  // Toggle Section Enabled state in backend
  toggleSection: async (sectionId) => {
    const section = get().sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newEnabled = !section.enabled;

    // Optimistic local update
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: newEnabled } : s
      ),
    }));

    try {
      await websiteApi.toggleSection(sectionId, newEnabled);
    } catch (err) {
      console.error("Failed to toggle section:", err);
      // Revert if error
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, enabled: !newEnabled } : s
        ),
      }));
    }
  },

  // Publish / Unpublish website
  publishWebsite: async () => {
    set({ websiteStatus: "published" });
    try {
      await websiteApi.publishWebsite();
    } catch (err) {
      console.error("Failed to publish website:", err);
      set({ websiteStatus: "draft" });
      throw err;
    }
  },

  unpublishWebsite: async () => {
    set({ websiteStatus: "draft" });
    try {
      await websiteApi.unpublishWebsite();
    } catch (err) {
      console.error("Failed to unpublish website:", err);
      set({ websiteStatus: "published" });
      throw err;
    }
  },

  // Inquiries Actions
  loadInquiries: async (params = {}) => {
    set({ inquiriesLoading: true });
    try {
      const [resList, resStats] = await Promise.all([
        websiteApi.getInquiries(params),
        websiteApi.getInquiryStats(),
      ]);

      set({
        inquiries: resList.data?.data || [],
        inquiryStats: resStats.data?.data || { total: 0, new: 0, inProgress: 0, resolved: 0 },
      });
    } catch (err) {
      console.warn("Could not load inquiries:", err);
    } finally {
      set({ inquiriesLoading: false });
    }
  },

  updateInquiryStatus: async (id, status) => {
    // Optimistic local update
    set((state) => ({
      inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
    }));

    try {
      await websiteApi.updateInquiryStatus(id, status);
      // Refresh statistics
      const statsRes = await websiteApi.getInquiryStats();
      if (statsRes.data?.data) {
        set({ inquiryStats: statsRes.data.data });
      }
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
    }
  },

  getInquiryStats: () => get().inquiryStats,

  getInquiryById: (id) => get().inquiries.find((i) => i.id === id),
}));
