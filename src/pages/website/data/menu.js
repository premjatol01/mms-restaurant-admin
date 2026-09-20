// Dummy menu data. Mirrors the shape of the Menu module.
// The Website module only reads it through hooks/useMenuItems.js, so this file can be
// deleted once that hook points to the real Menu store.

export const menuCategories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Main Course" },
  { id: "breads", name: "Breads & Rice" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" }
];

export const menuItems = [
  { id: "m1", categoryId: "starters", name: "Paneer Tikka", description: "Charcoal-grilled cottage cheese marinated in yogurt and spices.", price: 289, isVeg: true, isPopular: true, isAvailable: true },
  { id: "m2", categoryId: "starters", name: "Chicken 65", description: "Crispy fried chicken tossed with curry leaves and green chillies.", price: 319, isVeg: false, isPopular: false, isAvailable: true },
  { id: "m3", categoryId: "starters", name: "Hara Bhara Kebab", description: "Spinach and green pea patties, pan-seared until golden.", price: 249, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m4", categoryId: "mains", name: "Butter Chicken", description: "Tandoori chicken simmered in a silky tomato and butter gravy.", price: 379, isVeg: false, isPopular: true, isAvailable: true },
  { id: "m5", categoryId: "mains", name: "Dal Makhani", description: "Black lentils slow-cooked overnight with cream and butter.", price: 269, isVeg: true, isPopular: true, isAvailable: true },
  { id: "m6", categoryId: "mains", name: "Palak Paneer", description: "Cottage cheese cubes in a smooth, lightly spiced spinach gravy.", price: 289, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m7", categoryId: "mains", name: "Lamb Rogan Josh", description: "Kashmiri-style braised lamb with whole spices.", price: 449, isVeg: false, isPopular: true, isAvailable: false },
  { id: "m8", categoryId: "breads", name: "Garlic Naan", description: "Tandoor-baked flatbread brushed with garlic butter.", price: 79, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m9", categoryId: "breads", name: "Hyderabadi Chicken Biryani", description: "Fragrant basmati layered with marinated chicken, served with raita.", price: 349, isVeg: false, isPopular: true, isAvailable: true },
  { id: "m10", categoryId: "breads", name: "Veg Dum Biryani", description: "Seasonal vegetables and saffron rice, sealed and slow-cooked.", price: 299, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m11", categoryId: "desserts", name: "Gulab Jamun", description: "Warm milk dumplings soaked in cardamom syrup.", price: 129, isVeg: true, isPopular: true, isAvailable: true },
  { id: "m12", categoryId: "desserts", name: "Rasmalai", description: "Soft paneer discs in chilled saffron milk.", price: 149, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m13", categoryId: "beverages", name: "Masala Chai", description: "Assam tea brewed with ginger and cardamom.", price: 59, isVeg: true, isPopular: false, isAvailable: true },
  { id: "m14", categoryId: "beverages", name: "Mango Lassi", description: "Thick yogurt shake blended with Alphonso mango.", price: 119, isVeg: true, isPopular: true, isAvailable: true },
  { id: "m15", categoryId: "beverages", name: "Fresh Lime Soda", description: "Sweet, salted or mixed. Made to order.", price: 89, isVeg: true, isPopular: false, isAvailable: true }
];
