// Dummy data for the Menu Master tab. Replace with the real API response later.

const category = (id, name, items) => ({
  id,
  name,
  description: "",
  image: null,
  source: "master", // "master" = from the master catalogue, "menu" = created in the Menu module
  editable: true,
  items: items.map((itemName, i) => ({
    id: `${id}-${i + 1}`,
    categoryId: id,
    name: itemName,
    description: "",
    image: null,
    source: "master",
    editable: true,
  })),
});

export const DUMMY_MASTER_CATEGORIES = [
  category("starters", "Starters", ["Paneer Tikka", "Veg Manchurian", "Hara Bhara Kebab", "Crispy Corn"]),
  category("main-course", "Main Course", ["Dal Makhani", "Kadai Paneer", "Butter Chicken", "Mix Veg"]),
  category("breads", "Breads", ["Butter Naan", "Tandoori Roti", "Garlic Naan"]),
  category("rice", "Rice & Biryani", ["Veg Biryani", "Jeera Rice", "Hyderabadi Chicken Biryani"]),
  category("desserts", "Desserts", ["Gulab Jamun", "Rasmalai", "Brownie with Ice Cream"]),
  category("beverages", "Beverages", ["Masala Chai", "Sweet Lassi", "Fresh Lime Soda"]),
];

// What this restaurant has already selected from the master.
export const DUMMY_MENU_SELECTION = {
  categoryIds: ["starters", "main-course"],
  itemIds: ["starters-1", "starters-2", "main-course-1"],
};
