// Shared constants for the Website module.

export const BASE_DOMAIN = "yourplatform.com";

export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 30;
export const RESERVED_SUBDOMAINS = [
  "www", "admin", "api", "app", "mail", "support", "help", "dashboard",
  "login", "static", "cdn", "blog", "status", "dev", "staging", "test"
];

export const IMAGE_MAX_MB = 5;
export const MAX_GALLERY_IMAGES = 20;
export const MAX_PURPOSE_OPTIONS = 10;

/* ---------- Website colors ---------- */

export const DEFAULT_WEBSITE_COLORS = {
  primary: "#f29191",
  secondary: "#b1e5e6",
  background: "#ffffff",
  text: "#1f2937"
};

export const WEBSITE_COLOR_FIELDS = [
  { key: "primary", label: "Primary color", hint: "Buttons, links and highlights" },
  { key: "secondary", label: "Secondary color", hint: "Badges and soft backgrounds" },
  { key: "background", label: "Background color", hint: "Page background" },
  { key: "text", label: "Text color", hint: "Headings and body text" }
];

export const COLOR_PRESETS = [
  { id: "blush", name: "Blush & mint", colors: DEFAULT_WEBSITE_COLORS },
  { id: "spice", name: "Spice", colors: { primary: "#d9480f", secondary: "#ffe8cc", background: "#fffaf5", text: "#2b2118" } },
  { id: "garden", name: "Garden", colors: { primary: "#2f9e44", secondary: "#d3f9d8", background: "#ffffff", text: "#1b2a1f" } },
  { id: "ocean", name: "Ocean", colors: { primary: "#1c7ed6", secondary: "#d0ebff", background: "#ffffff", text: "#12263a" } },
  { id: "midnight", name: "Midnight", colors: { primary: "#f59f00", secondary: "#2b2f3a", background: "#14161c", text: "#f1f3f5" } }
];

/* ---------- Menu colors ---------- */

export const DEFAULT_MENU_COLORS = {
  sectionBackground: "#fff5f5",
  cardBackground: "#ffffff",
  headingText: "#1f2937",
  priceText: "#e06b6b",
  accent: "#f29191",
  accentText: "#ffffff"
};

export const MENU_COLOR_FIELDS = [
  { key: "sectionBackground", label: "Section background", hint: "Behind the menu cards" },
  { key: "cardBackground", label: "Card background", hint: "Menu item cards and popup rows" },
  { key: "headingText", label: "Text color", hint: "Section title and item names" },
  { key: "priceText", label: "Price color", hint: "Item prices" },
  { key: "accent", label: "Accent color", hint: "Popular badge, buttons and active tabs" },
  { key: "accentText", label: "Text on accent", hint: "Text inside badges and buttons" }
];

/* ---------- Inquiry form ---------- */

export const DEFAULT_PURPOSE_OPTIONS = [
  "General Inquiry",
  "Table Reservation",
  "Group Booking",
  "Catering / Events",
  "Feedback",
  "Other"
];

export const INQUIRY_FIELDS = [
  { key: "name", label: "Name", hint: "Visitor's full name" },
  { key: "mobile", label: "Mobile", hint: "Phone number for a call back" },
  { key: "email", label: "Email", hint: "Email address for a reply" },
  { key: "purpose", label: "Purpose", hint: "Why the visitor is reaching out" },
  { key: "message", label: "Message", hint: "Free-text question or request" }
];
