// Dummy data for the Menu module.
// Items are defined first so category item counts can be derived from them.

export const defaultMenuItems = [
  { id: "item-1", name: "Margherita Pizza", categoryId: "cat-3", description: "Classic pizza with tomato and mozzarella", price: 299, image: null, status: "available", isPopular: true },
  { id: "item-2", name: "Veggie Supreme", categoryId: "cat-3", description: "Loaded with fresh vegetables", price: 349, image: null, status: "available", isPopular: false },
  { id: "item-3", name: "Chicken Burger", categoryId: "cat-4", description: "Grilled chicken with fresh veggies", price: 249, image: null, status: "available", isPopular: true },
  { id: "item-4", name: "Veg Burger", categoryId: "cat-4", description: "Crispy veg patty with special sauce", price: 199, image: null, status: "available", isPopular: false },
  { id: "item-5", name: "French Fries", categoryId: "cat-1", description: "Crispy golden fries", price: 99, image: null, status: "available", isPopular: false },
  { id: "item-6", name: "Garlic Bread", categoryId: "cat-1", description: "Toasted bread with garlic butter", price: 79, image: null, status: "available", isPopular: false },
  { id: "item-7", name: "Cold Coffee", categoryId: "cat-5", description: "Chilled coffee with ice cream", price: 149, image: null, status: "available", isPopular: false },
  { id: "item-8", name: "Mango Shake", categoryId: "cat-5", description: "Fresh mango milk shake", price: 129, image: null, status: "unavailable", isPopular: false },
  { id: "item-9", name: "Butter Chicken", categoryId: "cat-2", description: "Creamy tomato curry with butter", price: 349, image: null, status: "available", isPopular: true },
  { id: "item-10", name: "Paneer Tikka", categoryId: "cat-2", description: "Grilled paneer with spices", price: 299, image: null, status: "available", isPopular: false },
  { id: "item-11", name: "Chocolate Ice Cream", categoryId: "cat-6", description: "Rich chocolate ice cream", price: 89, image: null, status: "available", isPopular: false },
  { id: "item-12", name: "Gulab Jamun", categoryId: "cat-6", description: "Sweet milk balls in syrup", price: 69, image: null, status: "available", isPopular: false },
];

const baseCategories = [
  { id: "cat-1", name: "Starters", description: "Light dishes and appetizers", status: "active", image: null },
  { id: "cat-2", name: "Main Course", description: "Hearty main dishes", status: "active", image: null },
  { id: "cat-3", name: "Pizza", description: "Delicious pizzas", status: "active", image: null },
  { id: "cat-4", name: "Burgers", description: "Gourmet burgers", status: "active", image: null },
  { id: "cat-5", name: "Beverages", description: "Refreshing drinks", status: "active", image: null },
  { id: "cat-6", name: "Desserts", description: "Sweet treats", status: "active", image: null },
];

export const defaultCategories = baseCategories.map((category) => ({
  ...category,
  itemCount: defaultMenuItems.filter((item) => item.categoryId === category.id).length,
}));

export const defaultCombos = [
  { id: "combo-1", name: "Family Meal", description: "Perfect for family of 4", itemIds: ["item-1", "item-2", "item-5", "item-7"], price: 799, image: null, status: "available" },
  { id: "combo-2", name: "Burger Combo", description: "Burger with fries and drink", itemIds: ["item-3", "item-5", "item-7"], price: 399, image: null, status: "available" },
  { id: "combo-3", name: "Pizza Meal", description: "Pizza with garlic bread and drink", itemIds: ["item-1", "item-6", "item-7"], price: 499, image: null, status: "unavailable" },
];
