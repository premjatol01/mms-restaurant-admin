import { create } from "zustand";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
} from "../api/notifications.api";

// High-fidelity web audio bell chime (pure synthesizer, zero external asset dependency)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);
  } catch (e) {
    // Autoplay may be deferred until first user interaction
  }
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  soundEnabled: localStorage.getItem("tablly_notification_sound") !== "false",

  setSoundEnabled: (enabled) => {
    localStorage.setItem("tablly_notification_sound", enabled ? "true" : "false");
    set({ soundEnabled: enabled });
  },

  fetchNotifications: async (unreadOnly = false) => {
    set({ loading: true });
    try {
      const res = await getNotifications(unreadOnly);
      if (res.data?.success) {
        set({
          notifications: res.data.notifications || [],
          unreadCount: res.data.unreadCount ?? 0,
        });
      }
    } catch (err) {
      console.warn("Could not fetch notifications:", err.message);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true, readAt: new Date() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date(),
      })),
      unreadCount: 0,
    }));

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  },

  deleteNotification: async (id) => {
    const item = get().notifications.find((n) => n._id === id);
    const wasUnread = item && !item.isRead;

    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));

    try {
      await apiDeleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  },

  // Called when real-time socket event arrives
  addNotification: (notification) => {
    if (!notification) return;

    if (get().soundEnabled) {
      playNotificationChime();
    }

    set((state) => {
      // Avoid duplicate by _id
      const exists = state.notifications.some((n) => n._id === notification._id);
      if (exists) return state;

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
      };
    });
  },
}));
