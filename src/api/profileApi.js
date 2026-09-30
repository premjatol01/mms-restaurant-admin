import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends the HttpOnly JWT cookie automatically
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from localStorage as a fallback.
// The backend prefers the cookie; the Authorization header is a fallback for
// environments where cookies are blocked (e.g. cross-origin dev with Vite proxy).
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("restaurant_admin_token");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — handle global 401 (token expired / logged out).
// Redirect to login so the restaurant admin is not left on a broken page.
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("restaurant_admin_token");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const profileApi = {
  // Profile
  get: () => api.get("/restaurant/profile"),
  update: (data) => api.put("/restaurant/profile", data),

  // Logo
  uploadLogo: (formData) =>
    api.post("/restaurant/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeLogo: () => api.delete("/restaurant/profile/logo"),

  // Cover image
  uploadCover: (formData) =>
    api.post("/restaurant/profile/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeCover: () => api.delete("/restaurant/profile/cover"),

  // Master Menu (Super Admin data)
  getMasterCategories: () => api.get("/master-menu/categories"),
  getMasterItems: () => api.get("/master-menu/items"),

  // Save Menu Selection
  saveMenuSelection: (selection) => api.post("/restaurant/profile/menu-selection", selection),

  // Templates
  getTemplates: () => api.get("/qr-templates"),

  // Tables
  getTables: () => api.get("/restaurant/tables"),
  createTables: (data) => api.post("/restaurant/tables", data),
};
