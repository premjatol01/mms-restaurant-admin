export const PERMISSION_GROUPS = [
  {
    group: "Orders & Kitchen Operations",
    description: "Manage incoming dine-in orders, Kitchen Order Tickets (KOT), and preparation statuses",
    permissions: [
      { id: "orders_view", label: "View Live Orders & KOT", description: "Monitor active order tickets and table statuses in real-time" },
      { id: "orders_manage", label: "Update Order Status", description: "Accept, mark preparing, ready, served, or cancel orders" },
      { id: "table_sessions", label: "Manage Table Sessions", description: "Open table sessions, add customer items, and close sessions" },
    ],
  },
  {
    group: "Menu & Inventory",
    description: "Control digital menu dishes, categories, pricing, and 86'd out-of-stock items",
    permissions: [
      { id: "menu_view", label: "View Menu Items & Categories", description: "Browse all items, prices, dietary badges, and combos" },
      { id: "menu_manage", label: "Edit Menu & Pricing", description: "Create dishes, update prices, food descriptions, and combos" },
      { id: "menu_availability", label: "Toggle Item Availability", description: "Mark dishes as Available or Unavailable (86'd) instantly" },
    ],
  },
  {
    group: "Floor Tables & QR Codes",
    description: "Physical restaurant floor layout, table capacities, and QR standee printing",
    permissions: [
      { id: "tables_view", label: "View Tables & QR Codes", description: "View physical floor tables and assigned QR standees" },
      { id: "tables_manage", label: "Manage Tables & Print QR", description: "Add tables, assign designer QR templates, and download ZIP prints" },
    ],
  },
  {
    group: "Guest Portal & Entertainment",
    description: "Customer dine-in experience, table games, waiter calling, and marketing tools",
    permissions: [
      { id: "portal_handler", label: "Portal Configuration", description: "Configure Top 5 categories, bestsellers, and table ordering" },
      { id: "table_games", label: "Table Games Control", description: "Toggle Foodie Trivia, Dare & Spin Wheel, and Tic-Tac-Toe" },
      { id: "waiter_handler", label: "Waiter Service Requests", description: "Receive and fulfill customer calls for water, captain, or bill" },
    ],
  },
  {
    group: "Marketing, Reviews & Growth",
    description: "Customer loyalty, promotional coupons, Google review collection, and playbooks",
    permissions: [
      { id: "offers_manage", label: "Create Offers & Promo Codes", description: "Create table coupon discounts and banner announcements" },
      { id: "reviews_manage", label: "Moderate Customer Reviews", description: "Approve 5-star Google review prompts and manage feedback" },
      { id: "biz_growth", label: "Access Biz Growth Hub", description: "Access restaurant playbooks, masterclasses, and revenue guides" },
    ],
  },
  {
    group: "Billing, GST & Administration",
    description: "Payment collection, GST tax invoices, audit reports, and staff RBAC",
    permissions: [
      { id: "billing_settle", label: "Settle Bills & Collect Payment", description: "Record cash, card, or UPI settlements and print bill slips" },
      { id: "gst_reports", label: "GST Reports & Excel Export", description: "Generate GST invoices and download monthly financial Excel reports" },
      { id: "staff_manage", label: "Manage Staff & Roles (RBAC)", description: "Invite new team members, assign role permissions, and suspend access" },
    ],
  },
];

export const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id));

