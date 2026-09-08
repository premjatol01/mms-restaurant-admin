import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const profileApi = {
  get: () => api.get("/restaurant/profile"),
  update: (data) => api.put("/restaurant/profile", data),
  uploadLogo: (formData) => api.post("/restaurant/profile/logo", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  removeLogo: () => api.delete("/restaurant/profile/logo"),
  uploadCover: (formData) => api.post("/restaurant/profile/cover", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  removeCover: () => api.delete("/restaurant/profile/cover"),
};
