
import type {
  LocalPhotoAsset,
  LocalSyncMetadata,
  Memory,
  MemoryNote,
  MemoryPhoto,
  SyncQueueItem,
  Visit,
} from "./types";

const DB_NAME = "elsewhere-memory";
const DB_VERSION = 1;

const STORES = {
  memories: "memories",
  visits: "visits",
  notes: "notes",
  photos: "photos",
  photoAssets: "photoAssets",
  syncQueue: "syncQueue",
  syncMetadata: "syncMetadata",
  appMeta: "appMeta",
} as const;

let databasePromise: Promise<IDBDatabase> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });
}

/**
 * Opens the local Memory Map database.
 * The database is created automatically on first use.
 */
export function openMemoryDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(
      new Error("IndexedDB is not available in this browser.")
    );
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.memories)) {
        const store = db.createObjectStore(STORES.memories, {
          keyPath: "id",
        });
        store.createIndex("by-visit", "visitId", { unique: false });
        store.createIndex("by-updated", "updatedAt", { unique: false });
        store.createIndex("by-deleted", "deletedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.visits)) {
        const store = db.createObjectStore(STORES.visits, {
          keyPath: "id",
        });
        store.createIndex("by-updated", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.notes)) {
        const store = db.createObjectStore(STORES.notes, {
          keyPath: "id",
        });
        store.createIndex("by-memory", "memoryId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.photos)) {
        const store = db.createObjectStore(STORES.photos, {
          keyPath: "id",
        });
        store.createIndex("by-memory", "memoryId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.photoAssets)) {
        db.createObjectStore(STORES.photoAssets, {
          keyPath: "photoId",
        });
      }

      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, {
          keyPath: "id",
        });
        store.createIndex("by-status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.syncMetadata)) {
        db.createObjectStore(STORES.syncMetadata);
      }

      if (!db.objectStoreNames.contains(STORES.appMeta)) {
        db.createObjectStore(STORES.appMeta, {
          keyPath: "key",
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        databasePromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("Could not open the local database."));
    };

    request.onblocked = () => {
      console.warn(
        "Memory database upgrade is blocked by another open app tab."
      );
    };
  });

  return databasePromise;
}

/** Creates a unique ID locally, without needing an internet connection. */
export function createLocalId(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error(
      "Secure UUID generation is unavailable. Use HTTPS or localhost."
    );
  }

  return globalThis.crypto.randomUUID();
}

function createQueueItem(
  entityType: SyncQueueItem["entityType"],
  entityId: string
): SyncQueueItem {
  const now = new Date().toISOString();

  return {
    id: `${entityType}:${entityId}`,
    entityType,
    entityId,
    operation: "upsert",
    status: "pending",
    attemptCount: 0,
    createdAt: now,
    lastAttemptAt: null,
    lastError: null,
  };
}

function createSyncMetadata(
  entityType: LocalSyncMetadata["entityType"],
  entityId: string
): LocalSyncMetadata {
  return {
    entityType,
    entityId,
    status: "pending",
    lastSyncedAt: null,
    lastError: null,
  };
}

/**
 * Saves a memory and its sync queue entry in one transaction.
 * If saving fails, neither change is committed.
 */
export async function saveMemory(memory: Memory): Promise<void> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(
    [STORES.memories, STORES.syncQueue, STORES.syncMetadata],
    "readwrite"
  );
  const done = transactionDone(transaction);

  transaction.objectStore(STORES.memories).put(memory);
  transaction
    .objectStore(STORES.syncQueue)
    .put(createQueueItem("memory", memory.id));
  transaction
    .objectStore(STORES.syncMetadata)
    .put(createSyncMetadata("memory", memory.id), `memory:${memory.id}`);

  await done;
}

export async function getMemory(id: string): Promise<Memory | undefined> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.memories, "readonly");
  return requestResult(
    transaction.objectStore(STORES.memories).get(id)
  ) as Promise<Memory | undefined>;
}

export async function getAllMemories(): Promise<Memory[]> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.memories, "readonly");
  return requestResult(
    transaction.objectStore(STORES.memories).getAll()
  ) as Promise<Memory[]>;
}

