import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000");

/**
 * Connects to the Socket.io server and joins the restaurant's room.
 * @param {string} restaurantId - The MongoDB _id of the logged-in restaurant.
 * @param {object} callbacks - Event handlers: { onOrderCreated, onOrderUpdated, onSessionUpdated, onSessionCompleted }
 */
export function connectAdminSocket(restaurantId, callbacks = {}) {
  if (socket && socket.connected) {
    if (restaurantId) {
      socket.emit("join_restaurant", restaurantId);
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    if (restaurantId) {
      socket.emit("join_restaurant", restaurantId);
    }
  });

  if (callbacks.onOrderCreated) {
    socket.on("order:created", callbacks.onOrderCreated);
  }

  if (callbacks.onOrderUpdated) {
    socket.on("order:updated", callbacks.onOrderUpdated);
  }

  if (callbacks.onSessionUpdated) {
    socket.on("session:updated", callbacks.onSessionUpdated);
  }

  if (callbacks.onSessionCompleted) {
    socket.on("session:completed", callbacks.onSessionCompleted);
  }

  return socket;
}

/**
 * Disconnects the socket when admin logs out or unmounts.
 */
export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Returns current socket instance.
 */
export function getAdminSocket() {
  return socket;
}
