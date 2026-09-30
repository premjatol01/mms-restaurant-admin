import { create } from "zustand";
import { profileApi } from "../api/profileApi";
import { DUMMY_TABLES, createDummyQr, createDummyTable } from "../pages/profile/data/tablesData";
import { getDummySubscription } from "../pages/profile/data/subscriptionData";

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
  googleReviewLink: "",
  settings: {
    isActive: true,
    acceptOrders: true,
    showOnPublicWebsite: true,
  },
};

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const localImage = (file) => (file instanceof File ? URL.createObjectURL(file) : null);

// Table helpers. Existing tables and their QR codes are never overwritten:
// new tables are appended, and QR codes are only filled in where a table has none.
const appendNewTables = (existing, incoming) => {
  const known = new Set(existing.map((t) => t.id));
  return [...existing, ...incoming.filter((t) => !known.has(t.id))].sort((a, b) => a.number - b.number);
};
const fillMissingQr = (tables, qrById) =>
  tables.map((t) => (!t.qrCode && qrById.get(t.id) ? { ...t, qrCode: qrById.get(t.id) } : t));

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
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load profile.";
      set({ loading: false, error: message });
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
      // Section saves send a partial payload ({ contact }, { settings }, ...).
      // If the API doesn't echo the full profile back, merge into the current one
      // instead of replacing the whole profile with the partial payload.
      const saved = data?.data || { ...get().profile, ...payload };
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
      const logo = data.data?.logo ?? null;
      set((state) => ({
        profile: { ...state.profile, logo },
        originalProfile: { ...state.originalProfile, logo },
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to upload logo." };
    }
  },

  removeLogo: async () => {
    try {
      await profileApi.removeLogo();
      set((state) => ({
        profile: { ...state.profile, logo: null },
        originalProfile: { ...state.originalProfile, logo: null },
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to remove logo." };
    }
  },

  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append("cover", file);
    try {
      const { data } = await profileApi.uploadCover(formData);
      const coverImage = data.data?.coverImage ?? null;
      set((state) => ({
        profile: { ...state.profile, coverImage },
        originalProfile: { ...state.originalProfile, coverImage },
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to upload cover image." };
    }
  },

  removeCover: async () => {
    try {
      await profileApi.removeCover();
      set((state) => ({
        profile: { ...state.profile, coverImage: null },
        originalProfile: { ...state.originalProfile, coverImage: null },
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to remove cover image." };
    }
  },

  // ===========================================================================
  // Menu master, tables and subscription.
  //
  // These run on the dummy data in pages/profile/data for now, held in memory
  // (they reset on page reload). Each action returns { success, ... } like the
  // profile actions above, so swapping in the real API later means replacing the
  // body of each action — the components don't need to change. Look for TODO.
  // ===========================================================================

  // ---------- Menu master ----------
  menuCategories: [], // master catalogue; each category carries its own `items`
  menuSelection: { categoryIds: [], itemIds: [] }, // what this restaurant selected (saved)
  menuLoaded: false,

  fetchMenuMaster: async () => {
    if (get().menuLoaded) return;
    try {
      const [catRes, itemRes] = await Promise.all([
        profileApi.getMasterCategories(),
        profileApi.getMasterItems()
      ]);

      const rawCategories = catRes.data.data || [];
      const rawItems = itemRes.data.data || [];

      const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace('/api', '');
      const getImageUrl = (path) => (path && !path.startsWith('http') ? `${baseUrl}${path}` : path);

      const itemsByCat = {};
      rawItems.forEach(item => {
        const catId = item.categoryId?._id || item.categoryId;
        if (!itemsByCat[catId]) itemsByCat[catId] = [];
        
        itemsByCat[catId].push({
          id: item._id,
          categoryId: catId,
          name: item.name,
          description: "", 
          image: getImageUrl(item.image),
          source: "master",
          editable: false,
        });
      });

      const menuCategories = rawCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description || "",
        image: null,
        source: "master",
        editable: false,
        items: itemsByCat[cat._id] || []
      }));

      const savedSelection = get().profile?.masterMenuSelection || { categoryIds: [], itemIds: [] };
      set({ menuCategories, menuSelection: savedSelection, menuLoaded: true });
    } catch (err) {
      console.error("Failed to fetch master menu:", err);
      // Fallback to empty if error
      set({ menuCategories: [], menuSelection: { categoryIds: [], itemIds: [] }, menuLoaded: true });
    }
  },

  saveMenuSelection: async (selection) => {
    try {
      await profileApi.saveMenuSelection(selection);
      set({ menuSelection: selection });
      return { success: true };
    } catch (err) {
      console.error("Failed to save menu selection:", err);
      return { success: false, message: err?.response?.data?.message || "Failed to save menu selection." };
    }
  },

  // image: optional File. In the real API send multipart/form-data with `image`.
  createMasterCategory: async (values) => {
    // TODO: const { data } = await profileApi.createMasterCategory(formData);
    const category = {
      id: newId("cat"),
      name: values.name,
      description: values.description || "",
      image: localImage(values.image),
      source: "master",
      editable: true,
      items: [],
    };
    set((s) => ({ menuCategories: [...s.menuCategories, category] }));
    return { success: true, category };
  },

  updateMasterCategory: async (id, values) => {
    // TODO: const { data } = await profileApi.updateMasterCategory(id, formData);
    set((s) => ({
      menuCategories: s.menuCategories.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              name: values.name,
              description: values.description || "",
              image: values.image instanceof File ? localImage(values.image) : values.removeImage ? null : c.image,
            }
      ),
    }));
    return { success: true };
  },

  createMasterItem: async ({ categoryId, ...values }) => {
    // TODO: const { data } = await profileApi.createMasterItem(formData);
    const item = {
      id: newId("item"),
      categoryId,
      name: values.name,
      description: values.description || "",
      image: localImage(values.image),
      source: "master",
      editable: true,
    };
    set((s) => ({
      menuCategories: s.menuCategories.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, item] } : c)),
    }));
    return { success: true, item };
  },

  updateMasterItem: async (id, values) => {
    // TODO: const { data } = await profileApi.updateMasterItem(id, formData);
    set((s) => ({
      menuCategories: s.menuCategories.map((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id !== id
            ? i
            : {
                ...i,
                name: values.name,
                description: values.description || "",
                image: values.image instanceof File ? localImage(values.image) : values.removeImage ? null : i.image,
              }
        ),
      })),
    }));
    return { success: true };
  },

  // Hook for the Menu module. The backend should add anything created in Menu to the master
  // (and to this restaurant's selection) itself; this only mirrors that into the store so the
  // Menu Master tab is current without a refetch. Call it after a category / item is created:
  //   useProfileStore.getState().upsertFromMenu("category", createdCategory)
  //   useProfileStore.getState().upsertFromMenu("item", createdItem)   // needs item.categoryId
  upsertFromMenu: (type, entity) => {
    set((s) => {
      if (type === "category") {
        const exists = s.menuCategories.some((c) => c.id === entity.id);
        const menuCategories = exists
          ? s.menuCategories.map((c) => (c.id === entity.id ? { ...c, ...entity, items: c.items } : c))
          : [...s.menuCategories, { items: [], description: "", image: null, editable: true, ...entity, source: "menu" }];
        const categoryIds = s.menuSelection.categoryIds.includes(entity.id)
          ? s.menuSelection.categoryIds
          : [...s.menuSelection.categoryIds, entity.id];
        return { menuCategories, menuSelection: { ...s.menuSelection, categoryIds } };
      }

      const parent = s.menuCategories.find((c) => c.id === entity.categoryId);
      if (!parent) return s; // parent not loaded yet — the next fetch picks it up
      const exists = parent.items.some((i) => i.id === entity.id);
      const menuCategories = s.menuCategories.map((c) =>
        c.id !== parent.id
          ? c
          : {
              ...c,
              items: exists
                ? c.items.map((i) => (i.id === entity.id ? { ...i, ...entity } : i))
                : [...c.items, { description: "", image: null, editable: true, ...entity, source: "menu" }],
            }
      );
      const itemIds = s.menuSelection.itemIds.includes(entity.id)
        ? s.menuSelection.itemIds
        : [...s.menuSelection.itemIds, entity.id];
      return { menuCategories, menuSelection: { ...s.menuSelection, itemIds } };
    });
  },

  // ---------- Templates ----------
  qrTemplates: [],
  templatesLoaded: false,

  fetchQrTemplates: async () => {
    if (get().templatesLoaded) return;
    try {
      const { data } = await profileApi.getTemplates();
      set({ qrTemplates: data, templatesLoaded: true });
    } catch (error) {
      console.error("Failed to load templates", error);
      set({ qrTemplates: [], templatesLoaded: true });
    }
  },

  // ---------- Tables ----------
  tables: [], 
  tablesLoaded: false,

  fetchTables: async () => {
    if (get().tablesLoaded) return;
    try {
      const { data } = await profileApi.getTables();
      set({ tables: data.data || [], tablesLoaded: true });
    } catch (error) {
      console.error("Failed to load tables", error);
      set({ tables: [], tablesLoaded: true });
    }
  },

  createTables: async ({ count, assignQr, qrType }) => {
    try {
      // In backend, qrType translates to templateId (if assigned).
      const payload = { count, templateId: assignQr ? qrType : null };
      const { data } = await profileApi.createTables(payload);
      
      const newTables = data.data || [];
      // Replace existing code that appended manually, since backend returns created ones
      // and we just append them to the current list
      set((s) => ({ tables: [...s.tables, ...newTables].sort((a, b) => a.number - b.number) }));
      return { success: true, created: count };
    } catch (error) {
      console.error("Failed to create tables", error);
      return { success: false, message: error?.response?.data?.message || "Failed to create tables." };
    }
  },

  assignTableQr: async (tableId, qrType = "tpl-1") => {
    const table = get().tables.find((t) => t.id === tableId);
    if (!table) return { success: false, message: "Table not found." };
    if (table.qrCode) return { success: false, message: "This table already has a QR code." };
    // TODO: const { data } = await profileApi.assignTableQr(tableId, qrType);
    set((s) => ({ tables: fillMissingQr(s.tables, new Map([[tableId, createDummyQr(qrType)]])) }));
    return { success: true };
  },

  assignAllTableQr: async (qrType = "tpl-1") => {
    // TODO: const { data } = await profileApi.assignAllTableQr({ qrType }); — skips tables that already have one.
    const qrById = new Map(get().tables.filter((t) => !t.qrCode).map((t) => [t.id, createDummyQr(qrType)]));
    set((s) => ({ tables: fillMissingQr(s.tables, qrById) }));
    return { success: true, assigned: qrById.size };
  },

  // ---------- Subscription (read-only) ----------
  subscription: null,

  fetchSubscription: async () => {
    if (get().subscription) return;
    // TODO: const { data } = await profileApi.getSubscription();
    set({ subscription: getDummySubscription() });
  },
}));
