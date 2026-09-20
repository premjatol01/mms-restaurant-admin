import { CURRENT_RESTAURANT_ID } from "../data/tablesQRData";

// Base URL of the customer-facing ordering site (set VITE_CUSTOMER_APP_URL in .env).
// TODO: make sure this matches the route your customer app uses to open a table's menu.
const CUSTOMER_APP_URL = import.meta.env.VITE_CUSTOMER_APP_URL || "https://your-restaurant-site.com";

/** The URL a customer lands on after scanning the QR placed on `table`. */
export function buildTableQRUrl({ table, qr, restaurantId = CURRENT_RESTAURANT_ID }) {
  const params = new URLSearchParams({ restaurant: restaurantId, table: table.id, qr: qr.id });
  return `${CUSTOMER_APP_URL.replace(/\/$/, "")}/order?${params.toString()}`;
}
