import { apiClient } from "./client";

export const websiteApi = {
  // Subdomain
  checkSubdomain: (slug) =>
    apiClient.get("/restaurant/subdomain/check", { params: { slug } }),

  saveSubdomain: (subdomain) =>
    apiClient.put("/restaurant/profile", { website: { subdomain } }),

  // Website Config & Status
  getConfig: () => apiClient.get("/restaurant/website/config"),

  updateConfig: (data) => apiClient.put("/restaurant/website/config", data),

  publishWebsite: () => apiClient.post("/restaurant/website/publish"),

  unpublishWebsite: () => apiClient.post("/restaurant/website/unpublish"),

  // Sections (Fixed natural ordering - reordering removed)
  getSections: () => apiClient.get("/restaurant/website/sections"),

  updateSection: (sectionId, data) =>
    apiClient.put(`/restaurant/website/sections/${sectionId}`, data),

  toggleSection: (sectionId, enabled) =>
    apiClient.patch(`/restaurant/website/sections/${sectionId}/toggle`, { enabled }),

  // File Upload
  uploadImage: (formData) =>
    apiClient.post("/restaurant/website/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Customer Inquiries
  getInquiries: (params) =>
    apiClient.get("/restaurant/website/inquiries", { params }),

  getInquiryStats: () =>
    apiClient.get("/restaurant/website/inquiries/stats"),

  updateInquiryStatus: (id, status) =>
    apiClient.patch(`/restaurant/website/inquiries/${id}/status`, { status }),
};
