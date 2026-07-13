import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { FIELD_SCAN_USER, ROLE_PERMISSIONS } from "../config/config.js";

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

function seedCacheFromBackup() {
  const seeds = [
    { key: "projects", action: "getProjects", isArray: true },
    { key: "takeoffs", action: "getTakeOffItems", isArray: true },
    { key: "progressLogs", action: "getProgressLogs", isArray: true },
    { key: "snags", action: "getSnags", isArray: true },
    { key: "vendors", action: "getVendors", isArray: true },
    { key: "workorders", action: "getWorkOrders", isArray: true },
    { key: "payments", action: "getPayments", isArray: true },
    { key: "settings", action: "getSettings", isArray: false },
  ];
  const cache = {};
  seeds.forEach(({ key, action, isArray }) => {
    try {
      const raw = localStorage.getItem(`fb_${action}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        cache[key] = isArray ? (Array.isArray(parsed) ? parsed : []) : (parsed && typeof parsed === "object" ? parsed : {});
      } else {
        cache[key] = isArray ? [] : {};
      }
    } catch (e) {
      cache[key] = isArray ? [] : {};
    }
  });
  return cache;
}

export function AppProvider({ children }) {
  const [cache, setCacheState] = useState(() => seedCacheFromBackup());
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ online: navigator.onLine, pending: 0 });
  const [user, setUser] = useState(() => ({
    email: localStorage.getItem("fieldscan_user_email") || FIELD_SCAN_USER.email || "",
    role: localStorage.getItem("fieldscan_user_role") || FIELD_SCAN_USER.role || "viewer",
  }));

  const setCache = useCallback((updater) => {
    setCacheState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      // Deep-merge settings
      if (updater?.settings && prev.settings) {
        next.settings = { ...prev.settings, ...updater.settings };
      }
      return next;
    });
  }, []);

  const getCache = useCallback(() => cache, [cache]);

  const updateSync = useCallback((pendingCount) => {
    setSyncStatus({ online: navigator.onLine, pending: pendingCount ?? syncStatus.pending });
  }, [syncStatus.pending]);

  useEffect(() => {
    const onOnline = () => updateSync();
    const onOffline = () => updateSync();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [updateSync]);

  const value = {
    cache,
    setCache,
    getCache,
    currentProjectId,
    setCurrentProjectId,
    syncStatus,
    updateSync,
    user,
    setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}