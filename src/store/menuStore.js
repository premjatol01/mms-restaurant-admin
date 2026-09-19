import { create } from "zustand";
import { defaultCategories, defaultMenuItems, defaultCombos } from "../pages/menu/data/menuData";
import { useRestaurantMasterStore } from "./restaurantMasterStore";

// Shorthand for the Restaurant Profile master (see restaurantMasterStore.js)
const master = () => useRestaurantMasterStore.getState();

export const useMenuStore = create((set, get) => ({
  categories: [...defaultCategories],
  menuItems: [...defaultMenuItems],
  combos: [...defaultCombos],
  loading: false,

  // ---------------------------------------------------------------- Categories
  // Returns the created category so callers (e.g. the inline "+ Create New
  // Category" in MenuItemForm) can use its real id.
  addCategory: (category) => {
    const newCategory = {
      description: "",
      image: null,
      ...category,
      id: category.id || `cat-${Date.now()}`,
      itemCount: 0,
      status: category.status || "active",
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
    master().upsertCategory(newCategory);
    return newCategory;
  },

  updateCategory: (id, data) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    const updated = get().categories.find((c) => c.id === id);
    if (updated) master().upsertCategory(updated);
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      menuItems: state.menuItems.map((item) => (item.categoryId === id ? { ...item, categoryId: null } : item)),
    }));
    master().removeCategory(id);
  },

  // --------------------------------------------------------------- Menu Items
  addMenuItem: (item) => {
    const newItem = {
      image: null,
      isPopular: false,
      ...item,
      id: `item-${Date.now()}`,
      status: item.status || "available",
    };
    set((state) => ({
      menuItems: [...state.menuItems, newItem],
      categories: state.categories.map((c) =>
        c.id === newItem.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c
      ),
    }));
    master().upsertItem(newItem);
    return newItem;
  },

  updateMenuItem: (id, data) => {
    set((state) => {
      const oldItem = state.menuItems.find((i) => i.id === id);
      const categoryChanged = oldItem && "categoryId" in data && oldItem.categoryId !== data.categoryId;
      // Build new objects instead of mutating the existing category objects
      const categories = categoryChanged
        ? state.categories.map((c) => {
            if (c.id === oldItem.categoryId) return { ...c, itemCount: Math.max(0, c.itemCount - 1) };
            if (c.id === data.categoryId) return { ...c, itemCount: c.itemCount + 1 };
            return c;
          })
        : state.categories;
      return {
        menuItems: state.menuItems.map((i) => (i.id === id ? { ...i, ...data } : i)),
        categories,
      };
    });
    const updated = get().menuItems.find((i) => i.id === id);
    if (updated) master().upsertItem(updated);
  },

  deleteMenuItem: (id) => {
    set((state) => {
      const item = state.menuItems.find((i) => i.id === id);
      return {
        menuItems: state.menuItems.filter((i) => i.id !== id),
        combos: state.combos.map((combo) => ({
          ...combo,
          itemIds: combo.itemIds.filter((iId) => iId !== id),
        })),
        categories: state.categories.map((c) =>
          c.id === item?.categoryId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
        ),
      };
    });
    master().removeItem(id);
  },

  // Popular items -> used by the Restaurant Website's menu section
  toggleMenuItemPopular: (id) => {
    const item = get().menuItems.find((i) => i.id === id);
    if (!item) return false;
    const next = !item.isPopular;
    get().updateMenuItem(id, { isPopular: next });
    return next;
  },

  getPopularItems: () => get().menuItems.filter((i) => i.isPopular),

  // ------------------------------------------------------------------- Combos
  addCombo: (combo) => set((state) => ({
    combos: [...state.combos, { ...combo, id: `combo-${Date.now()}`, status: combo.status || "available" }]
  })),

  updateCombo: (id, data) => set((state) => ({
    combos: state.combos.map((c) => (c.id === id ? { ...c, ...data } : c))
  })),

  deleteCombo: (id) => set((state) => ({
    combos: state.combos.filter((c) => c.id !== id)
  })),
}));
