import { create } from "zustand";
import { toast } from "sonner";
import { profileApi } from "../api/profile.api";
import { menuApi } from "../api/menu.api";

// Default static fallback data for Menu Order Portal Handler
const DEFAULT_PORTAL_DATA = {
  general: {
    portalName: "The Spice Garden - Dine-In Menu",
    portalStatus: "active",
    subdomain: "spicegarden",
  },

  // 1. Top 5 Categories (all available categories can be selected, up to 5)
  topCategories: {
    maxSelection: 5,
    selectedIds: [],
    fallbackList: [
      { id: "cat-1", name: "Starters & Appetizers", itemCount: 16, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-2", name: "Main Course Delicacies", itemCount: 24, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-3", name: "Hyderabadi Biryani", itemCount: 10, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-4", name: "Artisan Pizzas", itemCount: 14, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-5", name: "Desserts & Shakes", itemCount: 12, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80" },
      { id: "cat-6", name: "Beverages & Mocktails", itemCount: 18, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80" },
    ],
  },

  // 2. Best Selling Items (manually selected items from available DB items)
  bestSelling: {
    selectedItems: [],
    fallbackCatalog: [
      { id: "item-101", name: "Butter Chicken Masala (Special)", category: "Main Course Delicacies", price: 380, isVeg: false, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80" },
      { id: "item-102", name: "Paneer Butter Tikka Masala", category: "Main Course Delicacies", price: 320, isVeg: true, image: "https://images.unsplash.com/photo-1567184109191-37764e7fadd9?w=400&auto=format&fit=crop&q=80" },
      { id: "item-103", name: "Hyderabadi Dum Chicken Biryani", category: "Hyderabadi Biryani", price: 340, isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80" },
      { id: "item-104", name: "Crispy Peri Peri Loaded Fries", category: "Starters & Appetizers", price: 180, isVeg: true, image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80" },
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

  // 5. Social Media & Wi-Fi Handler
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
    followIncentive: {
      enabled: true,
      title: "Follow & Win 10% Off Your Meal!",
      description: "Follow our official Instagram handle & show your server to claim discount.",
    },
  },

  // 6. Ordering & Operations
  operations: {
    acceptOrders: true,
    isActive: true,
    enableCart: true,
    enableFloatingCart: true,
    enableGames: true,
  },

  // 7. Table Games Handler (Foodie Trivia, Dare & Spin, Table Tic-Tac-Toe)
  tableGames: {
    enabled: true,
    trivia: {
      enabled: true,
      title: "Foodie Trivia Showdown",
      tagline: "Test culinary trivia with table mates",
      status: "Active",
      timerSeconds: 15,
      questions: [
        {
          id: "q-1",
          question: "Which country is the historical birthplace of French Fries?",
          options: ["France", "Belgium", "USA", "Germany"],
          correctIndex: 1,
          explanation: "Historians believe fries originated in Belgium, where villagers fried small fish, and when the river froze, fried potatoes instead!"
        },
        {
          id: "q-2",
          question: "Which spice is the most expensive in the world by weight?",
          options: ["Vanilla", "Saffron", "Cardamom", "Star Anise"],
          correctIndex: 1,
          explanation: "Saffron is harvested by hand from the stigma of Crocus sativus flowers — it takes 75,000 flowers to make one pound!"
        },
        {
          id: "q-3",
          question: "What ingredient causes bread dough to rise and become airy?",
          options: ["Baking Soda", "Yeast", "Cornstarch", "Sugar"],
          correctIndex: 1,
          explanation: "Yeast consumes sugars in dough and releases carbon dioxide gas bubbles, which expands and rises the dough."
        },
        {
          id: "q-4",
          question: "What gives traditional Italian pesto sauce its vibrant green color?",
          options: ["Spinach", "Fresh Basil", "Oregano", "Green Bell Pepper"],
          correctIndex: 1,
          explanation: "Classic Genovese pesto is made with crushed fresh sweet basil leaves, pine nuts, garlic, parmesan, and olive oil."
        },
        {
          id: "q-5",
          question: "Which fruit has all of its seeds on the outside of its skin?",
          options: ["Strawberry", "Kiwi", "Blueberry", "Raspberry"],
          correctIndex: 0,
          explanation: "Strawberries are the only fruit that bear their seeds on the outside — an average strawberry has around 200 seeds!"
        },
        {
          id: "q-6",
          question: "Which country is the world's largest producer of Olive Oil?",
          options: ["Italy", "Greece", "Spain", "Portugal"],
          correctIndex: 2,
          explanation: "Spain produces roughly 45% of the total olive oil supply in the world, with Andalusia leading the harvest."
        },
        {
          id: "q-7",
          question: "Real Japanese Wasabi is traditionally prepared from which plant part?",
          options: ["Mustard leaves", "Wasabia japonica rhizome root", "Green radishes", "Ginger stalk"],
          correctIndex: 1,
          explanation: "Authentic wasabi is grated from the underground stem (rhizome) of Wasabia japonica, known for its rapid, sinus-clearing aroma."
        },
        {
          id: "q-8",
          question: "What gives Earl Grey tea its distinct citrus aroma and flavor?",
          options: ["Bergamot orange oil", "Lemon peel", "Grapefruit zest", "Yuzu extract"],
          correctIndex: 0,
          explanation: "Earl Grey is black tea infused with cold-pressed oil from the rind of the fragrant bergamot citrus fruit."
        }
      ]
    },
    dareSpin: {
      enabled: true,
      title: "Table Dare & Spin",
      tagline: "Spin the wheel for fun dinner challenges",
      status: "Active",
      dares: [
        { id: "d-1", text: "Food Critic: Review your last bite or sip like a 3-star Michelin chef for 30 seconds.", color: "#EF4444" },
        { id: "d-2", text: "Chef's Compliment: Give a genuine, creative compliment to the person sitting across from you.", color: "#F59E0B" },
        { id: "d-3", text: "Table Selfie: Take a silly group selfie with everyone at the table right now!", color: "#10B981" },
        { id: "d-4", text: "Mystery Order: The player to your left gets to pick your next dessert or side dish.", color: "#3B82F6" },
        { id: "d-5", text: "Food Confession: Share the weirdest food combination you secretly enjoy.", color: "#8B5CF6" },
        { id: "d-6", text: "Accent Time: Say your favorite food order in a dramatic French or Italian accent.", color: "#EC4899" },
        { id: "d-7", text: "No Hands: Eat your next French fry, chip, or nacho using only your mouth — no hands!", color: "#F97316" },
        { id: "d-8", text: "Quick Trivia: The person on your right asks you any question — get it right or tell a funny secret.", color: "#14B8A6" },
      ]
    },
    ticTacToe: {
      enabled: true,
      title: "Table Tic-Tac-Toe",
      tagline: "Quick matches while waiting for your order",
      status: "Active",
      mode: "pvp", // 'pvp' (Pass & Play) or 'bot' (Play vs Chef Bot)
    }
  },
};

const STORAGE_KEY = "tablly_portal_handler_settings_v3";

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
        socialMedia: {
          ...DEFAULT_PORTAL_DATA.socialMedia,
          ...(parsed.socialMedia || {}),
        },
        operations: {
          ...DEFAULT_PORTAL_DATA.operations,
          ...(parsed.operations || {}),
        },
        tableGames: {
          ...DEFAULT_PORTAL_DATA.tableGames,
          ...(parsed.tableGames || {}),
          trivia: {
            ...DEFAULT_PORTAL_DATA.tableGames.trivia,
            ...(parsed.tableGames?.trivia || {}),
          },
          dareSpin: {
            ...DEFAULT_PORTAL_DATA.tableGames.dareSpin,
            ...(parsed.tableGames?.dareSpin || {}),
          },
          ticTacToe: {
            ...DEFAULT_PORTAL_DATA.tableGames.ticTacToe,
            ...(parsed.tableGames?.ticTacToe || {}),
          },
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
  loading: false,
  saving: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  // ─── Fetch live data from backend APIs ─────────────────────────────────────
  fetchPortalData: async () => {
    set({ loading: true });
    try {
      const [profileRes, catRes, itemsRes] = await Promise.allSettled([
        profileApi.get(),
        menuApi.getCategories(),
        menuApi.getItems(),
      ]);

      const profile = profileRes.status === "fulfilled" ? profileRes.value?.data?.data : null;
      const categories = catRes.status === "fulfilled" ? catRes.value?.data?.data || [] : [];
      const items = itemsRes.status === "fulfilled" ? itemsRes.value?.data?.data || [] : [];

      const current = get().portalData;

      // Extract top category IDs from live DB
      const dbTopCategoryIds = categories
        .filter((c) => c.isTopCategory)
        .map((c) => c._id || c.id);

      // Extract bestseller items from live DB
      const dbBestsellerItems = items
        .filter((i) => i.isBestseller || i.isPopular)
        .map((i) => ({
          id: i._id || i.id,
          name: i.name,
          category: i.categoryId?.name || i.categoryName || i.category || "Menu Item",
          price: i.price || 0,
          isVeg: typeof i.isVeg === "boolean" ? i.isVeg : true,
          image: i.image || i.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
        }));

      // Extract portal settings from profile
      const ps = profile?.portalSettings || {};

      // Parse Instagram handle from url if not provided
      const rawInstaUrl = profile?.socialLinks?.instagram || current.socialMedia.instagram.url || "";
      let instaHandle = ps.followCampaign?.instagramHandle || current.socialMedia.instagram.handle || "";
      if (!instaHandle && rawInstaUrl.includes("instagram.com/")) {
        const parts = rawInstaUrl.split("instagram.com/")[1]?.split(/[\/?#]/)[0];
        if (parts) instaHandle = `@${parts}`;
      }

      const mergedData = {
        ...current,
        general: {
          ...current.general,
          portalName: profile?.name ? `${profile.name} - Dine-In Menu` : current.general.portalName,
          portalStatus: profile?.status || current.general.portalStatus,
          subdomain: profile?.website?.subdomain || current.general.subdomain,
        },
        topCategories: {
          ...current.topCategories,
          selectedIds: dbTopCategoryIds.length > 0 ? dbTopCategoryIds : (current.topCategories.selectedIds || []),
        },
        bestSelling: {
          ...current.bestSelling,
          selectedItems: dbBestsellerItems.length > 0 ? dbBestsellerItems : (current.bestSelling.selectedItems || []),
        },
        offers: {
          ...current.offers,
          enabled: ps.offers?.enabled !== undefined ? ps.offers.enabled : current.offers.enabled,
          title: ps.offers?.title || current.offers.title,
          subtitle: ps.offers?.subtitle || current.offers.subtitle,
          bannerAnnouncement: ps.offers?.bannerAnnouncement !== undefined ? ps.offers.bannerAnnouncement : current.offers.bannerAnnouncement,
        },
        waiterRequest: {
          ...current.waiterRequest,
          enabled: ps.waiterRequest?.enabled !== undefined ? ps.waiterRequest.enabled : current.waiterRequest.enabled,
          cooldownMinutes: ps.waiterRequest?.cooldownMinutes || current.waiterRequest.cooldownMinutes,
          instructionsText: ps.waiterRequest?.instructionsText || current.waiterRequest.instructionsText,
          options: (Array.isArray(ps.waiterRequest?.options) && ps.waiterRequest.options.length > 0)
            ? ps.waiterRequest.options
            : current.waiterRequest.options,
        },
        socialMedia: {
          ...current.socialMedia,
          instagram: {
            ...current.socialMedia.instagram,
            url: profile?.socialLinks?.instagram || current.socialMedia.instagram.url,
            handle: instaHandle,
          },
          facebook: {
            ...current.socialMedia.facebook,
            url: profile?.socialLinks?.facebook || current.socialMedia.facebook.url,
          },
          whatsapp: {
            ...current.socialMedia.whatsapp,
            number: profile?.socialLinks?.whatsapp || profile?.contact?.whatsapp || current.socialMedia.whatsapp.number,
            displayNumber: profile?.socialLinks?.whatsapp || profile?.contact?.whatsapp || current.socialMedia.whatsapp.displayNumber,
          },
          googleReview: {
            ...current.socialMedia.googleReview,
            reviewUrl: profile?.googleReviewLink || current.socialMedia.googleReview.reviewUrl,
            placeName: profile?.name || current.socialMedia.googleReview.placeName,
          },
          wifiSharing: {
            ...current.socialMedia.wifiSharing,
            enabled: ps.wifiSharing?.enabled !== undefined ? ps.wifiSharing.enabled : current.socialMedia.wifiSharing.enabled,
            ssid: ps.wifiSharing?.ssid ?? current.socialMedia.wifiSharing.ssid,
            password: ps.wifiSharing?.password ?? current.socialMedia.wifiSharing.password,
            security: ps.wifiSharing?.security || current.socialMedia.wifiSharing.security,
          },
          followIncentive: {
            ...current.socialMedia.followIncentive,
            enabled: ps.followCampaign?.enabled !== undefined ? ps.followCampaign.enabled : current.socialMedia.followIncentive.enabled,
            title: ps.followCampaign?.bannerTitle || current.socialMedia.followIncentive.title,
            description: ps.followCampaign?.bannerSubtitle || current.socialMedia.followIncentive.description,
          },
        },
        operations: {
          ...current.operations,
          acceptOrders: profile?.settings?.acceptOrders !== undefined ? profile.settings.acceptOrders : current.operations.acceptOrders,
          isActive: profile?.settings?.isActive !== undefined ? profile.settings.isActive : current.operations.isActive,
          enableFloatingCart: ps.operations?.enableFloatingCart !== undefined ? ps.operations.enableFloatingCart : current.operations.enableFloatingCart,
          enableGames: ps.operations?.enableGames !== undefined ? ps.operations.enableGames : current.operations.enableGames,
          enableCart: ps.operations?.enableCart !== undefined ? ps.operations.enableCart : current.operations.enableCart,
        },
        tableGames: {
          ...current.tableGames,
          enabled: ps.tableGames?.enabled !== undefined ? ps.tableGames.enabled : current.tableGames.enabled,
          trivia: {
            ...current.tableGames.trivia,
            ...(ps.tableGames?.trivia || {}),
          },
          dareSpin: {
            ...current.tableGames.dareSpin,
            ...(ps.tableGames?.dareSpin || {}),
          },
          ticTacToe: {
            ...current.tableGames.ticTacToe,
            ...(ps.tableGames?.ticTacToe || {}),
          },
        },
      };

      set({ portalData: mergedData, isDirty: false, loading: false });
    } catch (err) {
      console.error("Failed to fetch portal data:", err);
      set({ loading: false });
    }
  },

  // ─── Publish changes directly to backend APIs ──────────────────────────────
  publishChanges: async () => {
    set({ saving: true });
    try {
      const state = get().portalData;

      // 1. Sync Top Categories (max 5)
      const topCategoryIds = (state.topCategories.selectedIds || []).slice(0, 5);
      await menuApi.setTopCategories(topCategoryIds);

      // 2. Sync Bestseller Items
      const bestsellerItemIds = (state.bestSelling.selectedItems || []).map((i) => i.id || i._id);
      await menuApi.setBestsellerItems(bestsellerItemIds);

      // 3. Sync Profile: portalSettings, socialLinks, googleReviewLink, settings
      const profilePayload = {
        settings: {
          acceptOrders: Boolean(state.operations.acceptOrders),
          isActive: Boolean(state.operations.isActive),
        },
        socialLinks: {
          instagram: state.socialMedia.instagram.url || "",
          facebook: state.socialMedia.facebook.url || "",
          whatsapp: state.socialMedia.whatsapp.number || "",
        },
        googleReviewLink: state.socialMedia.googleReview.reviewUrl || "",
        portalSettings: {
          waiterRequest: {
            enabled: Boolean(state.waiterRequest.enabled),
            cooldownMinutes: Math.max(1, Number(state.waiterRequest.cooldownMinutes) || 1),
            instructionsText: state.waiterRequest.instructionsText || "",
            options: (state.waiterRequest.options || []).map((opt) => ({
              id: opt.id,
              label: opt.label,
            })),
          },
          offers: {
            enabled: Boolean(state.offers.enabled),
            title: state.offers.title || "",
            subtitle: state.offers.subtitle || "",
            bannerAnnouncement: state.offers.bannerAnnouncement || "",
          },
          wifiSharing: {
            enabled: Boolean(state.socialMedia.wifiSharing.enabled),
            ssid: state.socialMedia.wifiSharing.ssid || "",
            password: state.socialMedia.wifiSharing.password || "",
            security: state.socialMedia.wifiSharing.security || "WPA2",
          },
          followCampaign: {
            enabled: Boolean(state.socialMedia.followIncentive.enabled),
            bannerTitle: state.socialMedia.followIncentive.title || "Follow & Win 10% Off Your Meal!",
            bannerSubtitle: state.socialMedia.followIncentive.description || "Follow our official Instagram handle & show your server to claim discount.",
            instagramHandle: state.socialMedia.instagram.handle || "",
            instagramUrl: state.socialMedia.instagram.url || "",
          },
          operations: {
            acceptOrders: Boolean(state.operations.acceptOrders),
            enableFloatingCart: Boolean(state.operations.enableFloatingCart),
            enableGames: Boolean(state.operations.enableGames),
            enableCart: Boolean(state.operations.enableCart),
          },
          tableGames: {
            enabled: Boolean(state.tableGames?.enabled),
            trivia: {
              enabled: Boolean(state.tableGames?.trivia?.enabled),
              title: state.tableGames?.trivia?.title || "Foodie Trivia Showdown",
              tagline: state.tableGames?.trivia?.tagline || "Test culinary trivia with table mates",
              status: state.tableGames?.trivia?.status || "Active",
              timerSeconds: Math.max(5, Number(state.tableGames?.trivia?.timerSeconds) || 15),
              questions: state.tableGames?.trivia?.questions || [],
            },
            dareSpin: {
              enabled: Boolean(state.tableGames?.dareSpin?.enabled),
              title: state.tableGames?.dareSpin?.title || "Table Dare & Spin",
              tagline: state.tableGames?.dareSpin?.tagline || "Spin the wheel for fun dinner challenges",
              status: state.tableGames?.dareSpin?.status || "Active",
              dares: state.tableGames?.dareSpin?.dares || [],
            },
            ticTacToe: {
              enabled: Boolean(state.tableGames?.ticTacToe?.enabled),
              title: state.tableGames?.ticTacToe?.title || "Table Tic-Tac-Toe",
              tagline: state.tableGames?.ticTacToe?.tagline || "Quick matches while waiting for your order",
              status: state.tableGames?.ticTacToe?.status || "Active",
              mode: state.tableGames?.ticTacToe?.mode || "pvp",
            },
          },
        },
      };

      await profileApi.update(profilePayload);

      // Cache locally for instant reload
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (storageErr) {
        // ignore
      }

      set({ isDirty: false, saving: false });
      toast.success("All portal changes published successfully! Live orders and table portal updated.");
      return true;
    } catch (err) {
      console.error("Error publishing portal changes:", err);
      set({ saving: false });
      toast.error(err?.response?.data?.message || "Failed to publish portal changes. Please try again.");
      return false;
    }
  },

  // Backward compatibility alias for saveChanges
  saveChanges: async () => {
    return get().publishChanges();
  },

  // 1. Top 5 Categories Actions
  toggleCategorySelection: (categoryId) => {
    set((state) => {
      const currentSelected = state.portalData.topCategories.selectedIds || [];
      const isAlreadySelected = currentSelected.includes(categoryId);

      if (isAlreadySelected) {
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

  // 2. Best Selling Items Actions
  addBestSellingItem: (item) => {
    set((state) => {
      const currentItems = state.portalData.bestSelling.selectedItems || [];
      const itemId = item.id || item._id;
      if (currentItems.some((i) => (i.id || i._id) === itemId)) {
        toast.info("Item is already in the best sellers list");
        return state;
      }

      const itemToAdd = {
        id: itemId,
        name: item.name,
        category: item.categoryId?.name || item.categoryName || item.category || "Menu Item",
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
            (i) => (i.id || i._id) !== itemId
          ),
        },
      },
      isDirty: true,
    }));
    toast.info("Item removed from Best Selling list.");
  },

  // 3. Offers Management Actions
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

  // 4. Request Waiter Option Handler
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

  updateFollowIncentive: (partial) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        socialMedia: {
          ...state.portalData.socialMedia,
          followIncentive: {
            ...state.portalData.socialMedia.followIncentive,
            ...partial,
          },
        },
      },
      isDirty: true,
    }));
  },

  // 6. Operations Updates
  updateOperations: (partial) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        operations: {
          ...state.portalData.operations,
          ...partial,
        },
      },
      isDirty: true,
    }));
  },

  // 7. Table Games Handler Updates
  toggleTableGamesMaster: () => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: {
          ...state.portalData.tableGames,
          enabled: !state.portalData.tableGames.enabled,
        },
      },
      isDirty: true,
    }));
  },

  toggleGameEnabled: (gameKey) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: {
          ...state.portalData.tableGames,
          [gameKey]: {
            ...state.portalData.tableGames[gameKey],
            enabled: !state.portalData.tableGames[gameKey]?.enabled,
          },
        },
      },
      isDirty: true,
    }));
  },

  updateGameField: (gameKey, field, value) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: {
          ...state.portalData.tableGames,
          [gameKey]: {
            ...state.portalData.tableGames[gameKey],
            [field]: value,
          },
        },
      },
      isDirty: true,
    }));
  },

  addTriviaQuestion: (questionObj) => {
    set((state) => {
      const existing = state.portalData.tableGames?.trivia?.questions || [];
      const newQuestion = {
        id: `q-${Date.now()}`,
        ...questionObj,
      };
      return {
        portalData: {
          ...state.portalData,
          tableGames: {
            ...state.portalData.tableGames,
            trivia: {
              ...state.portalData.tableGames.trivia,
              questions: [...existing, newQuestion],
            },
          },
        },
        isDirty: true,
      };
    });
    toast.success("Trivia question added!");
  },

  deleteTriviaQuestion: (questionId) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: {
          ...state.portalData.tableGames,
          trivia: {
            ...state.portalData.tableGames.trivia,
            questions: (state.portalData.tableGames.trivia.questions || []).filter((q) => q.id !== questionId),
          },
        },
      },
      isDirty: true,
    }));
    toast.info("Trivia question removed.");
  },

  addDare: (text, color = "#EF4444") => {
    set((state) => {
      const existing = state.portalData.tableGames?.dareSpin?.dares || [];
      const newDare = {
        id: `d-${Date.now()}`,
        text,
        color,
      };
      return {
        portalData: {
          ...state.portalData,
          tableGames: {
            ...state.portalData.tableGames,
            dareSpin: {
              ...state.portalData.tableGames.dareSpin,
              dares: [...existing, newDare],
            },
          },
        },
        isDirty: true,
      };
    });
    toast.success("New dinner dare added to wheel!");
  },

  deleteDare: (dareId) => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: {
          ...state.portalData.tableGames,
          dareSpin: {
            ...state.portalData.tableGames.dareSpin,
            dares: (state.portalData.tableGames.dareSpin.dares || []).filter((d) => d.id !== dareId),
          },
        },
      },
      isDirty: true,
    }));
    toast.info("Dare removed from wheel.");
  },

  resetDefaultGames: () => {
    set((state) => ({
      portalData: {
        ...state.portalData,
        tableGames: JSON.parse(JSON.stringify(DEFAULT_PORTAL_DATA.tableGames)),
      },
      isDirty: true,
    }));
    toast.success("Table games settings restored to factory defaults!");
  },
}));
