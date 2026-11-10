import { create } from "zustand";
import { toast } from "sonner";
import { websiteApi } from "../api/website.api";
import { defaultSections } from "../pages/website/data/sections";
import { DEFAULT_WEBSITE_COLORS, BASE_DOMAIN } from "../pages/website/utils/constants";
import { useProfileStore } from "./profileStore";

export const useWebsiteStore = create((set, get) => ({
  // Website config
  websiteStatus: "draft",
  hasDraft: false,
  restaurantId: null,
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
      // Ensure profile is loaded so coverImage is present if not already fetched
      if (!useProfileStore.getState().profile) {
        useProfileStore.getState().fetchProfile().catch(() => {});
      }
      const res = await websiteApi.getConfig();
      const payload = res.data?.data;
      if (payload) {
        const { config, sections } = payload;
        const profileCover = useProfileStore.getState().profile?.coverImage;
        const profileReviewLink = useProfileStore.getState().profile?.googleReviewLink || "";
        let rawSections = sections && sections.length > 0 ? sections : [...defaultSections];
        const hasGoogleReview = rawSections.some((s) => s.id === "googleReview" || s.type === "googleReview");
        if (!hasGoogleReview) {
          const defaultGoogleReview = defaultSections.find((s) => s.id === "googleReview");
          if (defaultGoogleReview) {
            rawSections = [
              ...rawSections,
              {
                ...defaultGoogleReview,
                content: {
                  ...defaultGoogleReview.content,
                  googleReviewLink: profileReviewLink || defaultGoogleReview.content.googleReviewLink || ""
                }
              }
            ];
            rawSections.sort((a, b) => a.order - b.order);
          }
        }
        const normalizedSections = rawSections.map((s) => {
          if (s.id === "hero" && !s.content?.imageUrl && profileCover) {
            return { ...s, content: { ...s.content, imageUrl: profileCover } };
          }
          if (s.id === "googleReview" && !s.content?.googleReviewLink && profileReviewLink) {
            return { ...s, content: { ...s.content, googleReviewLink: profileReviewLink } };
          }
          return s;
        });

        set({
          websiteStatus: config?.websiteStatus || "draft",
          hasDraft: config?.hasDraft || false,
          restaurantId: config?.restaurantId?.toString() || null,
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
          sections: normalizedSections,
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
    set({ websiteColors: updated, hasDraft: true });

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

  // Update Section Content — saves as draft, marks hasDraft: true
  updateSection: async (sectionId, content, extra = {}) => {
    const enabled = extra.enabled !== undefined ? extra.enabled : content?.enabled;
    const title = extra.title !== undefined ? extra.title : (content?.title || content?.sectionTitle);
    const description = extra.description !== undefined ? extra.description : (content?.description || content?.sectionDescription);

    // Optimistic local update (admin sees their changes immediately in the builder)
    set((state) => ({
      hasDraft: true,
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              ...(enabled !== undefined ? { enabled } : {}),
              ...(title !== undefined ? { title } : {}),
              ...(description !== undefined ? { description } : {}),
              content: { ...s.content, ...content }
            }
          : s
      ),
    }));

    // Keep profile cover image in sync if Hero image was modified
    if (sectionId === "hero" && content && content.imageUrl !== undefined) {
      const newCover = content.imageUrl || null;
      useProfileStore.setState((state) => ({
        profile: state.profile ? { ...state.profile, coverImage: newCover } : state.profile,
        originalProfile: state.originalProfile ? { ...state.originalProfile, coverImage: newCover } : state.originalProfile,
      }));
    }

    // Keep profile googleReviewLink in sync if Google Review section was modified
    if (sectionId === "googleReview" && content && content.googleReviewLink !== undefined) {
      const newLink = content.googleReviewLink || "";
      useProfileStore.setState((state) => ({
        profile: state.profile ? { ...state.profile, googleReviewLink: newLink } : state.profile,
        originalProfile: state.originalProfile ? { ...state.originalProfile, googleReviewLink: newLink } : state.originalProfile,
      }));
    }

    try {
      const payload = { content };
      if (enabled !== undefined) payload.enabled = enabled;
      if (title !== undefined) payload.title = title;
      if (description !== undefined) payload.description = description;

      await websiteApi.updateSection(sectionId, payload);
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

    set((state) => ({
      hasDraft: true,
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: newEnabled } : s
      ),
    }));

    try {
      await websiteApi.toggleSection(sectionId, newEnabled);
      toast.success(
        `${section.title || "Section"} ${newEnabled ? "enabled" : "disabled"}`
      );
    } catch (err) {
      console.error("Failed to toggle section:", err);
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, enabled: !newEnabled } : s
        ),
      }));
      toast.error(`Failed to update ${section.title || "section"}`);
    }
  },

  // Publish / Unpublish website
  publishWebsite: async () => {
    set({ websiteStatus: "published", hasDraft: false });
    try {
      await websiteApi.publishWebsite();
    } catch (err) {
      console.error("Failed to publish website:", err);
      set({ websiteStatus: "draft", hasDraft: true });
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

  saveDraft: async () => {
    set({ hasDraft: true });
    try {
      await websiteApi.saveDraft();
    } catch (err) {
      console.error("Failed to save draft:", err);
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
