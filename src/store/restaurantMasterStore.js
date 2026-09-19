import { create } from "zustand";
import { defaultCategories, defaultMenuItems } from "../pages/menu/data/menuData";

/**
 * Restaurant Profile "master" for menu data.
 *
 * Every category / menu item created, edited or deleted in the Menu module is
 * mirrored here by menuStore, so the Restaurant Profile always reads the
 * latest master list.
 *
 * NOTE: if your Restaurant Profile already has its own store, keep the same
 * four actions (upsertCategory / removeCategory / upsertItem / removeItem)
 * there and point the import in menuStore.js at it.
 */
export const useRestaurantMasterStore = create((set) => ({
  menuCategories: defaultCategories.map((c) => ({ ...c })),
  menuItems: defaultMenuItems.map((i) => ({ ...i })),

  upsertCategory: (category) =>
    set((state) => {
      const exists = state.menuCategories.some((c) => c.id === category.id);
      return {
        menuCategories: exists
          ? state.menuCategories.map((c) => (c.id === category.id ? { ...c, ...category } : c))
          : [...state.menuCategories, { ...category }],
      };
    }),

  // Removing a category keeps its items in the master but un-categorised,
  // mirroring what the Menu module does.
  removeCategory: (id) =>
    set((state) => ({
      menuCategories: state.menuCategories.filter((c) => c.id !== id),
      menuItems: state.menuItems.map((i) => (i.categoryId === id ? { ...i, categoryId: null } : i)),
    })),

  upsertItem: (item) =>
    set((state) => {
      const exists = state.menuItems.some((i) => i.id === item.id);
      return {
        menuItems: exists
          ? state.menuItems.map((i) => (i.id === item.id ? { ...i, ...item } : i))
          : [...state.menuItems, { ...item }],
      };
    }),

  removeItem: (id) =>
    set((state) => ({ menuItems: state.menuItems.filter((i) => i.id !== id) })),
}));
