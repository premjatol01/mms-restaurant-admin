import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends the HttpOnly JWT cookie automatically
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from localStorage as a fallback.
// The backend prefers the cookie; the Authorization header is a fallback for
// environments where cookies are blocked (e.g. cross-origin dev with Vite proxy).
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("restaurant_admin_token");
      // Redirect to marketing website login page
      const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
      window.location.href = `${marketingWebUrl}/login`;
    }
    return Promise.reject(error);
  }
);
