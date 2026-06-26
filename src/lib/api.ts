/* ───────────────────────────────────────────
   API Layer — GAS proxy, cache, offline queue
   ─────────────────────────────────────────── */

import { GAS_URL, AUTH_TOKEN } from "@/config/constants";
import type { AppCache, ApiResponse } from "@/types";
import {
  queueOfflineRequest,
  getQueuedRequests,
  deleteQueuedRequest,
} from "./db";
import { writeBackup, readBackup } from "./backup";
import { showSyncToast } from "./utils";

/* ─── In-memory cache (mirrored to localStorage) ─── */

const cache: AppCache = {
  projects: [],
  takeoffs: [],
  progressLogs: [],
  snags: [],
  vendors: [],
  workorders: [],
  payments: [],
  variations: [],
  takeOffs: [],
  settings: { VAT: 0.075, WHT: 0.05, Logo: "", Name_Signed: "", Sign_Signed: "" },
};

let currentProjectId: string = "";

/** Replace the entire cache or a specific key */
export function setCache<K extends keyof AppCache>(key: K, value: AppCache[K]): void;
export function setCache(value: Partial<AppCache>): void;
export function setCache(
  keyOrValue: keyof AppCache | Partial<AppCache>,
  value?: unknown
): void {
  if (typeof keyOrValue === "string") {
    (cache as Record<string, unknown>)[keyOrValue] = value;
  } else {
    Object.assign(cache, keyOrValue);
  }
}

/** Read from cache */
export function getCache<K extends keyof AppCache>(key: K): AppCache[K] {
  return cache[key];
}

/** Get the full cache object (for hooks) */
export function getFullCache(): AppCache {
  return cache;
}

/** Set the currently active project */
export function setCurrentProjectId(id: string): void {
  currentProjectId = id;
  localStorage.setItem("currentProjectId", id);
}

/** Get the currently active project */
export function getCurrentProjectId(): string {
  if (!currentProjectId) {
    currentProjectId = localStorage.getItem("currentProjectId") || "";
  }
  return currentProjectId;
}

/* ─── Core API caller ─── */

