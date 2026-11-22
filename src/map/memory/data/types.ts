/**
 * Core data contracts for the Memory Map.
 *
 * These types describe the portable memory archive. Browser-only sync details
 * are kept in separate local-storage records so they do not become part of the
 * permanent memory data exported to another system.
 */

/** Coordinates are always stored as named longitude/latitude values. */
export interface MemoryCoordinates {
  longitude: number;
  latitude: number;
}

export interface MemoryLocation {
  coordinates: MemoryCoordinates;
  /** A human-readable label, when one is known. */
  label?: string | null;
  /** GPS accuracy in metres, when supplied by the device. */
  accuracyMeters?: number | null;
}

/** A snapshot of historical weather saved with the memory. */
export interface HistoricalWeather {
  provider: string;
  retrievedAt: string;
  observedAt: string;
  temperatureC?: number | null;
  feelsLikeC?: number | null;
  conditionCode?: string | null;
  description?: string | null;
  precipitationMm?: number | null;
  windSpeedKmh?: number | null;
  humidityPercent?: number | null;
}

/** Optional reference to a place in the existing Info Map. */
export interface InfoMapPlaceLink {
  source: "info-map";
  placeId: string;
  /** Preserve the displayed name if the source place later changes. */
  nameSnapshot: string;
  category?: string | null;
}

/**
 * One independently editable point on the Memory Map.
 * A memory may exist without a visit or an Info Map place link.
 */

export interface Memory {
  id: string;
  /** Null until the memory is associated with an authenticated account. */
  ownerId: string | null;
  title: string;
  location: MemoryLocation;
  /** ISO 8601 date-time including an offset when known. */
  capturedAt: string;
  /** IANA timezone, e.g. "Europe/Helsinki", when known. */
  timeZone?: string | null;
  /** Optional grouping. Removing a visit must not remove its memories. */
  visitId: string | null;
  /** Optional connection to a place in the Explorer / Info Map. */
  infoMapPlace?: InfoMapPlaceLink | null;
  /** Historical conditions are stored, not fetched on every map open. */
  weather?: HistoricalWeather | null;
  createdAt: string;
  updatedAt: string;
  /** Incremented when this record is changed locally. */
  revision: number;
  /** Soft deletion timestamp; null means the memory is active. */
  deletedAt: string | null;
}

/** Notes are separate records so reflections can be added over time. */
export interface MemoryNote {
  id: string;
  memoryId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type PhotoUploadStatus = "local-only" | "pending" | "uploaded" | "failed";

/** Photo metadata. The actual image Blob is stored separately in IndexedDB. */
export interface MemoryPhoto {
  id: string;
  memoryId: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Original capture time from EXIF or file metadata, if available. */
  capturedAt: string | null;
  addedAt: string;
  caption: string | null;
  sortOrder: number;
  /** Cloudflare R2 object key; null until uploaded. */
  storageKey: string | null;
  uploadStatus: PhotoUploadStatus;
  deletedAt: string | null;
}

/** Optional grouping for memories. A visit is not required to create one. */
export interface Visit {
  id: string;
  /** Null until associated with an authenticated account. */
  ownerId: string | null;
  title: string;
  description?: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  revision: number;
  deletedAt: string | null;
}

/** Local-only synchronization state; not part of the portable archive. */
export type SyncStatus = "local-only" | "pending" | "synced" | "conflict" | "failed";

export interface LocalSyncMetadata {
  entityType: "memory" | "visit" | "note" | "photo";
  entityId: string;
  status: SyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
}

/** Work waiting to be sent to the cloud when connectivity is available. */
export interface SyncQueueItem {
  id: string;
  entityType: "memory" | "visit" | "note" | "photo";
  entityId: string;
  operation: "upsert" | "delete";
  status: "pending" | "processing" | "failed";
  attemptCount: number;
  createdAt: string;
  lastAttemptAt: string | null;
  lastError: string | null;
}

/** Binary photo data is stored in its own IndexedDB object store. */
export interface LocalPhotoAsset {
  photoId: string;
  blob: Blob;
  savedAt: string;
}

/** Current local archive schema version, used for future migrations. */
export const MEMORY_SCHEMA_VERSION = 1;
