import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends HttpOnly JWT cookies automatically
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from localStorage as a fallback.
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("restaurant_admin_token") ||
    localStorage.getItem("restaurant_token");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — handle token refresh, 401 token expiry, & 403 inactive.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = (reason = "") => {
  localStorage.removeItem("restaurant_admin_token");
  localStorage.removeItem("restaurant_admin_refresh_token");
  localStorage.removeItem("restaurant_admin_remember");
  localStorage.removeItem("restaurant_token");
  localStorage.removeItem("restaurant_user");

  const marketingWebUrl =
    import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
  const target = reason
    ? `${marketingWebUrl}/login?error=${encodeURIComponent(reason)}`
    : `${marketingWebUrl}/login`;

  window.location.replace(target);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. Handle Account Inactive (403 Forbidden)
    if (status === 403) {
      const msg = error.response?.data?.message || "";
      const reason = msg.toLowerCase().includes("inactive") ? "inactive" : "forbidden";
      clearAuthAndRedirect(reason);
      return Promise.reject(error);
    }

    // 2. Handle Token Expiry / Unauthorized (401 Unauthorized)
    if (status === 401 && originalRequest) {
      // If the failing request was already refresh-token or login: terminate immediately
      if (
        originalRequest.url?.includes("/auth/refresh-token") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        clearAuthAndRedirect("session_expired");
        return Promise.reject(error);
      }

      const remember = localStorage.getItem("restaurant_admin_remember") === "true";
      const refreshToken = localStorage.getItem("restaurant_admin_refresh_token");

      // Case A: User did NOT check "Remember Me", or has no refresh token.
      // 12-hour session has expired -> prompt login immediately.
      if (!remember || !refreshToken) {
        clearAuthAndRedirect("token_expired");
        return Promise.reject(error);
      }

      // Case B: Avoid looping if retry already attempted
      if (originalRequest._retry) {
        clearAuthAndRedirect("session_expired");
        return Promise.reject(error);
      }

      // If another request is currently refreshing the token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data?.data?.token;
        if (!newAccessToken) {
          throw new Error("No token returned from refresh endpoint");
        }

        // Store new access token
        localStorage.setItem("restaurant_admin_token", newAccessToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        const reason =
          refreshErr.response?.status === 403 ? "inactive" : "session_expired";
        clearAuthAndRedirect(reason);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
