import { addDays, subMonths } from "date-fns";

// Dummy data for the Subscription tab. Replace with the real API response later.
// status: "active" | "trial" | "expired" | "cancelled"
export const getDummySubscription = () => ({
  planName: "Growth",
  status: "active",
  billingCycle: "monthly",
  price: 1499,
  currency: "INR",
  startDate: subMonths(new Date(), 3).toISOString(),
  renewalDate: addDays(new Date(), 21).toISOString(),
  features: ["QR table ordering", "Unlimited menu categories", "Order history and reports", "Priority support"],
  usage: {
    tables: { used: 12, limit: 25 },
    menuItems: { used: 64, limit: 200 },
  },
});
