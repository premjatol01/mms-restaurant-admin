import { useEffect, useMemo } from "react";
import { useMenuStore } from "../../../store/menuStore";

// The Website module reads menu data from the Menu store (DB).
// Each item has: id, name, description, price, categoryId, isVeg, isPopular, isAvailable, image, etc.
export function useMenuItems() {
  const categories = useMenuStore((state) => state.categories);
  const menuItems = useMenuStore((state) => state.menuItems);
  const loading = useMenuStore((state) => state.loading);
  const loaded = useMenuStore((state) => state.loaded);
  const fetchMenuData = useMenuStore((state) => state.fetchMenuData);

  useEffect(() => {
    if (!loaded && !loading) {
      fetchMenuData();
    }
  }, [loaded, loading, fetchMenuData]);

  // Normalize items to ensure consistent isAvailable and isVeg flags
  const items = useMemo(() => {
    return (menuItems || []).map((item) => {
      const isAvailable = item.status === "available" || item.isAvailable === true;
      const isVeg = item.isVeg !== undefined ? item.isVeg : (item.foodType === "veg");
      return {
        ...item,
        id: item.id || item._id,
        isAvailable,
        isVeg,
      };
    });
  }, [menuItems]);

  return {
    categories: categories || [],
    items,
    loading,
    loaded,
  };
}

// Items marked Popular in the Menu module that are currently available
export function usePopularMenuItems() {
  const { items } = useMenuItems();
  return useMemo(() => {
    return items.filter((item) => item.isPopular && item.isAvailable);
  }, [items]);
}
