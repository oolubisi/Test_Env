/* ───────────────────────────────────────────
   IndexedDB Layer — Offline Queue + Snag Photos
   ─────────────────────────────────────────── */

import type { QueuedRequest } from "@/types";

const DB_NAME = "FieldScanDB";
const DB_VERSION = 3;

let dbPromise: Promise<IDBDatabase> | null = null;

/** Open (or create) the IndexedDB v3 database */
export function openQueueDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("snagPhotos")) {
        db.createObjectStore("snagPhotos", { keyPath: "snagId" });
      }
    };
  });
  return dbPromise;
}

/** Queue an API action for later sync when offline */
export async function queueOfflineRequest(
  action: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = await openQueueDB();
  const tx = db.transaction("syncQueue", "readwrite");
  const store = tx.objectStore("syncQueue");
  const entry: QueuedRequest = {
    action,
    data,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const req = store.add(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve all queued requests from the sync queue */
export async function getQueuedRequests(): Promise<
  Array<QueuedRequest & { id: number }>
> {
  const db = await openQueueDB();
  const tx = db.transaction("syncQueue", "readonly");
  const store = tx.objectStore("syncQueue");
  return new Promise((resolve, reject) => {
    const req = store.openCursor();
    const results: Array<QueuedRequest & { id: number }> = [];
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        results.push({ ...cursor.value, id: cursor.key as number });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/** Remove a completed request from the queue */
export async function deleteQueuedRequest(id: number): Promise<void> {
  const db = await openQueueDB();
  const tx = db.transaction("syncQueue", "readwrite");
  const store = tx.objectStore("syncQueue");
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ─── Snag Photos (large blobs kept out of main sync) ─── */

/** Save snag photo data locally as a base64 string */
export async function saveSnagPhotosLocally(
  snagId: string,
  photoDataString: string
): Promise<void> {
  const db = await openQueueDB();
  const tx = db.transaction("snagPhotos", "readwrite");
  const store = tx.objectStore("snagPhotos");
  return new Promise((resolve, reject) => {
    const req = store.put({ snagId, photoDataString });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve locally-stored snag photo data */
export async function getSnagPhotosLocally(
  snagId: string
): Promise<string | null> {
  const db = await openQueueDB();
  const tx = db.transaction("snagPhotos", "readonly");
  const store = tx.objectStore("snagPhotos");
  return new Promise((resolve, reject) => {
    const req = store.get(snagId);
    req.onsuccess = () => {
      const result = req.result;
      resolve(result ? result.photoDataString : null);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Delete locally-stored snag photo data */
export async function deleteSnagPhotosLocally(snagId: string): Promise<void> {
  const db = await openQueueDB();
  const tx = db.transaction("snagPhotos", "readwrite");
  const store = tx.objectStore("snagPhotos");
  return new Promise((resolve, reject) => {
    const req = store.delete(snagId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
