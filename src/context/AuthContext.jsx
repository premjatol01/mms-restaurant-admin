import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export const AuthContext = createContext();

const decodeToken = (tokenStr) => {
  if (!tokenStr || typeof tokenStr !== "string") return null;
  try {
    const parts = tokenStr.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // 1. Check if token & remember flags are passed in URL query (from login redirect)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      const urlRefreshToken = params.get("refreshToken");
      const urlRemember = params.get("remember");

      if (urlToken) {
        localStorage.setItem("restaurant_admin_token", urlToken);

        if (urlRemember === "1") {
          localStorage.setItem("restaurant_admin_remember", "true");
          if (urlRefreshToken) {
            localStorage.setItem("restaurant_admin_refresh_token", urlRefreshToken);
          }
        } else if (urlRemember === "0") {
          localStorage.setItem("restaurant_admin_remember", "false");
          localStorage.removeItem("restaurant_admin_refresh_token");
        }

        const decoded = decodeToken(urlToken);
        if (decoded) {
          const userObj = {
            id: decoded.userId || "user-id",
            name: decoded.role === "super_admin" ? "Super Admin" : "Restaurant Admin",
            email: decoded.email || "",
            role: decoded.role || "restaurant_admin",
            restaurantId: decoded.restaurantId || null,
          };
          localStorage.setItem("restaurant_user", JSON.stringify(userObj));
        }
        // Clean URL without triggering a React Router re-render loop
        window.history.replaceState({}, "", window.location.pathname);
        return urlToken;
      }
      return (
        localStorage.getItem("restaurant_admin_token") ||
        localStorage.getItem("restaurant_token") ||
        null
      );
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("restaurant_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore parsing error
        }
      }
      const initialToken =
        localStorage.getItem("restaurant_admin_token") ||
        localStorage.getItem("restaurant_token");
      if (initialToken) {
        const decoded = decodeToken(initialToken);
        if (decoded) {
          return {
            id: decoded.userId || "user-id",
            name: decoded.role === "super_admin" ? "Super Admin" : "Restaurant Admin",
            email: decoded.email || "",
            role: decoded.role || "restaurant_admin",
            restaurantId: decoded.restaurantId || null,
          };
        }
      }
    }
    return null;
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        if (!user || user.role !== decoded.role) {
          setUser({
            id: decoded.userId || user?.id || "user-id",
            name: user?.name || (decoded.role === "super_admin" ? "Super Admin" : "Restaurant Admin"),
            email: user?.email || decoded.email || "",
            role: decoded.role || "restaurant_admin",
            restaurantId: decoded.restaurantId || user?.restaurantId || null,
          });
        }
      } else if (!user) {
        setUser({
          id: "admin-user-id",
          name: "Restaurant Admin",
          restaurantId: "restaurant-id",
          role: "restaurant_admin",
        });
      }
    } else {
      setUser(null);
    }
  }, [token, user]);

  const login = useCallback((newToken, newUser, newRefreshToken = null, rememberMe = false) => {
    localStorage.setItem("restaurant_admin_token", newToken);
    if (rememberMe) {
      localStorage.setItem("restaurant_admin_remember", "true");
      if (newRefreshToken) {
        localStorage.setItem("restaurant_admin_refresh_token", newRefreshToken);
      }
    } else {
      localStorage.setItem("restaurant_admin_remember", "false");
      localStorage.removeItem("restaurant_admin_refresh_token");
    }

    if (newUser) {
      localStorage.setItem("restaurant_user", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const decoded = decodeToken(newToken);
      if (decoded) {
        const userObj = {
          id: decoded.userId || "user-id",
          name: decoded.role === "super_admin" ? "Super Admin" : "Restaurant Admin",
          email: decoded.email || "",
          role: decoded.role || "restaurant_admin",
          restaurantId: decoded.restaurantId || null,
        };
        localStorage.setItem("restaurant_user", JSON.stringify(userObj));
        setUser(userObj);
      }
    }
    setToken(newToken);
  }, []);

  const loginWithCredentials = useCallback(async (email, password, rememberMe = false) => {
    const response = await apiClient.post("/auth/login", { email, password, rememberMe });
    const payload = response.data?.data;
    const authToken = payload?.token;
    const authRefreshToken = payload?.refreshToken;
    const authUser = payload?.user;

    if (!authToken) {
      throw new Error(response.data?.message || "Login failed: No token received");
    }

    localStorage.setItem("restaurant_admin_token", authToken);
    if (rememberMe) {
      localStorage.setItem("restaurant_admin_remember", "true");
      if (authRefreshToken) {
        localStorage.setItem("restaurant_admin_refresh_token", authRefreshToken);
      }
    } else {
      localStorage.setItem("restaurant_admin_remember", "false");
      localStorage.removeItem("restaurant_admin_refresh_token");
    }

    if (authUser) {
      localStorage.setItem("restaurant_user", JSON.stringify(authUser));
      setUser(authUser);
    }
    setToken(authToken);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await Promise.race([
        apiClient.post("/auth/logout"),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (e) {
      console.error("Logout failed:", e);
    }

    localStorage.removeItem("restaurant_admin_token");
    localStorage.removeItem("restaurant_admin_refresh_token");
    localStorage.removeItem("restaurant_admin_remember");
    localStorage.removeItem("restaurant_token");
    localStorage.removeItem("restaurant_refresh_token");
    localStorage.removeItem("restaurant_user");

    const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
    window.location.replace(`${marketingWebUrl}/login`);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoggingOut,
        login,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
