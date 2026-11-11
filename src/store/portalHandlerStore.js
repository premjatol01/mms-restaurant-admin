import { create } from "zustand";
import { toast } from "sonner";

// Default dummy static data for Menu Order Portal Handler
const DEFAULT_PORTAL_DATA = {
  general: {
    portalName: "The Spice Garden - Dine-In Menu",
    portalStatus: "active",
    subdomain: "spicegarden",
  },

  // 1. Top 5 Categories (all available categories can be selected, up to 5)
  topCategories: {
    maxSelection: 5,
    selectedIds: ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5"],
    // Fallback categories list if DB has no categories loaded yet
    fallbackList: [
      { id: "cat-1", name: "Starters & Appetizers", itemCount: 16, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-2", name: "Main Course Delicacies", itemCount: 24, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-3", name: "Hyderabadi Biryani", itemCount: 10, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-4", name: "Artisan Pizzas", itemCount: 14, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-5", name: "Desserts & Shakes", itemCount: 12, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-6", name: "Beverages & Mocktails", itemCount: 18, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-7", name: "Tandoori & Grills", itemCount: 15, image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-8", name: "Soups & Warm Bowls", itemCount: 8, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-9", name: "Chinese & Asian Wok", itemCount: 19, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-10", name: "Breads & Roti Tokri", itemCount: 11, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80" },
    ],
  },

  // 2. Best Selling Items (manually selected items from available DB items)
  bestSelling: {
    selectedItems: [
      {
        id: "item-101",
        name: "Butter Chicken Masala (Special)",
        category: "Main Course Delicacies",
        price: 380,
        isVeg: false,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "item-102",
        name: "Paneer Butter Tikka Masala",
        category: "Main Course Delicacies",
        price: 320,
        isVeg: true,
        image: "https://images.unsplash.com/photo-1567184109191-37764e7fadd9?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "item-103",
        name: "Hyderabadi Dum Chicken Biryani",
        category: "Hyderabadi Biryani",
        price: 340,
        isVeg: false,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "item-104",
        name: "Crispy Peri Peri Loaded Fries",
        category: "Starters & Appetizers",
        price: 180,
        isVeg: true,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "item-105",
        name: "Wood-Fired Farmhouse Pizza (10\")",
        category: "Artisan Pizzas",
        price: 350,
        isVeg: true,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=80",
      },
      {
        id: "item-106",
        name: "Sizzling Chocolate Walnut Brownie",
        category: "Desserts & Shakes",
        price: 195,
        isVeg: true,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80",
      },
    ],
    // Fallback items if DB has no items loaded yet
    fallbackCatalog: [
      { id: "item-107", name: "Afghani Malai Soya Chaap", category: "Starters & Appetizers", price: 260, isVeg: true, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80" },
      { id: "item-108", name: "Virgin Mojito Mint Cooler", category: "Beverages & Mocktails", price: 140, isVeg: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80" },
      { id: "item-109", name: "Cheese Garlic Naan Platter", category: "Breads & Roti Tokri", price: 110, isVeg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80" },
      { id: "item-110", name: "Veg Schezwan Hakka Noodles", category: "Chinese & Asian Wok", price: 220, isVeg: true, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80" },
    ],
  },

  // 3. Offers Management for Portal (enable/disable section and update content only; data comes from offers & promos module)
  offers: {
    enabled: true,
    title: "Special Table Offers & Promos",
    subtitle: "Applicable directly to your dine-in table order at checkout",
    bannerAnnouncement: "Show active coupon code to your server or apply directly in table session",
  },

  // 4. Request Waiter Option Handler (add options, update text, update time only)
  waiterRequest: {
    enabled: true,
    cooldownMinutes: 2,
    instructionsText: "A service captain has been notified and is heading to your table.",
    options: [
      { id: "opt-1", label: "Call Waiter" },
      { id: "opt-2", label: "Water Refill" },
      { id: "opt-3", label: "Extra Cutlery & Napkins" },
      { id: "opt-4", label: "Request Bill & Pay" },
      { id: "opt-5", label: "Clean Table" },
    ],
  },

  // 5. Social Media Handler
  socialMedia: {
    instagram: {
      enabled: true,
      handle: "@thespicegarden.eats",
      url: "https://instagram.com/thespicegarden.eats",
      followersDisplay: "14.2K Foodies",
    },
    googleReview: {
      enabled: true,
      placeName: "The Spice Garden Restaurant & Bar",
      reviewUrl: "https://g.page/r/thespicegarden/review",
      starRating: "4.9",
      reviewCount: 940,
    },
    whatsapp: {
      enabled: true,
      number: "+91 98765 43210",
      displayNumber: "+91 98765 43210",
      supportLabel: "Concierge & Manager Helpline",
    },
    facebook: {
      enabled: true,
      url: "https://facebook.com/thespicegardeneats",
      pageName: "The Spice Garden",
    },
    wifiSharing: {
      enabled: true,
      ssid: "SpiceGarden_Guest_5G",
      password: "spicegarden2026",
      security: "WPA2",
    },
  },
};

const STORAGE_KEY = "tablly_portal_handler_settings_v2";

const loadStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PORTAL_DATA,
        ...parsed,
        topCategories: {
          ...DEFAULT_PORTAL_DATA.topCategories,
          ...(parsed.topCategories || {}),
        },
        bestSelling: {
          ...DEFAULT_PORTAL_DATA.bestSelling,
          ...(parsed.bestSelling || {}),
        },
        offers: {
          ...DEFAULT_PORTAL_DATA.offers,
          ...(parsed.offers || {}),
        },
        waiterRequest: {
          ...DEFAULT_PORTAL_DATA.waiterRequest,
          ...(parsed.waiterRequest || {}),
        },
      };
    }
  } catch (e) {
    console.error("Failed to parse stored portal settings:", e);
  }
  return DEFAULT_PORTAL_DATA;
};

