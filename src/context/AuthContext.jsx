import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // 1. Check if token is passed in URL query (from login redirect)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        localStorage.setItem("restaurant_admin_token", urlToken);
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
    }
    return null;
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (token && !user) {
      setUser({
        id: "admin-user-id",
        name: "Restaurant Admin",
        restaurantId: "restaurant-id",
        role: "restaurant_admin",
      });
    } else if (!token) {
      setUser(null);
    }
  }, [token, user]);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("restaurant_admin_token", newToken);
    if (newUser) {
      localStorage.setItem("restaurant_user", JSON.stringify(newUser));
      setUser(newUser);
    }
    setToken(newToken);
  }, []);

  const loginWithCredentials = useCallback(async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    const payload = response.data?.data;
    const authToken = payload?.token;
    const authUser = payload?.user;

    if (!authToken) {
      throw new Error(response.data?.message || "Login failed: No token received");
    }

    localStorage.setItem("restaurant_admin_token", authToken);
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
    localStorage.removeItem("restaurant_token");
    localStorage.removeItem("restaurant_user");

    const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
    window.location.replace(`${marketingWebUrl}/login`);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoggingOut, login, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