export async function callApi(
  action: string,
  data?: Record<string, unknown>
): Promise<ApiResponse> {
  const isGet = action.startsWith("get");
  const payload = { action, token: AUTH_TOKEN, data: data ?? {} };
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const resp = await fetch(GAS_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      /* GAS redirects to a login page on auth failure — detect HTML response */
      const contentType = resp.headers.get("content-type") || "";
      const text = await resp.text();

      /* If GAS returns an HTML page (redirect/login), treat as error */
      if (text.trim().startsWith("<") || contentType.includes("text/html")) {
        throw new Error("GAS returned HTML instead of JSON — check deployment URL");
      }

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${text.slice(0, 200)}`);
      }

      /* Parse JSON response */
      let json: ApiResponse;
      try {
        json = JSON.parse(text);
      } catch {
        json = { status: "error", message: `Invalid JSON: ${text.slice(0, 200)}` };
      }

      /* On success, persist GET responses to localStorage */
      if (json.status === "success" && isGet && json.data !== undefined) {
        writeBackup(action, json.data);
      }

      return json;
    } catch (err) {
      attempts++;
      /* On final attempt, return backup data for GETs instead of queuing */
      if (attempts >= maxAttempts) {
        if (isGet) {
          /* Return localStorage backup so UI never shows empty */
          const backupData = readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
          /* Also update in-memory cache with backup data */
          const cacheKey = mapActionToCacheKey(action);
          if (cacheKey && Array.isArray(backupData)) {
            setCache(cacheKey as keyof AppCache, backupData as AppCache[keyof AppCache]);
          }
          if (isGet && !navigator.onLine) {
            showSyncToast("📴 Offline — showing cached data", 3000);
          }
          return { status: "success", data: backupData };
        }

        /* Mutations: queue for later sync */
        if (!navigator.onLine) {
          await queueOfflineRequest(action, data ?? {});
          showSyncToast("📴 Offline — saved locally. Will sync when back online.", 3000);
          return { status: "queued" };
        }

        /* Online but got an error — show it */
        const errMsg = err instanceof Error ? err.message : String(err);
        return { status: "error", message: errMsg };
      }

      /* Exponential backoff before retry */
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, attempts - 1)));
    }
  }

  return { status: "error", message: "Max retries exceeded" };
}

/* ─── Sync queued requests ─── */

/** Action priority order for dependency-safe sync */
const SYNC_PRIORITY: Record<string, number> = {
  saveProject: 1,
  updateProject: 1,
  updateProjectScope: 1,
  updateProjectContractSubtotal: 1,
  saveVendor: 2,
  updateVendor: 2,
  deleteVendor: 2,
  saveWorkOrder: 3,
  updateWorkOrder: 3,
  deleteWorkOrder: 3,
  savePayment: 4,
  updatePayment: 4,
  saveTakeOff: 5,
  updateTakeOff: 5,
  deleteTakeOff: 5,
  saveTakeOffItem: 5,
  updateTakeOffItem: 5,
  deleteTakeOffItem: 5,
  saveProgressLog: 6,
  saveSnag: 7,
  updateSnag: 7,
  deleteSnag: 7,
  saveVariation: 8,
  updateVariation: 8,
  deleteVariation: 8,
  saveTakeOffTemplate: 9,
  deleteTakeOffTemplate: 9,
  updateSetting: 99,
};

function getPriority(action: string): number {
  for (const [prefix, prio] of Object.entries(SYNC_PRIORITY)) {
    if (action.startsWith(prefix)) return prio;
  }
  return 50;
}

/** Process all queued requests in dependency order */
export async function syncQueuedRequests(): Promise<{
  success: number;
  failed: number;
}> {
  const queued = await getQueuedRequests();
  if (queued.length === 0) return { success: 0, failed: 0 };

  /* Sort by priority */
  queued.sort((a, b) => getPriority(a.action) - getPriority(b.action));

  let success = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      const resp = await callApi(item.action, item.data);
      if (resp.status === "success" || resp.status === "queued") {
        await deleteQueuedRequest(item.id!);
        success++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    /* Small delay between requests to avoid rate-limiting */
    await new Promise((r) => setTimeout(r, 200));
  }

  updateSyncStatus();
  return { success, failed };
}

/** Update the sync badge in the UI */
export function updateSyncStatus(): void {
  getQueuedRequests().then((queued) => {
    const count = queued.length;
    const badge = document.getElementById("sync-badge");
    if (badge) {
      badge.textContent = count > 0 ? String(count) : "";
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
    window.dispatchEvent(
      new CustomEvent("syncqueuechange", { detail: { count } })
    );
  });
}

/** Manual sync trigger (e.g. button click) */
export async function triggerManualSync(): Promise<void> {
  if (!navigator.onLine) {
    showSyncToast("You are offline. Please connect to internet.", 3000);
    return;
  }
  showSyncToast("🔄 Syncing offline data…", 10000);
  const { success, failed } = await syncQueuedRequests();
  if (failed === 0) {
    showSyncToast(`${success} item(s) synced successfully`, 3000);
  } else {
    showSyncToast(`${success} synced, ${failed} failed — will retry`, 4000);
  }
}

/* ─── Bulk data refresh ─── */

const REFRESH_ACTIONS = [
  "getProjects",
  "getTakeOffItems",
  "getProgressLogs",
  "getSnags",
  "getVendors",
  "getWorkOrders",
  "getPayments",
  "getVariations",
  "getTakeOffs",
  "getSettings",
];

/** Fetch all data endpoints and update cache + localStorage */
export async function refreshAllData(): Promise<void> {
  for (const action of REFRESH_ACTIONS) {
    try {
      const resp = await callApi(action);
      if (resp.status === "success" && resp.data !== undefined) {
        const cacheKey = mapActionToCacheKey(action);
        if (cacheKey) {
          setCache(cacheKey as keyof AppCache, resp.data as AppCache[keyof AppCache]);
        }
      }
    } catch {
      /* Silently continue — localStorage backup will be used via callApi */
    }
    /* Small delay between requests */
    await new Promise((r) => setTimeout(r, 100));
  }
  window.dispatchEvent(new CustomEvent("cacheupdated"));
}

function mapActionToCacheKey(action: string): string | null {
  const mapping: Record<string, string> = {
    getProjects: "projects",
    getTakeOffItems: "takeoffs",
    getProgressLogs: "progressLogs",
    getSnags: "snags",
    getVendors: "vendors",
    getWorkOrders: "workorders",
    getPayments: "payments",
    getVariations: "variations",
    getTakeOffs: "takeOffs",
    getSettings: "settings",
  };
  return mapping[action] ?? null;
}

/* ─── Window-level helpers ─── */

if (typeof window !== "undefined") {
  (window as any).callApi = callApi;
  (window as any).refreshAllData = refreshAllData;
  (window as any).syncQueuedRequests = syncQueuedRequests;
  (window as any).triggerManualSync = triggerManualSync;
}
