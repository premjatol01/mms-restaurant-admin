import { useMemo } from "react";
import { menuCategories, menuItems } from "../data/menu";

// The Website module reads menu data ONLY through these hooks.
// TODO: replace the dummy import above with the Menu module store, for example:
//   const { categories, items } = useMenuStore();
// Each item is expected to have: id, name, description, price, categoryId, isVeg, isPopular, isAvailable.
export function useMenuItems() {
  return { categories: menuCategories, items: menuItems };
}

// Items marked Popular in the Menu module. Unavailable items are left out automatically.
export function usePopularMenuItems() {
  const { items } = useMenuItems();
  return useMemo(() => items.filter((item) => item.isPopular && item.isAvailable), [items]);
}