export const usePortalHandlerStore = create((set, get) => ({
  portalData: loadStoredData(),
  activeTab: "categories", // Default to Top 5 Categories
  isDirty: false,
  saving: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  // 1. Top 5 Categories Actions (Simple Selection of up to 5 categories)
  toggleCategorySelection: (categoryId) => {
    set((state) => {
      const currentSelected = state.portalData.topCategories.selectedIds || [];
      const isAlreadySelected = currentSelected.includes(categoryId);

      if (isAlreadySelected) {
        // Deselect
        return {
          portalData: {
            ...state.portalData,
            topCategories: {
              ...state.portalData.topCategories,
              selectedIds: currentSelected.filter((id) => id !== categoryId),
            },
          },
          isDirty: true,
        };
      } else {
        // Check maximum 5
        if (currentSelected.length >= 5) {
          toast.error("You can select at most 5 top categories. Please deselect one first.");
          return state;
        }

        return {
          portalData: {
            ...state.portalData,
            topCategories: {
              ...state.portalData.topCategories,
              selectedIds: [...currentSelected, categoryId],
            },
          },
          isDirty: true,
        };
      }
    });
  },

  // 2. Best Selling Items Actions (Manually add/remove items from DB)
  addBestSellingItem: (item) => {
    set((state) => {
      const currentItems = state.portalData.bestSelling.selectedItems || [];
      if (currentItems.some((i) => i.id === item.id)) {
        toast.info("Item is already in the best sellers list");
        return state;
      }

      const itemToAdd = {
        id: item.id || item._id,
        name: item.name,
        category: item.categoryName || item.category || "Menu Item",
        price: item.price || 0,
        isVeg: typeof item.isVeg === "boolean" ? item.isVeg : true,
        image: item.image || item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
      };

      toast.success(`"${item.name}" added to Best Selling Items`);
      return {
        portalData: {
          ...state.portalData,
          bestSelling: {
            ...state.portalData.bestSelling,
            selectedItems: [...currentItems, itemToAdd],
          },
        },
        isDirty: true,
      };
    });
  },

  removeBestSellingItem: (itemId) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        bestSelling: {
          ...state.portalData.bestSelling,
          selectedItems: (state.portalData.bestSelling.selectedItems || []).filter(
            (i) => i.id !== itemId
          ),
        },
      },
      isDirty: true,
    }));
    toast.info("Item removed from Best Selling list.");
  },

  // 3. Offers Management Actions (Enable/disable and update content only)
  toggleOffersSection: (enabled) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        offers: {
          ...state.portalData.offers,
          enabled: typeof enabled === "boolean" ? enabled : !state.portalData.offers.enabled,
        },
      },
      isDirty: true,
    }));
  },

  updateOffersContent: (partial) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        offers: {
          ...state.portalData.offers,
          ...partial,
        },
      },
      isDirty: true,
    }));
  },

  // 4. Request Waiter Option Handler (Add options, update text, update time only)
  addWaiterOption: (label) => {
    if (!label || !label.trim()) return;
    const newOption = {
      id: `opt-${Date.now()}`,
      label: label.trim(),
    };
    set((state) => ({
      portalData: {
        ...state.portalData,
        waiterRequest: {
          ...state.portalData.waiterRequest,
          options: [...(state.portalData.waiterRequest.options || []), newOption],
        },
      },
      isDirty: true,
    }));
    toast.success(`Added option "${label.trim()}"`);
  },

  removeWaiterOption: (optionId) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        waiterRequest: {
          ...state.portalData.waiterRequest,
          options: (state.portalData.waiterRequest.options || []).filter(
            (o) => o.id !== optionId
          ),
        },
      },
      isDirty: true,
    }));
    toast.info("Option removed.");
  },

  updateWaiterText: (instructionsText) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        waiterRequest: {
          ...state.portalData.waiterRequest,
          instructionsText,
        },
      },
      isDirty: true,
    }));
  },

  updateWaiterTime: (cooldownMinutes) => {
    const mins = Math.max(1, Number(cooldownMinutes) || 1);
    set((state) => ({
      portalData: {
        ...state.portalData,
        waiterRequest: {
          ...state.portalData.waiterRequest,
          cooldownMinutes: mins,
        },
      },
      isDirty: true,
    }));
  },

  toggleWaiterMaster: (enabled) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        waiterRequest: {
          ...state.portalData.waiterRequest,
          enabled: typeof enabled === "boolean" ? enabled : !state.portalData.waiterRequest.enabled,
        },
      },
      isDirty: true,
    }));
  },

  // 5. Social Media Updates
  updateSocialField: (channel, field, value) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        socialMedia: {
          ...state.portalData.socialMedia,
          [channel]: {
            ...state.portalData.socialMedia[channel],
            [field]: value,
          },
        },
      },
      isDirty: true,
    }));
  },

  toggleSocialChannel: (channel) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        socialMedia: {
          ...state.portalData.socialMedia,
          [channel]: {
            ...state.portalData.socialMedia[channel],
            enabled: !state.portalData.socialMedia[channel].enabled,
          },
        },
      },
      isDirty: true,
    }));
  },

  updateWifiSettings: (partial) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        socialMedia: {
          ...state.portalData.socialMedia,
          wifiSharing: {
            ...state.portalData.socialMedia.wifiSharing,
            ...partial,
          },
        },
      },
      isDirty: true,
    }));
  },

  // Persistence & Reset
  saveChanges: async () => {
    set({ saving: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().portalData));
      set({ isDirty: false, saving: false });
      toast.success("Portal settings saved successfully!");
      return true;
    } catch (e) {
      set({ saving: false });
      toast.error("Failed to save portal settings.");
      return false;
    }
  },

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      portalData: DEFAULT_PORTAL_DATA,
      isDirty: false,
    });
    toast.info("Portal settings reset to defaults.");
  },
}));
