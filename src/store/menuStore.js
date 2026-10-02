import { create } from "zustand";
import { menuApi } from "../api/menu.api";
import { useRestaurantMasterStore } from "./restaurantMasterStore";

const master = () => useRestaurantMasterStore.getState();

// Normalize MongoDB _id → id so the rest of the app uses a consistent `id` field
const norm = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: ((_id?._id ?? _id)?.toString?.() || _id || rest.id) };
};

export const useMenuStore = create((set, get) => ({
  categories: [],
  menuItems: [],
  combos: [],
  loading: false,
  error: null,
  loaded: false,

  fetchMenuData: async () => {
    if (get().loaded) return;
    set({ loading: true, error: null });
    try {
      const [catRes, itemRes, comboRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems(),
        menuApi.getCombos(),
      ]);
      set({
        categories: (catRes.data?.data || []).map(norm),
        menuItems: (itemRes.data?.data || []).map(norm),
        combos: (comboRes.data?.data || []).map(norm),
        loading: false,
        loaded: true,
      });
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to load menu data.",
      });
    }
  },

  // ---------------------------------------------------------------- Categories
  addCategory: async (category) => {
    try {
      const { data } = await menuApi.createCategory(category);
      const newCategory = norm(data?.data) || {
        ...category,
        id: `cat-${Date.now()}`,
        itemCount: 0,
        status: category.status || "active",
      };
      set((state) => ({ categories: [...state.categories, newCategory] }));
      master().upsertCategory(newCategory);
      return newCategory;
    } catch (err) {
      throw err;
    }
  },

  updateCategory: async (id, payload) => {
    try {
      await menuApi.updateCategory(id, payload);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      }));
      const updated = get().categories.find((c) => c.id === id);
      if (updated) master().upsertCategory(updated);
    } catch (err) {
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      await menuApi.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        menuItems: state.menuItems.map((item) =>
          item.categoryId === id ? { ...item, categoryId: null } : item
        ),
      }));
      master().removeCategory(id);
    } catch (err) {
      throw err;
    }
  },

  // --------------------------------------------------------------- Menu Items
  addMenuItem: async (item) => {
    try {
      const { data } = await menuApi.createItem(item);
      const newItem = norm(data?.data) || {
        ...item,
        id: `item-${Date.now()}`,
        status: item.status || "available",
        isPopular: false,
      };
      set((state) => ({
        menuItems: [...state.menuItems, newItem],
        categories: state.categories.map((c) =>
          c.id === newItem.categoryId ? { ...c, itemCount: (c.itemCount || 0) + 1 } : c
        ),
      }));
      master().upsertItem(newItem);
      return newItem;
    } catch (err) {
      throw err;
    }
  },

  updateMenuItem: async (id, payload) => {
    try {
      await menuApi.updateItem(id, payload);
      set((state) => {
        const oldItem = state.menuItems.find((i) => i.id === id);
        const categoryChanged =
          oldItem && "categoryId" in payload && oldItem.categoryId !== payload.categoryId;
        const categories = categoryChanged
          ? state.categories.map((c) => {
              if (c.id === oldItem.categoryId) return { ...c, itemCount: Math.max(0, (c.itemCount || 0) - 1) };
              if (c.id === payload.categoryId) return { ...c, itemCount: (c.itemCount || 0) + 1 };
              return c;
            })
          : state.categories;
        return {
          menuItems: state.menuItems.map((i) => (i.id === id ? { ...i, ...payload } : i)),
          categories,
        };
      });
      const updated = get().menuItems.find((i) => i.id === id);
      if (updated) master().upsertItem(updated);
    } catch (err) {
      throw err;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      await menuApi.deleteItem(id);
      set((state) => {
        const item = state.menuItems.find((i) => i.id === id);
        return {
          menuItems: state.menuItems.filter((i) => i.id !== id),
          combos: state.combos.map((combo) => ({
            ...combo,
            itemIds: combo.itemIds.filter((iId) => iId !== id),
          })),
          categories: state.categories.map((c) =>
            c.id === item?.categoryId ? { ...c, itemCount: Math.max(0, (c.itemCount || 0) - 1) } : c
          ),
        };
      });
      master().removeItem(id);
    } catch (err) {
      throw err;
    }
  },

  toggleMenuItemPopular: async (id) => {
    const item = get().menuItems.find((i) => i.id === id);
    if (!item) return false;
    const next = !item.isPopular;
    await get().updateMenuItem(id, { isPopular: next });
    return next;
  },

  getPopularItems: () => get().menuItems.filter((i) => i.isPopular),

  // ------------------------------------------------------------------- Combos
  addCombo: async (combo) => {
    try {
      const { data } = await menuApi.createCombo(combo);
      const newCombo = norm(data?.data) || {
        ...combo,
        id: `combo-${Date.now()}`,
        status: combo.status || "available",
      };
      set((state) => ({ combos: [...state.combos, newCombo] }));
      return newCombo;
    } catch (err) {
      throw err;
    }
  },

  updateCombo: async (id, payload) => {
    try {
      await menuApi.updateCombo(id, payload);
      set((state) => ({
        combos: state.combos.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      }));
    } catch (err) {
      throw err;
    }
  },

  deleteCombo: async (id) => {
    try {
      await menuApi.deleteCombo(id);
      set((state) => ({ combos: state.combos.filter((c) => c.id !== id) }));
    } catch (err) {
      throw err;
    }
  },
}));
