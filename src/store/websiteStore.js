import { create } from "zustand";

const mockInquiries = [
  {
    id: "INQ-001",
    name: "Rahul Sharma",
    mobile: "+91 98765 43210",
    email: "rahul@example.com",
    message: "Hi, I would like to know whether you accept group reservations for about 20 people.",
    submittedAt: "2026-01-15T14:30:00",
    status: "new"
  },
  {
    id: "INQ-002",
    name: "Priya Patel",
    mobile: "+91 98765 54321",
    email: "priya@example.com",
    message: "What are your opening hours on Sundays?",
    submittedAt: "2026-01-14T10:15:00",
    status: "in_progress"
  },
  {
    id: "INQ-003",
    name: "Amit Kumar",
    mobile: "+91 98765 65432",
    email: "amit@example.com",
    message: "Do you provide catering services for corporate events?",
    submittedAt: "2026-01-12T09:45:00",
    status: "resolved"
  },
  {
    id: "INQ-004",
    name: "Sneha Singh",
    mobile: "+91 98765 76543",
    email: "sneha@example.com",
    message: "Can I pre-order a customized cake for my birthday?",
    submittedAt: "2026-01-11T16:20:00",
    status: "resolved"
  },
  {
    id: "INQ-005",
    name: "Vikram Reddy",
    mobile: "+91 98765 87654",
    email: "vikram@example.com",
    message: "Is there parking available near the restaurant?",
    submittedAt: "2026-01-10T11:00:00",
    status: "new"
  }
];

const defaultSections = [
  {
    id: "hero",
    type: "hero",
    title: "Hero Section",
    description: "Main introduction section",
    enabled: true,
    order: 1,
    content: {
      heading: "Welcome to Tasty Bites",
      description: "Experience delicious food made with fresh ingredients. Join us for an unforgettable culinary journey.",
      buttonText: "View Menu",
      buttonAction: "menu"
    }
  },
  {
    id: "about",
    type: "about",
    title: "About Restaurant",
    description: "Restaurant introduction",
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
    title: "Menu",
    description: "Display restaurant menu",
    enabled: true,
    order: 3,
    content: {
      title: "Our Menu",
      description: "Explore our delicious menu featuring a variety of dishes"
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
    id: "inquiry",
    type: "inquiry",
    title: "Contact / Inquiry",
    description: "Customer inquiry form",
    enabled: true,
    order: 5,
    content: {
      title: "Contact Us",
      description: "Have a question? Send us an inquiry.",
      fields: {
        name: true,
        mobile: true,
        email: true,
        message: true
      }
    }
  }
];

export const useWebsiteStore = create((set, get) => ({
  // Website config
  websiteStatus: "draft",
  restaurantName: "Tasty Bites",
  restaurantSlug: "tasty-bites",
  description: "Fresh and delicious food made with quality ingredients.",
  phone: "+91 98765 43210",
  email: "info@tastybites.com",
  address: "123 Food Street, Mumbai, Maharashtra",
  sections: [...defaultSections],
  loading: false,
  
  // Inquiries
  inquiries: [...mockInquiries],
  inquiriesLoading: false,

  // Actions
  setWebsiteStatus: (status) => set({ websiteStatus: status }),
  
  updateBasicInfo: (data) => set((state) => ({
    restaurantName: data.restaurantName ?? state.restaurantName,
    description: data.description ?? state.description,
    phone: data.phone ?? state.phone,
    email: data.email ?? state.email,
    address: data.address ?? state.address
  })),

  updateSection: (sectionId, content) => set((state) => ({
    sections: state.sections.map((s) => 
      s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s
    )
  })),

  toggleSection: (sectionId) => set((state) => ({
    sections: state.sections.map((s) => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    )
  })),

  moveSection: (sectionId, direction) => set((state) => {
    const sections = [...state.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return state;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return state;
    
    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections.forEach((s, i) => s.order = i + 1);
    
    return { sections: newSections };
  }),

  publishWebsite: () => set({ websiteStatus: "published" }),
  unpublishWebsite: () => set({ websiteStatus: "draft" }),

  // Inquiry actions
  updateInquiryStatus: (id, status) => set((state) => ({
    inquiries: state.inquiries.map((i) => i.id === id ? { ...i, status } : i)
  })),

  getInquiryStats: () => {
    const { inquiries } = get();
    return {
      total: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      inProgress: inquiries.filter((i) => i.status === "in_progress").length,
      resolved: inquiries.filter((i) => i.status === "resolved").length
    };
  },

  getInquiryById: (id) => get().inquiries.find((i) => i.id === id)
}));