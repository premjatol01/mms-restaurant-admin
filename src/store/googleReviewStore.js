import { create } from "zustand";

const mockGoogleReview = {
  enabled: true,
  status: "configured",
  reviewUrl: "https://g.page/r/example-restaurant/review",
  updatedAt: "2026-01-10T12:00:00Z"
};

export const useGoogleReviewStore = create((set, get) => ({
  config: { ...mockGoogleReview },
  featureLocked: false,
  
  setReviewUrl: (url) => set((state) => ({
    config: { 
      ...state.config, 
      reviewUrl: url,
      status: url ? "configured" : "not_configured",
      updatedAt: url ? new Date().toISOString() : null
    }
  })),
  
  setEnabled: (enabled) => set((state) => ({
    config: { 
      ...state.config, 
      enabled,
      status: !enabled ? "unavailable" : (state.config.reviewUrl ? "configured" : "not_configured")
    }
  })),
  
  clearConfig: () => set((state) => ({
    config: {
      ...state.config,
      reviewUrl: "",
      status: "not_configured",
      updatedAt: null
    }
  }))
}));