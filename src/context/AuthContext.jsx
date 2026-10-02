import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("restaurant_admin_token"));
  const [user, setUser] = useState(null); // Assuming user details could be stored or fetched

  useEffect(() => {
    // Ideally, here we would decode the token to get the user information
    // or make a request to the backend to get the user profile
    if (token) {
      // Mock user fetching/decoding for now
      setUser({
        id: "dummy-user-id",
        name: "Admin User",
        restaurantId: "dummy-restaurant-id", 
        role: "admin",
      });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem("restaurant_admin_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("restaurant_admin_token");
    setToken(null);
    setUser(null);
    
    // Redirect to marketing website login page
    const marketingWebUrl = import.meta.env.VITE_MARKETING_WEBSITE_URL || "http://localhost:3000";
    window.location.href = `${marketingWebUrl}/login`;
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