export const PRESET_ROLES = [
  {
    id: "admin",
    name: "Restaurant Admin",
    badgeColor: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    description: "Full unrestricted access to all operations, menu, billing, staff, and platform settings.",
    permissions: ALL_PERMISSION_IDS,
    isProtected: true,
  },
  {
    id: "manager",
    name: "Floor Manager",
    badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    description: "Oversees day-to-day operations, kitchen orders, table sessions, menu availability, and guest reviews.",
    permissions: [
      "orders_view", "orders_manage", "table_sessions",
      "menu_view", "menu_manage", "menu_availability",
      "tables_view", "tables_manage",
      "portal_handler", "table_games", "waiter_handler",
      "offers_manage", "reviews_manage", "biz_growth",
      "billing_settle"
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen Staff / Chef",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    description: "Dedicated Kitchen Display System (KDS/KOT) view to accept, prepare, and dispatch food orders, plus toggle sold-out dishes.",
    permissions: [
      "orders_view", "orders_manage",
      "menu_view", "menu_availability"
    ],
  },
  {
    id: "waiter",
    name: "Waiter / Captain",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    description: "Floor service staff receiving customer waiter calls (water, bill, captain) and monitoring table order progress.",
    permissions: [
      "orders_view", "table_sessions",
      "tables_view", "waiter_handler", "menu_view"
    ],
  },
  {
    id: "cashier",
    name: "Cashier / Billing",
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    description: "Billing counter operator handling payment settlements, bill prints, GST receipts, and daily sales totals.",
    permissions: [
      "orders_view", "table_sessions",
      "billing_settle", "gst_reports"
    ],
  },
  {
    id: "custom",
    name: "Custom Role",
    badgeColor: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
    description: "Tailored permission set configured manually by the restaurant administrator.",
    permissions: [],
  },
];

export const INITIAL_STAFF_MEMBERS = [
  {
    id: "staff-1",
    name: "Vikram Malhotra",
    email: "vikram@spicegarden.com",
    phone: "9876543210",
    roleId: "admin",
    roleName: "Restaurant Admin",
    status: "active", // 'active', 'pending_activation', 'inactive'
    permissions: ALL_PERMISSION_IDS,
    invitedAt: "2026-10-01T10:30:00Z",
    activatedAt: "2026-10-01T11:00:00Z",
    lastLoginAt: "2026-11-14T20:45:00Z",
    avatar: null,
    isOwner: true,
  },
  {
    id: "staff-2",
    name: "Ananya Sharma",
    email: "ananya.manager@spicegarden.com",
    phone: "9876543211",
    roleId: "manager",
    roleName: "Floor Manager",
    status: "active",
    permissions: PRESET_ROLES.find(r => r.id === "manager").permissions,
    invitedAt: "2026-10-05T09:15:00Z",
    activatedAt: "2026-10-05T12:30:00Z",
    lastLoginAt: "2026-11-14T19:20:00Z",
    avatar: null,
    isOwner: false,
  },
  {
    id: "staff-3",
    name: "Chef Rajesh Kumar",
    email: "rajesh.chef@spicegarden.com",
    phone: "9876543212",
    roleId: "kitchen",
    roleName: "Kitchen Staff / Chef",
    status: "active",
    permissions: PRESET_ROLES.find(r => r.id === "kitchen").permissions,
    invitedAt: "2026-10-10T14:00:00Z",
    activatedAt: "2026-10-10T15:10:00Z",
    lastLoginAt: "2026-11-14T18:10:00Z",
    avatar: null,
    isOwner: false,
  },
  {
    id: "staff-4",
    name: "Sunil Verma",
    email: "sunil.waiter@spicegarden.com",
    phone: "9876543213",
    roleId: "waiter",
    roleName: "Waiter / Captain",
    status: "pending_activation",
    permissions: PRESET_ROLES.find(r => r.id === "waiter").permissions,
    invitedAt: "2026-11-12T11:20:00Z",
    activatedAt: null,
    lastLoginAt: null,
    activationToken: "act_token_sunil_9812",
    tokenExpiresAt: "2026-11-19T11:20:00Z",
    avatar: null,
    isOwner: false,
  },
  {
    id: "staff-5",
    name: "Pooja Patel",
    email: "pooja.billing@spicegarden.com",
    phone: "9876543214",
    roleId: "cashier",
    roleName: "Cashier / Billing",
    status: "active",
    permissions: PRESET_ROLES.find(r => r.id === "cashier").permissions,
    invitedAt: "2026-10-20T16:00:00Z",
    activatedAt: "2026-10-21T09:00:00Z",
    lastLoginAt: "2026-11-13T21:05:00Z",
    avatar: null,
    isOwner: false,
  },
];
