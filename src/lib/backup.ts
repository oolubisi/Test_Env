/* ───────────────────────────────────────────
   Backup — localStorage persistence layer
   
   Uses "fb_" prefix to match the original app
   so existing cached data is preserved.
   ─────────────────────────────────────────── */

import type { AppCache } from "@/types";
import { setCache } from "./api";

const BACKUP_PREFIX = "fb_";

/** Write data to localStorage backup */
export function writeBackup(action: string, data: unknown): void {
  const key = BACKUP_PREFIX + action;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Backup write failed (quota exceeded?):", e);
  }
}

/** Read data from localStorage backup */
export function readBackup<T>(action: string, fallback?: T): T | undefined {
  const key = BACKUP_PREFIX + action;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* corrupt JSON */
  }
  return fallback;
}

/** Hydrate the in-memory cache from localStorage on app start.
 *  Uses the EXACT action names from the GAS doPost handler. */
export function seedCacheFromBackup(): void {
  const keys: Array<{ action: string; cacheKey: keyof AppCache }> = [
    { action: "getProjects", cacheKey: "projects" },
    { action: "getTakeOffItems", cacheKey: "takeoffs" },
    { action: "getProgressLogs", cacheKey: "progressLogs" },
    { action: "getSnags", cacheKey: "snags" },
    { action: "getVendors", cacheKey: "vendors" },
    { action: "getWorkOrders", cacheKey: "workorders" },
    { action: "getPayments", cacheKey: "payments" },
    { action: "getVariations", cacheKey: "variations" },
    { action: "getTakeOffs", cacheKey: "takeOffs" },
    { action: "getSettings", cacheKey: "settings" },
  ];

  let seeded = false;
  for (const { action, cacheKey } of keys) {
    const data = readBackup(action);
    if (data !== undefined) {
      setCache(cacheKey, data as AppCache[typeof cacheKey]);
      seeded = true;
    }
  }

  if (seeded) {
    /* Notify React that cache has been seeded */
    window.dispatchEvent(new CustomEvent("cacheupdated"));
  }
}
