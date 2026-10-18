import { mockGalleryImages } from "./gallery";
import {
  DEFAULT_MENU_COLORS,
  DEFAULT_PURPOSE_OPTIONS
} from "../utils/constants";

// Default (dummy) website sections shown in the builder.
export const defaultSections = [
  {
    id: "hero",
    type: "hero",
    title: "Hero Section",
    description: "Main introduction with headline and image",
    enabled: true,
    order: 1,
    content: {
      heading: "Welcome to Tasty Bites",
      description: "Experience delicious food made with fresh ingredients. Join us for an unforgettable culinary journey.",
      buttonText: "View Menu",
      buttonAction: "menu",
      imageUrl: ""
    }
  },
  {
    id: "about",
    type: "about",
    title: "About Restaurant",
    description: "Restaurant introduction with photo",
    enabled: true,
    order: 2,
    content: {
      title: "About Tasty Bites",
      description: "Tasty Bites is a family restaurant dedicated to serving authentic Indian cuisine with a modern twist. Our chefs use only the freshest ingredients to create memorable dining experiences.",
      imageUrl: ""
    }
  },
  {
    id: "menu",
    type: "menu",
    title: "Popular Menu",
    description: "Popular dishes from your Menu, with a full menu popup",
    enabled: true,
    order: 3,
    content: {
      title: "Popular Menu",
      description: "Our most loved dishes, picked by our guests",
      showViewAll: true,
      viewAllLabel: "View All Menu",
      colors: { ...DEFAULT_MENU_COLORS }
    }
  },
  {
    id: "offers",
    type: "offers",
    title: "Special Offers",
    description: "Current restaurant offers",
    enabled: true,
    order: 4,
    content: {
      title: "Special Offers",
      description: "Check out our latest deals and promotions"
    }
  },
  {
    id: "gallery",
    type: "gallery",
    title: "Gallery",
    description: "Photos of your food and restaurant",
    enabled: true,
    order: 5,
    content: {
      title: "Gallery",
      description: "A glimpse of our food and ambience",
      images: mockGalleryImages
    }
  },
  {
    id: "map",
    type: "map",
    title: "Map & Location",
    description: "Google Maps and restaurant address",
    enabled: true,
    order: 6,
    content: {
      title: "Find Us",
      description: "Visit us for lunch or dinner. We would love to see you.",
      mapSource: "location",
      embedUrl: "",
      zoom: 15,
      showDirections: true,
      location: {
        addressLine: "123 Food Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
        latitude: "",
        longitude: ""
      }
    }
  },
  {
    id: "inquiry",
    type: "inquiry",
    title: "Contact / Inquiry",
    description: "Customer inquiry form",
    enabled: true,
    order: 7,
    content: {
      title: "Contact Us",
      description: "Have a question? Send us an inquiry.",
      fields: {
        name: { enabled: true, required: true },
        mobile: { enabled: true, required: true },
        email: { enabled: true, required: false },
        purpose: { enabled: true, required: false },
        message: { enabled: true, required: true }
      },
      purposeOptions: [...DEFAULT_PURPOSE_OPTIONS]
    }
  },
  {
    id: "footer",
    type: "footer",
    title: "Footer",
    description: "Footer info, section links, and social media",
    enabled: true,
    order: 8,
    content: {
      title: "Tasty Bites",
      subtitle: "Authentic Indian Flavors",
      description: "Serving delicious food crafted with passion and fresh ingredients.",
      socialLinks: {
        instagram: "",
        facebook: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        whatsapp: ""
      },
      sectionLinks: [
        { id: "hero", label: "Home", href: "#hero", enabled: true },
        { id: "about", label: "About Us", href: "#about", enabled: true },
        { id: "menu", label: "Menu", href: "#menu", enabled: true },
        { id: "offers", label: "Offers", href: "#offers", enabled: true },
        { id: "gallery", label: "Gallery", href: "#gallery", enabled: true },
        { id: "map", label: "Location", href: "#map", enabled: true },
        { id: "inquiry", label: "Contact", href: "#inquiry", enabled: true }
      ]
    }
  }
];
