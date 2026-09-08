import { create } from "zustand";
import { profileApi } from "../api/profileApi";

const defaultProfile = {
  name: "",
  tagline: "",
  shortDescription: "",
  fullDescription: "",
  restaurantType: "",
  cuisineTypes: [],
  establishmentYear: "",
  status: "active",
  logo: null,
  coverImage: null,
  contact: {
    primaryPhone: "",
    alternatePhone: "",
    email: "",
    alternateEmail: "",
    whatsapp: "",
    supportPhone: "",
  },
  address: {
    line1: "",
    line2: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
  },
  businessHours: [
    { day: "Monday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Tuesday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Wednesday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Thursday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Friday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Saturday", isOpen: true, slots: [{ open: "10:00", close: "23:00" }] },
    { day: "Sunday", isOpen: false, slots: [{ open: "10:00", close: "23:00" }] },
  ],
  socialLinks: {
    instagram: "",
    facebook: "",
    youtube: "",
    twitter: "",
    whatsapp: "",
    other: "",
  },
  website: {
    subdomain: "",
    status: "inactive",
  },
  settings: {
    isActive: true,
    acceptOrders: true,
    isVisible: true,
    showOnPublicWebsite: true,
    displayName: true,
    displayLogo: true,
    displayContact: true,
    displayAddress: true,
    displayHours: true,
    enableOrdering: true,
    allowCustomerPhone: true,
  },
};

export const useProfileStore = create((set, get) => ({
  profile: null,
  originalProfile: null,
  loading: false,
  saving: false,
  error: null,
  isDirty: false,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await profileApi.get();
      const profile = data.data || defaultProfile;
      set({ profile, originalProfile: profile, loading: false });
    } catch {
      // Use mock data for development
      set({ profile: { ...defaultProfile, name: "Spice Garden Restaurant", tagline: "Authentic Indian Flavors", status: "active" }, originalProfile: { ...defaultProfile, name: "Spice Garden Restaurant", tagline: "Authentic Indian Flavors", status: "active" }, loading: false });
    }
  },

  updateField: (section, field, value) => {
    set((state) => {
      const updated = section
        ? { ...state.profile, [section]: { ...state.profile[section], [field]: value } }
        : { ...state.profile, [field]: value };
      return { profile: updated, isDirty: true };
    });
  },

  updateSection: (section, data) => {
    set((state) => ({
      profile: { ...state.profile, [section]: { ...state.profile[section], ...data } },
      isDirty: true,
    }));
  },

  updateProfile: (data) => {
    set((state) => ({ profile: { ...state.profile, ...data }, isDirty: true }));
  },

  saveProfile: async (sectionData) => {
    set({ saving: true });
    try {
      const payload = sectionData || get().profile;
      const { data } = await profileApi.update(payload);
      const saved = data.data || payload;
      set({ profile: saved, originalProfile: saved, saving: false, isDirty: false });
      return { success: true };
    } catch (err) {
      set({ saving: false });
      return { success: false, message: err?.response?.data?.message || "Failed to save changes." };
    }
  },

  discardChanges: () => {
    set((state) => ({ profile: state.originalProfile, isDirty: false }));
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const { data } = await profileApi.uploadLogo(formData);
      set((state) => ({ profile: { ...state.profile, logo: data.url }, originalProfile: { ...state.originalProfile, logo: data.url } }));
      return { success: true };
    } catch {
      return { success: false, message: "Failed to upload logo." };
    }
  },

  removeLogo: async () => {
    try {
      await profileApi.removeLogo();
      set((state) => ({ profile: { ...state.profile, logo: null }, originalProfile: { ...state.originalProfile, logo: null } }));
      return { success: true };
    } catch {
      return { success: false, message: "Failed to remove logo." };
    }
  },

  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append("cover", file);
    try {
      const { data } = await profileApi.uploadCover(formData);
      set((state) => ({ profile: { ...state.profile, coverImage: data.url }, originalProfile: { ...state.originalProfile, coverImage: data.url } }));
      return { success: true };
    } catch {
      return { success: false, message: "Failed to upload cover image." };
    }
  },

  removeCover: async () => {
    try {
      await profileApi.removeCover();
      set((state) => ({ profile: { ...state.profile, coverImage: null }, originalProfile: { ...state.originalProfile, coverImage: null } }));
      return { success: true };
    } catch {
      return { success: false, message: "Failed to remove cover image." };
    }
  },
}));
