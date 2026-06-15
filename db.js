// db.js
const DB_NAME = "FieldScanOfflineDB";
const STORE_NAME = "syncQueue";

let dbPromise = null;

export function openQueueDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = (e) => { e.target.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true }); };
    req.onsuccess = (e) => {
      const db = e.target.result;
      db.onclose = () => { dbPromise = null; };
      resolve(db);
    };
    req.onerror = (e) => { dbPromise = null; reject(e.target.error); };
  });
  return dbPromise;
}

export async function queueOfflineRequest(action, data) {
  const db = await openQueueDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ action, data, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedRequests() {
  const db = await openQueueDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteQueuedRequest(id) {
  const db = await openQueueDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
