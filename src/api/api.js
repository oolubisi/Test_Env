// ===== api.js (React-adapted) =====
import { GAS_URL, AUTH_TOKEN, API_TIMEOUT_MS, ROLE_PERMISSIONS, DEPENDENCY_ORDER } from "../config/config.js";

/* ------------------------------------------------------------------ */
//  Offline queue helpers (localStorage-based, same as before)
/* ------------------------------------------------------------------ */
async function getQueuedRequests() {
  try {
    const raw = localStorage.getItem("fs_sync_queue");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveQueue(queue) {
  localStorage.setItem("fs_sync_queue", JSON.stringify(queue));
}

async function queueOfflineRequest(action, data) {
  const queue = await getQueuedRequests();
  queue.push({
    id: crypto.randomUUID?.() || Date.now() + "-" + Math.random().toString(36).slice(2),
    action,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  });
  await saveQueue(queue);
}

async function deleteQueuedRequest(id) {
  const queue = (await getQueuedRequests()).filter((q) => q.id !== id);
  await saveQueue(queue);
}

async function updateQueuedRequest(id, patch) {
  const queue = await getQueuedRequests();
  const idx = queue.findIndex((q) => q.id === id);
  if (idx !== -1) queue[idx] = { ...queue[idx], ...patch };
  await saveQueue(queue);
}

/* ------------------------------------------------------------------ */
//  Backup helpers
/* ------------------------------------------------------------------ */
function writeBackup(action, data) {
  localStorage.setItem(`fb_${action}`, JSON.stringify(data));
}

function readBackup(action, fallback) {
  try {
    const raw = localStorage.getItem(`fb_${action}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/* ------------------------------------------------------------------ */
//  Auth & envelope
/* ------------------------------------------------------------------ */
export function getFieldScanUser() {
  return {
    email: localStorage.getItem("fieldscan_user_email") || "",
    role: localStorage.getItem("fieldscan_user_role") || "viewer",
  };
}

export function canPerformAction(action) {
  const role = getFieldScanUser().role;
  const allowed = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  return allowed.includes("*") || allowed.includes(action) || (action.startsWith("get") && allowed.includes("get"));
}

function buildRequestEnvelope(action, data) {
  const envelope = { action, data, user: getFieldScanUser() };
  if (AUTH_TOKEN) envelope.token = AUTH_TOKEN;
  return envelope;
}

/* ------------------------------------------------------------------ */
//  Toast helper (dispatches custom event so UI can listen)
/* ------------------------------------------------------------------ */
export function showSyncToast(message, duration = 3000) {
  window.dispatchEvent(new CustomEvent("fs-toast", { detail: { message, duration } }));
}

/* ------------------------------------------------------------------ */
//  Core callApi
/* ------------------------------------------------------------------ */
export async function callApi(action, data = {}) {
  const isGet = action.startsWith("get");
  if (!canPerformAction(action)) {
    throw new Error(`Your current role cannot perform ${action}`);
  }
  const { token: _stripped, ...cleanData } = data;
  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const payload = buildRequestEnvelope(action, cleanData);
    response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    console.warn(`callApi [${action}] network error:`, err);
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    await queueOfflineRequest(action, cleanData);
    showSyncToast("📴 Offline: saved locally. Will sync when back online.");
    return { status: "queued" };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    console.warn(`callApi [${action}] HTTP ${response.status}`);
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.clone().text();
    if (text.trim().toLowerCase() === "unauthorized") {
      if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
      throw new Error("Unauthorized - check AUTH_TOKEN matches Script Properties");
    }
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    throw new Error("Server returned non-JSON: " + text.substring(0, 100));
  }

  let result;
  try {
    result = await response.json();
  } catch (err) {
    console.warn(`callApi [${action}] JSON parse error:`, err);
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    throw new Error("Invalid response from server");
  }

  if (typeof result === "string") {
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    throw new Error(result);
  }

  if (result?.status === "error" || result?.success === false) {
    const msg = result.message || result.error || "Server rejected the request";
    if (isGet) return readBackup(action, action === "getStats" ? { activeVendors: "--" } : []);
    throw new Error(msg);
  }

  const returnValue = isGet && result && result.data !== undefined ? result.data : result;

  if (isGet) {
    if (Array.isArray(returnValue) && returnValue.length === 0) {
      const backup = readBackup(action, null);
      if (Array.isArray(backup) && backup.length > 0) {
        writeBackup(action, backup);
        return backup;
      }
    }
    writeBackup(action, returnValue);
  }
  return returnValue;
}

/* ------------------------------------------------------------------ */
//  Sync engine
/* ------------------------------------------------------------------ */
export async function syncQueuedRequests(updateSyncStatus) {
  const queue = await getQueuedRequests();
  if (!queue.length) return;
  showSyncToast("🔄 Syncing offline data...", 10000);
  queue.sort((a, b) => (DEPENDENCY_ORDER[a.action] || 99) - (DEPENDENCY_ORDER[b.action] || 99));
  const failed = [];
  for (const item of queue) {
    let retries = 3, delay = 1000, success = false;
    while (retries > 0 && !success) {
      try {
        const payload = buildRequestEnvelope(item.action, item.data);
        const res = await fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const result = await res.json();
          if (!result.error && result.success !== false && result.status !== "error") {
            await deleteQueuedRequest(item.id);
            success = true;
            break;
          }
          throw new Error(result.message || "Server rejected request");
        }
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        retries--;
        await updateQueuedRequest(item.id, {
          retryCount: (item.retryCount || 0) + 1,
          lastError: err.message || "Sync failed",
          lastAttempt: new Date().toISOString(),
        });
        if (retries === 0) {
          failed.push(item.action);
        } else {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        }
      }
    }
  }
  if (updateSyncStatus) updateSyncStatus();
  if (failed.length) {
    showSyncToast(`⚠️ ${failed.length} item(s) failed to sync. Will retry later.`, 4000);
  } else {
    showSyncToast(`${queue.length} item(s) synced successfully.`, 3000);
  }
}

export async function getPendingCount() {
  const q = await getQueuedRequests();
  return q.length;
}