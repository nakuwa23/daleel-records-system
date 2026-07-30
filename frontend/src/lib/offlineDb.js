const DB_NAME = "daleel-offline";
const DB_VERSION = 1;
const INSTITUTIONS_STORE = "institutions";
const QUEUE_STORE = "verificationQueue";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INSTITUTIONS_STORE)) {
        db.createObjectStore(INSTITUTIONS_STORE, { keyPath: "institution_id" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(storeName, mode, work) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = work(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

// --- Trusted-issuer directory (public keys), cached whenever online ---

export async function cacheInstitutions(institutions) {
  await runTransaction(INSTITUTIONS_STORE, "readwrite", (store) => {
    store.clear();
    institutions.forEach((institution) => store.put(institution));
  });
  localStorage.setItem("daleel_institutions_synced_at", new Date().toISOString());
}

export function getCachedInstitutions() {
  return runTransaction(INSTITUTIONS_STORE, "readonly", (store) => {
    const items = [];
    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      }
    };
    return items;
  });
}

export async function getCachedPublicKey(issuerId) {
  const found = { current: null };
  await runTransaction(INSTITUTIONS_STORE, "readonly", (store) => {
    store.get(issuerId).onsuccess = (event) => {
      found.current = event.target.result || null;
    };
  });
  return found.current?.public_key || null;
}

export function getInstitutionsSyncedAt() {
  return localStorage.getItem("daleel_institutions_synced_at");
}

// --- Queue of offline verification results, flushed once back online ---

export function queueVerification(entry) {
  return runTransaction(QUEUE_STORE, "readwrite", (store) => {
    store.add({ ...entry, queuedAt: new Date().toISOString() });
  });
}

export function getQueuedVerifications() {
  return runTransaction(QUEUE_STORE, "readonly", (store) => {
    const items = [];
    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      }
    };
    return items;
  });
}

export function removeQueuedVerifications(ids) {
  return runTransaction(QUEUE_STORE, "readwrite", (store) => {
    ids.forEach((id) => store.delete(id));
  });
}

export async function getQueueCount() {
  const items = await getQueuedVerifications();
  return items.length;
}
