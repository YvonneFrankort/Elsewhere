export interface MemoryStorageStatus {
  persistent: boolean | null;
  usageBytes: number | null;
  quotaBytes: number | null;
  usagePercent: number | null;
  supported: boolean;
}

function getStorageManager(): StorageManager | null {
  if (typeof navigator === "undefined" || !navigator.storage) {
    return null;
  }

  return navigator.storage;
}

/**
 * Ask the browser to protect this site's stored data from automatic eviction.
 * The browser decides whether to grant the request.
 */
export async function requestPersistentMemoryStorage(): Promise<boolean | null> {
  const storage = getStorageManager();

  if (!storage?.persist) {
    return null;
  }

  try {
    const alreadyPersistent = await storage.persisted();

    if (alreadyPersistent) {
      return true;
    }

    return await storage.persist();
  } catch (error) {
    console.error("Could not request persistent storage:", error);
    return false;
  }
}

/**
 * Read the browser's current storage usage and available quota.
 */
export async function getMemoryStorageStatus(): Promise<MemoryStorageStatus> {
  const storage = getStorageManager();

  if (!storage?.estimate || !storage.persisted) {
    return {
      persistent: null,
      usageBytes: null,
      quotaBytes: null,
      usagePercent: null,
      supported: false,
    };
  }

  try {
    const [persistent, estimate] = await Promise.all([
      storage.persisted(),
      storage.estimate(),
    ]);

    const usageBytes = estimate.usage ?? null;
    const quotaBytes = estimate.quota ?? null;

    const usagePercent =
      usageBytes !== null && quotaBytes !== null && quotaBytes > 0
        ? (usageBytes / quotaBytes) * 100
        : null;

    return {
      persistent,
      usageBytes,
      quotaBytes,
      usagePercent,
      supported: true,
    };
  } catch (error) {
    console.error("Could not read browser storage status:", error);

    return {
      persistent: null,
      usageBytes: null,
      quotaBytes: null,
      usagePercent: null,
      supported: false,
    };
  }
}