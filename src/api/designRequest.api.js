import { apiClient } from "./client";

export const designRequestApi = {
  getRequests: () => apiClient.get("/design-requests"),
  
  createRequest: (data) => {
    const formData = new FormData();
    formData.append("description", data.description);
    if (data.file) {
      formData.append("attachment", data.file);
    }
    
    return apiClient.post("/design-requests", formData);
  }
};
