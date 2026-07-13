// ===== config.js =====
export const DEFAULT_GAS_URL =
  "https://script.google.com/macros/s/AKfycbxnkHlF9T7vfaUA2R8YA68Fjf7BI5DXPEZwvHC3WOqykUlVFrpd1GYB7s0GJVky-2nS/exec";

export const GAS_URL =
  localStorage.getItem("fieldscan_backend_url") || DEFAULT_GAS_URL;

export const AUTH_TOKEN = "FieldScan2025!SecureToken";

export const FIELD_SCAN_USER = {
  email: localStorage.getItem("fieldscan_user_email") || "",
  role: localStorage.getItem("fieldscan_user_role") || "admin",
};

export const ATTACHMENT_DELIMITER = "|||";

export const API_TIMEOUT_MS = 12000;

export const ROLE_PERMISSIONS = {
  admin: ["*"],
  manager: [
    "get", "saveProject", "updateProject", "updateProjectScope",
    "saveTakeOffItem", "updateTakeOffItem", "deleteTakeOffItem",
    "saveProgressLog", "updateProgressLog", "deleteProgressLog",
    "saveSnag", "updateSnag", "deleteSnag",
    "saveVendor", "updateVendor",
    "saveWorkOrder", "updateWorkOrder",
    "saveVariation", "updateVariation", "deleteVariation",
    "saveTakeOff", "updateTakeOff", "deleteTakeOff",
    "updateProjectPcrFields", "savePhoto", "updatePhotoComment", "deletePhoto",
  ],
  accountant: ["get", "savePayment", "updatePayment"],
  viewer: ["get"],
};

export const DEPENDENCY_ORDER = {
  saveProject: 1,
  updateProject: 1,
  saveVendor: 2,
  updateVendor: 2,
  saveWorkOrder: 3,
  updateWorkOrder: 3,
  saveTakeOffItem: 5,
  updateTakeOffItem: 5,
  deleteTakeOffItem: 5,
  saveProgressLog: 6,
  saveSnag: 7,
  updateSnag: 7,
  deleteSnag: 7,
  savePayment: 8,
  updatePayment: 8,
};