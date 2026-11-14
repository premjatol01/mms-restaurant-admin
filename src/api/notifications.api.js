import { apiClient } from "./client";

export const getNotifications = (unreadOnly = false) =>
  apiClient.get(`/notifications${unreadOnly ? "?unreadOnly=true" : ""}`);

export const markNotificationAsRead = (id) =>
  apiClient.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  apiClient.patch("/notifications/read-all");

export const deleteNotification = (id) =>
  apiClient.delete(`/notifications/${id}`);
