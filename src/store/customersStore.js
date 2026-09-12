import { create } from "zustand";

const mockCustomers = [
  {
    id: "CUS-001",
    displayName: "Customer #001",
    mobile: "+91 98765 43210",
    totalOrders: 5,
    totalSpent: 4250,
    firstOrderAt: "2026-09-02T19:30:00",
    lastOrderAt: "2026-09-12T20:15:00",
    status: "returning",
    orders: [
      { id: "ORD-1052", orderNumber: "#1052", tableId: "table-3", amount: 2500, createdAt: "2026-09-12T20:15:00" },
      { id: "ORD-1024", orderNumber: "#1024", tableId: "table-5", amount: 950, createdAt: "2026-09-08T20:00:00" },
      { id: "ORD-1001", orderNumber: "#1001", tableId: "table-5", amount: 800, createdAt: "2026-09-02T19:30:00" }
    ]
  },
  {
    id: "CUS-002",
    displayName: "Customer #002",
    mobile: "+91 91234 56789",
    totalOrders: 1,
    totalSpent: 800,
    firstOrderAt: "2026-09-11T18:30:00",
    lastOrderAt: "2026-09-11T18:30:00",
    status: "new",
    orders: [
      { id: "ORD-1035", orderNumber: "#1035", tableId: "table-2", amount: 800, createdAt: "2026-09-11T18:30:00" }
    ]
  },
  {
    id: "CUS-003",
    displayName: "Customer #003",
    mobile: null,
    totalOrders: 2,
    totalSpent: 1400,
    firstOrderAt: "2026-09-05T12:00:00",
    lastOrderAt: "2026-09-10T19:45:00",
    status: "returning",
    orders: [
      { id: "ORD-1018", orderNumber: "#1018", tableId: "table-7", amount: 700, createdAt: "2026-09-10T19:45:00" },
      { id: "ORD-1005", orderNumber: "#1005", tableId: "table-4", amount: 700, createdAt: "2026-09-05T12:00:00" }
    ]
  },
  {
    id: "CUS-004",
    displayName: "Customer #004",
    mobile: "+91 99887 76655",
    totalOrders: 3,
    totalSpent: 1850,
    firstOrderAt: "2026-09-01T20:00:00",
    lastOrderAt: "2026-09-09T21:30:00",
    status: "returning",
    orders: [
      { id: "ORD-1015", orderNumber: "#1015", tableId: "table-6", amount: 550, createdAt: "2026-09-09T21:30:00" },
      { id: "ORD-1008", orderNumber: "#1008", tableId: "table-1", amount: 650, createdAt: "2026-09-04T19:00:00" },
      { id: "ORD-1002", orderNumber: "#1002", tableId: "table-8", amount: 650, createdAt: "2026-09-01T20:00:00" }
    ]
  },
  {
    id: "CUS-005",
    displayName: "Customer #005",
    mobile: null,
    totalOrders: 1,
    totalSpent: 450,
    firstOrderAt: "2026-09-12T13:00:00",
    lastOrderAt: "2026-09-12T13:00:00",
    status: "new",
    orders: [
      { id: "ORD-1060", orderNumber: "#1060", tableId: "table-3", amount: 450, createdAt: "2026-09-12T13:00:00" }
    ]
  },
  {
    id: "CUS-006",
    displayName: "Customer #006",
    mobile: "+91 94567 89012",
    totalOrders: 8,
    totalSpent: 6200,
    firstOrderAt: "2026-08-15T19:00:00",
    lastOrderAt: "2026-09-12T19:30:00",
    status: "returning",
    orders: [
      { id: "ORD-1062", orderNumber: "#1062", tableId: "table-5", amount: 750, createdAt: "2026-09-12T19:30:00" },
      { id: "ORD-1045", orderNumber: "#1045", tableId: "table-2", amount: 900, createdAt: "2026-09-08T20:30:00" },
      { id: "ORD-1032", orderNumber: "#1032", tableId: "table-7", amount: 680, createdAt: "2026-09-05T18:00:00" },
      { id: "ORD-1020", orderNumber: "#1020", tableId: "table-4", amount: 820, createdAt: "2026-09-01T19:15:00" }
    ]
  },
  {
    id: "CUS-007",
    displayName: "Customer #007",
    mobile: "+91 87654 32109",
    totalOrders: 2,
    totalSpent: 1100,
    firstOrderAt: "2026-09-07T20:00:00",
    lastOrderAt: "2026-09-11T18:00:00",
    status: "returning",
    orders: [
      { id: "ORD-1040", orderNumber: "#1040", tableId: "table-1", amount: 500, createdAt: "2026-09-11T18:00:00" },
      { id: "ORD-1010", orderNumber: "#1010", tableId: "table-6", amount: 600, createdAt: "2026-09-07T20:00:00" }
    ]
  },
  {
    id: "CUS-008",
    displayName: "Customer #008",
    mobile: null,
    totalOrders: 1,
    totalSpent: 350,
    firstOrderAt: "2026-09-12T12:30:00",
    lastOrderAt: "2026-09-12T12:30:00",
    status: "new",
    orders: [
      { id: "ORD-1058", orderNumber: "#1058", tableId: "table-8", amount: 350, createdAt: "2026-09-12T12:30:00" }
    ]
  }
];

export const useCustomersStore = create((set, get) => ({
  customers: [...mockCustomers],
  loading: false,
  error: null,

  updateCustomerContact: (customerId, mobile) => set((state) => ({
    customers: state.customers.map((c) => 
      c.id === customerId ? { ...c, mobile } : c
    )
  })),

  getCustomerById: (customerId) => {
    return get().customers.find((c) => c.id === customerId);
  },

  // Summary stats
  getStats: () => {
    const { customers } = get();
    const totalCustomers = customers.length;
    const withContact = customers.filter((c) => c.mobile).length;
    const recentCustomers = customers.filter((c) => {
      const lastOrder = new Date(c.lastOrderAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastOrder >= sevenDaysAgo;
    }).length;
    const returningCustomers = customers.filter((c) => c.totalOrders > 1).length;

    return { totalCustomers, withContact, recentCustomers, returningCustomers };
  }
}));