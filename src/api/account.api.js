import { apiClient } from "./client";

export const accountApi = {
  getAccount: () => apiClient.get("/restaurant/account"),
  updateAccount: (data) => apiClient.put("/restaurant/account", data),
  changePassword: (data) => apiClient.put("/restaurant/account/change-password", data),
};
