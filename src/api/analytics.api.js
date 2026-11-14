import { apiClient } from "./client";

export const getRestaurantAnalytics = () =>
  apiClient.get("/restaurant/analytics");
