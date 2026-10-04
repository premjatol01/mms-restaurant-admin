import { apiClient } from "./client";

export const websiteApi = {
  checkSubdomain: (slug) =>
    apiClient.get("/restaurant/subdomain/check", { params: { slug } }),

  saveSubdomain: (subdomain) =>
    apiClient.put("/restaurant/profile", { website: { subdomain } }),
};
