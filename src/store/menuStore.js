import { create } from "zustand";

const defaultCategories = [
  { id: "cat-1", name: "Starters", description: "Light dishes and appetizers", status: "active", itemCount: 5 },
  { id: "cat-2", name: "Main Course", description: "Hearty main dishes", status: "active", itemCount: 8 },
  { id: "cat-3", name: "Pizza", description: "Delicious pizzas", status: "active", itemCount: 6 },
  { id: "cat-4", name: "Burgers", description: "Gourmet burgers", status: "active", itemCount: 4 },
  { id: "cat-5", name: "Beverages", description: "Refreshing drinks", status: "active", itemCount: 7 },
  { id: "cat-6", name: "Desserts", description: "Sweet treats", status: "active", itemCount: 5 },
];

const defaultMenuItems = [
  { id: "item-1", name: "Margherita Pizza", categoryId: "cat-3", description: "Classic pizza with tomato and mozzarella", price: 299, image: null, status: "available" },
  { id: "item-2", name: "Veggie Supreme", categoryId: "cat-3", description: "Loaded with fresh vegetables", price: 349, image: null, status: "available" },
  { id: "item-3", name: "Chicken Burger", categoryId: "cat-4", description: "Grilled chicken with fresh veggies", price: 249, image: null, status: "available" },
  { id: "item-4", name: "Veg Burger", categoryId: "cat-4", description: "Crispy veg patty with special sauce", price: 199, image: null, status: "available" },
  { id: "item-5", name: "French Fries", categoryId: "cat-1", description: "Crispy golden fries", price: 99, image: null, status: "available" },
  { id: "item-6", name: "Garlic Bread", categoryId: "cat-1", description: "Toasted bread with garlic butter", price: 79, image: null, status: "available" },
  { id: "item-7", name: "Cold Coffee", categoryId: "cat-5", description: "Chilled coffee with ice cream", price: 149, image: null, status: "available" },
  { id: "item-8", name: "Mango Shake", categoryId: "cat-5", description: "Fresh mango milk shake", price: 129, image: null, status: "unavailable" },
  { id: "item-9", name: "Butter Chicken", categoryId: "cat-2", description: "Creamy tomato curry with butter", price: 349, image: null, status: "available" },
  { id: "item-10", name: "Paneer Tikka", categoryId: "cat-2", description: "Grilled paneer with spices", price: 299, image: null, status: "available" },
  { id: "item-11", name: "Chocolate Ice Cream", categoryId: "cat-6", description: "Rich chocolate ice cream", price: 89, image: null, status: "available" },
  { id: "item-12", name: "Gulab Jamun", categoryId: "cat-6", description: "Sweet milk balls in syrup", price: 69, image: null, status: "available" },
];

const defaultCombos = [
  { id: "combo-1", name: "Family Meal", description: "Perfect for family of 4", itemIds: ["item-1", "item-2", "item-5", "item-7"], price: 799, image: null, status: "available" },
  { id: "combo-2", name: "Burger Combo", description: "Burger with fries and drink", itemIds: ["item-3", "item-5", "item-7"], price: 399, image: null, status: "available" },
  { id: "combo-3", name: "Pizza Meal", description: "Pizza with garlic bread and drink", itemIds: ["item-1", "item-6", "item-7"], price: 499, image: null, status: "unavailable" },
];

export const useMenuStore = create((set, get) => ({
  categories: [...defaultCategories],
  menuItems: [...defaultMenuItems],
  combos: [...defaultCombos],
  loading: false,

  // Categories
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, { ...category, id: `cat-${Date.now()}`, itemCount: 0, status: category.status || "active" }]
  })),
  
  updateCategory: (id, data) => set((state) => ({
    categories: state.categories.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id),
    menuItems: state.menuItems.map((item) => item.categoryId === id ? { ...item, categoryId: null } : item)
  })),

  // Menu Items
  addMenuItem: (item) => set((state) => {
    const newItem = { ...item, id: `item-${Date.now()}`, status: item.status || "available" };
    const categories = state.categories.map((c) => 
      c.id === item.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c
    );
    return { menuItems: [...state.menuItems, newItem], categories };
  }),
  
  updateMenuItem: (id, data) => set((state) => {
    const oldItem = state.menuItems.find((i) => i.id === id);
    const categories = [...state.categories];
    if (oldItem && data.categoryId && oldItem.categoryId !== data.categoryId) {
      categories.forEach((c) => {
        if (c.id === oldItem.categoryId) c.itemCount = Math.max(0, c.itemCount - 1);
        if (c.id === data.categoryId) c.itemCount = c.itemCount + 1;
      });
    }
    return { menuItems: state.menuItems.map((i) => i.id === id ? { ...i, ...data } : i), categories };
  }),
  
  deleteMenuItem: (id) => set((state) => {
    const item = state.menuItems.find((i) => i.id === id);
    const categories = state.categories.map((c) => 
      c.id === item?.categoryId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
    );
    return { 
      menuItems: state.menuItems.filter((i) => i.id !== id),
      combos: state.combos.map((combo) => ({
        ...combo,
        itemIds: combo.itemIds.filter((iId) => iId !== id)
      })),
      categories
    };
  }),

  // Combos
  addCombo: (combo) => set((state) => ({
    combos: [...state.combos, { ...combo, id: `combo-${Date.now()}`, status: combo.status || "available" }]
  })),
  
  updateCombo: (id, data) => set((state) => ({
    combos: state.combos.map((c) => c.id === id ? { ...c, ...data } : c)
  })),
  
  deleteCombo: (id) => set((state) => ({
    combos: state.combos.filter((c) => c.id !== id)
  })),
}));