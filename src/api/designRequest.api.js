import { apiClient } from "./client";

export const designRequestApi = {
  getRequests: () => apiClient.get("/design-requests"),
  getRequestById: (id) => apiClient.get(`/design-requests/${id}`),
  
  createRequest: (data) => {
    const formData = new FormData();
    formData.append("description", data.description);
    if (data.requestType) {
      formData.append("requestType", data.requestType);
    }
    if (data.title) {
      formData.append("title", data.title);
    }
    if (data.file) {
      formData.append("attachment", data.file);
    }
    
    return apiClient.post("/design-requests", formData);
  }
};
