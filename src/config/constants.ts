/* ───────────────────────────────────────────
   FieldScan Pro — Configuration Constants
   ─────────────────────────────────────────── */

/** Google Apps Script web-app endpoint */
export const GAS_URL =
  (typeof window !== "undefined" && (window as any).GAS_URL) ||
  "https://script.google.com/macros/s/AKfycbyWWtRaNdGYOJYIm7tnZZ6rhVXykdvztJ_hlksx_Yf0jfvbaedaiCpLwRE8inSEcDnR/exec";

/** Auth token sent with every API request — MUST match GAS SECRET_TOKEN */
export const AUTH_TOKEN =
  (typeof window !== "undefined" && (window as any).AUTH_TOKEN) ||
  "FieldScan2025!SecureToken";

/** Separator used for multiple attachments stored in a single string */
export const ATTACHMENT_DELIMITER = "|||";

/* ─── Master Data ─── */

export const MASTER_UNITS = [
  { value: "sqm", label: "sqm — Square Metres" },
  { value: "m", label: "m — Metres" },
  { value: "pcs", label: "pcs — Pieces" },
  { value: "set", label: "set — Set" },
  { value: "lot", label: "lot — Lot" },
  { value: "kg", label: "kg — Kilograms" },
  { value: "bag", label: "bag — Bag" },
  { value: "drum", label: "drum — Drum" },
  { value: "roll", label: "roll — Roll" },
  { value: "m\u00B3", label: "m\u00B3 — Cubic Metres" },
];

export const MASTER_ROOM_TYPES = [
  "Living Room",
  "Master Bedroom",
  "Bedroom",
  "Kitchen",
  "Bathroom/Toilet",
  "En-suite",
  "Dining Room",
  "Corridor/Hallway",
  "Staircase",
  "Store/Pantry",
  "Balcony/Terrace",
  "Entrance/Foyer",
  "Garage",
  "External Works",
];

export const MASTER_TRADE_CATEGORIES = [
  "Civil/Structural",
  "Masonry/Blockwork",
  "Carpentry/Joinery",
  "Electrical",
  "Plumbing/Mechanical",
  "Tiling/Flooring",
  "Painting/Decorating",
  "Roofing",
  "Aluminum/Glazing",
  "Ironmongery",
  "Landscaping",
  "Security/Access Control",
  "Fire Protection",
  "HVAC/AC",
  "Waterproofing",
];

/* ─── Branding ─── */

export const BRANDING = {
  companyName: "FieldScan Pro",
  address: "Road 1 House 5B, Isheri-Brooks Estate, Isheri-Olofin, Ogun State",
  phone1: "+234 809 260 8103",
  phone2: "+234 708 260 8103",
  email: "pi.projects20@gmail.com",
  rcNumber: "",
  logoUrl: "",
  defaultVat: 0.075,
  defaultWht: 0.05,
};