/** Saves a visit without affecting any memories linked to it. */
export async function saveVisit(visit: Visit): Promise<void> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(
    [STORES.visits, STORES.syncQueue, STORES.syncMetadata],
    "readwrite"
  );
  const done = transactionDone(transaction);

  transaction.objectStore(STORES.visits).put(visit);
  transaction
    .objectStore(STORES.syncQueue)
    .put(createQueueItem("visit", visit.id));
  transaction
    .objectStore(STORES.syncMetadata)
    .put(createSyncMetadata("visit", visit.id), `visit:${visit.id}`);

  await done;
}

export async function getAllVisits(): Promise<Visit[]> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.visits, "readonly");
  return requestResult(
    transaction.objectStore(STORES.visits).getAll()
  ) as Promise<Visit[]>;
}

export async function saveNote(note: MemoryNote): Promise<void> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(
    [STORES.notes, STORES.syncQueue, STORES.syncMetadata],
    "readwrite"
  );
  const done = transactionDone(transaction);

  transaction.objectStore(STORES.notes).put(note);
  transaction
    .objectStore(STORES.syncQueue)
    .put(createQueueItem("note", note.id));
  transaction
    .objectStore(STORES.syncMetadata)
    .put(createSyncMetadata("note", note.id), `note:${note.id}`);

  await done;
}

export async function getNotesForMemory(
  memoryId: string
): Promise<MemoryNote[]> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.notes, "readonly");
  const index = transaction.objectStore(STORES.notes).index("by-memory");

  return requestResult(index.getAll(memoryId)) as Promise<MemoryNote[]>;
}

/**
 * Saves photo metadata and the original image Blob together.
 * The photo is not considered safely saved unless both are committed.
 */
export async function savePhoto(
  photo: MemoryPhoto,
  blob: Blob
): Promise<void> {
  const asset: LocalPhotoAsset = {
    photoId: photo.id,
    blob,
    savedAt: new Date().toISOString(),
  };

  const db = await openMemoryDatabase();
  const transaction = db.transaction(
    [
      STORES.photos,
      STORES.photoAssets,
      STORES.syncQueue,
      STORES.syncMetadata,
    ],
    "readwrite"
  );
  const done = transactionDone(transaction);

  transaction.objectStore(STORES.photos).put(photo);
  transaction.objectStore(STORES.photoAssets).put(asset);
  transaction
    .objectStore(STORES.syncQueue)
    .put(createQueueItem("photo", photo.id));
  transaction
    .objectStore(STORES.syncMetadata)
    .put(createSyncMetadata("photo", photo.id), `photo:${photo.id}`);

  await done;
}

export async function getPhotosForMemory(
  memoryId: string
): Promise<MemoryPhoto[]> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.photos, "readonly");
  const index = transaction.objectStore(STORES.photos).index("by-memory");

  return requestResult(index.getAll(memoryId)) as Promise<MemoryPhoto[]>;
}

export async function getLocalPhotoAsset(
  photoId: string
): Promise<LocalPhotoAsset | undefined> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.photoAssets, "readonly");

  return requestResult(
    transaction.objectStore(STORES.photoAssets).get(photoId)
  ) as Promise<LocalPhotoAsset | undefined>;
}

/** Returns work waiting for cloud synchronization. */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.syncQueue, "readonly");
  const index = transaction.objectStore(STORES.syncQueue).index("by-status");

  return requestResult(
    index.getAll("pending")
  ) as Promise<SyncQueueItem[]>;
}

/** Reads the synchronization status for one record. */
export async function getSyncMetadata(
  entityType: LocalSyncMetadata["entityType"],
  entityId: string
): Promise<LocalSyncMetadata | undefined> {
  const db = await openMemoryDatabase();
  const transaction = db.transaction(STORES.syncMetadata, "readonly");

  return requestResult(
    transaction
      .objectStore(STORES.syncMetadata)
      .get(`${entityType}:${entityId}`)
  ) as Promise<LocalSyncMetadata | undefined>;
}
