
import type {
  HistoricalWeather,
  InfoMapPlaceLink,
  Memory,
  MemoryLocation,
  MemoryNote,
  MemoryPhoto,
  Visit,
} from "./types";

import {
  createLocalId,
  getAllMemories,
  getAllVisits,
  getLocalPhotoAsset,
  getMemory,
  getNotesForMemory,
  getPendingSyncItems,
  getPhotosForMemory,
  getSyncMetadata,
  saveMemory,
  saveNote,
  savePhoto,
  saveVisit,
} from "./memoryDatabase";

const now = () => new Date().toISOString();

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty.`);
  }
}

// --------------------------------------------------
// MEMORIES
// --------------------------------------------------

export interface CreateMemoryInput {
  title: string;
  location: MemoryLocation;
  capturedAt: string;
  ownerId?: string | null;
  timeZone?: string | null;
  visitId?: string | null;
  infoMapPlace?: InfoMapPlaceLink | null;
  weather?: HistoricalWeather | null;
}

export type UpdateMemoryInput = Partial<
  Pick<
    Memory,
    | "title"
    | "location"
    | "capturedAt"
    | "timeZone"
    | "visitId"
    | "infoMapPlace"
    | "weather"
  >
>;

export async function createMemory(
  input: CreateMemoryInput
): Promise<Memory> {
  requireText(input.title, "Memory title");

  const timestamp = now();

  const memory: Memory = {
    id: createLocalId(),
    ownerId: input.ownerId ?? null,
    title: input.title.trim(),
    location: input.location,
    capturedAt: input.capturedAt,
    timeZone: input.timeZone ?? null,
    visitId: input.visitId ?? null,
    infoMapPlace: input.infoMapPlace ?? null,
    weather: input.weather ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
    deletedAt: null,
  };

  await saveMemory(memory);
  return memory;
}

export async function getMemoryById(
  id: string,
  includeDeleted = false
): Promise<Memory | undefined> {
  const memory = await getMemory(id);

  if (!memory || (!includeDeleted && memory.deletedAt !== null)) {
    return undefined;
  }

  return memory;
}

export async function getMemories(
  includeDeleted = false
): Promise<Memory[]> {
  const memories = await getAllMemories();

  return includeDeleted
    ? memories
    : memories.filter((memory) => memory.deletedAt === null);
}

export async function updateMemory(
  id: string,
  changes: UpdateMemoryInput
): Promise<Memory> {
  const existing = await getMemoryById(id);

  if (!existing) {
    throw new Error(`Memory "${id}" was not found.`);
  }

  const updated: Memory = {
    ...existing,
    ...changes,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: now(),
    revision: existing.revision + 1,
    deletedAt: existing.deletedAt,
  };

  if (changes.title !== undefined) {
    requireText(changes.title, "Memory title");
    updated.title = changes.title.trim();
  }

  await saveMemory(updated);
  return updated;
}

/**
 * Soft deletion preserves the record for recovery and synchronization.
 * It does not physically remove the memory or its photos.
 */
export async function deleteMemory(id: string): Promise<Memory> {
  const existing = await getMemoryById(id);

  if (!existing) {
    throw new Error(`Memory "${id}" was not found.`);
  }

  const deleted: Memory = {
    ...existing,
    deletedAt: now(),
    updatedAt: now(),
    revision: existing.revision + 1,
  };

  await saveMemory(deleted);
  return deleted;
}

export async function restoreMemory(id: string): Promise<Memory> {
  const existing = await getMemory(id);

  if (!existing || existing.deletedAt === null) {
    throw new Error(`Deleted memory "${id}" was not found.`);
  }

  const restored: Memory = {
    ...existing,
    deletedAt: null,
    updatedAt: now(),
    revision: existing.revision + 1,
  };

  await saveMemory(restored);
  return restored;
}

// --------------------------------------------------
// VISITS
// --------------------------------------------------

export interface CreateVisitInput {
  title: string;
  ownerId?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export type UpdateVisitInput = Partial<
  Pick<Visit, "title" | "description" | "startDate" | "endDate">
>;

export async function createVisit(
  input: CreateVisitInput
): Promise<Visit> {
  requireText(input.title, "Visit title");

  const timestamp = now();

  const visit: Visit = {
    id: createLocalId(),
    ownerId: input.ownerId ?? null,
    title: input.title.trim(),
    description: input.description ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
    deletedAt: null,
  };

  await saveVisit(visit);
  return visit;
}

export async function getVisits(
  includeDeleted = false
): Promise<Visit[]> {
  const visits = await getAllVisits();

  return includeDeleted
    ? visits
    : visits.filter((visit) => visit.deletedAt === null);
}

export async function updateVisit(
  id: string,
  changes: UpdateVisitInput
): Promise<Visit> {
  const visits = await getAllVisits();
  const existing = visits.find(
    (visit) => visit.id === id && visit.deletedAt === null
  );

  if (!existing) {
    throw new Error(`Visit "${id}" was not found.`);
  }

  const updated: Visit = {
    ...existing,
    ...changes,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: now(),
    revision: existing.revision + 1,
    deletedAt: existing.deletedAt,
  };

  if (changes.title !== undefined) {
    requireText(changes.title, "Visit title");
    updated.title = changes.title.trim();
  }

  await saveVisit(updated);
  return updated;
}

/**
 * Unassigns memories before soft-deleting their visit.
 * Memories remain independent records.
 */
export async function deleteVisit(id: string): Promise<Visit> {
  const visits = await getAllVisits();
  const existing = visits.find(
    (visit) => visit.id === id && visit.deletedAt === null
  );

  if (!existing) {
    throw new Error(`Visit "${id}" was not found.`);
  }

  const memories = await getAllMemories();
  const linkedMemories = memories.filter(
    (memory) => memory.visitId === id
  );

  for (const memory of linkedMemories) {
    await saveMemory({
      ...memory,
      visitId: null,
      updatedAt: now(),
      revision: memory.revision + 1,
    });
  }

  const deleted: Visit = {
    ...existing,
    deletedAt: now(),
    updatedAt: now(),
    revision: existing.revision + 1,
  };

  await saveVisit(deleted);
  return deleted;
}

// --------------------------------------------------
// NOTES
// --------------------------------------------------

export async function createNote(
  memoryId: string,
  content: string
): Promise<MemoryNote> {
  if (!await getMemoryById(memoryId)) {
    throw new Error(`Memory "${memoryId}" was not found.`);
  }

  requireText(content, "Note");

  const timestamp = now();

  const note: MemoryNote = {
    id: createLocalId(),
    memoryId,
    content: content.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };

  await saveNote(note);
  return note;
}

export async function getMemoryNotes(
  memoryId: string,
  includeDeleted = false
): Promise<MemoryNote[]> {
  const notes = await getNotesForMemory(memoryId);

  return includeDeleted
    ? notes
    : notes.filter((note) => note.deletedAt === null);
}

export async function updateNote(
  id: string,
  content: string
): Promise<MemoryNote> {
  requireText(content, "Note");

  const memories = await getAllMemories();

  // Find the note through its memory relationship.
  for (const memory of memories) {
    const notes = await getNotesForMemory(memory.id);
    const existing = notes.find(
      (note) => note.id === id && note.deletedAt === null
    );

    if (existing) {
      const updated: MemoryNote = {
        ...existing,
        content: content.trim(),
        updatedAt: now(),
      };

      await saveNote(updated);
      return updated;
    }
  }

  throw new Error(`Note "${id}" was not found.`);
}

export async function deleteNote(id: string): Promise<MemoryNote> {
  const memories = await getAllMemories();

  for (const memory of memories) {
    const notes = await getNotesForMemory(memory.id);
    const existing = notes.find(
      (note) => note.id === id && note.deletedAt === null
    );

    if (existing) {
      const deleted: MemoryNote = {
        ...existing,
        deletedAt: now(),
        updatedAt: now(),
      };

      await saveNote(deleted);
      return deleted;
    }
  }

  throw new Error(`Note "${id}" was not found.`);
}

// --------------------------------------------------
// PHOTOS
// --------------------------------------------------

export interface AddPhotoOptions {
  capturedAt?: string | null;
  caption?: string | null;
  sortOrder?: number;
}

export async function addPhoto(
  memoryId: string,
  file: File,
  options: AddPhotoOptions = {}
): Promise<MemoryPhoto> {
  if (!await getMemoryById(memoryId)) {
    throw new Error(`Memory "${memoryId}" was not found.`);
  }

  const photo: MemoryPhoto = {
    id: createLocalId(),
    memoryId,
    originalFileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    capturedAt: options.capturedAt ?? null,
    addedAt: now(),
    caption: options.caption ?? null,
    sortOrder: options.sortOrder ?? 0,
    storageKey: null,
    uploadStatus: "local-only",
    deletedAt: null,
  };

  await savePhoto(photo, file);
  return photo;
}

export async function getMemoryPhotos(
  memoryId: string,
  includeDeleted = false
): Promise<MemoryPhoto[]> {
  const photos = await getPhotosForMemory(memoryId);

  return includeDeleted
    ? photos
    : photos.filter((photo) => photo.deletedAt === null);
}

export async function updatePhoto(
  id: string,
  changes: Partial<
    Pick<MemoryPhoto, "caption" | "capturedAt" | "sortOrder">
  >
): Promise<MemoryPhoto> {
  const memories = await getAllMemories();

  for (const memory of memories) {
    const photos = await getPhotosForMemory(memory.id);
    const existing = photos.find(
      (photo) => photo.id === id && photo.deletedAt === null
    );

    if (existing) {
      const asset = await getLocalPhotoAsset(id);

      if (!asset) {
        throw new Error(
          `The original local image for photo "${id}" is unavailable.`
        );
      }

      const updated: MemoryPhoto = {
        ...existing,
        ...changes,
      };

      await savePhoto(updated, asset.blob);
      return updated;
    }
  }

  throw new Error(`Photo "${id}" was not found.`);
}

export async function deletePhoto(id: string): Promise<MemoryPhoto> {
  const memories = await getAllMemories();

  for (const memory of memories) {
    const photos = await getPhotosForMemory(memory.id);
    const existing = photos.find(
      (photo) => photo.id === id && photo.deletedAt === null
    );

    if (existing) {
      const asset = await getLocalPhotoAsset(id);

      if (!asset) {
        throw new Error(
          `The original local image for photo "${id}" is unavailable.`
        );
      }

      const deleted: MemoryPhoto = {
        ...existing,
        deletedAt: now(),
      };

      // Keep the original Blob until cloud synchronization and
      // backup handling are implemented.
      await savePhoto(deleted, asset.blob);
      return deleted;
    }
  }

  throw new Error(`Photo "${id}" was not found.`);
}

// --------------------------------------------------
// SYNCHRONIZATION STATUS
// --------------------------------------------------

export { getPendingSyncItems, getSyncMetadata };
