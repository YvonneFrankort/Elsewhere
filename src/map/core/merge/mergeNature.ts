import type { Feature } from "geojson";

export function mergeNatureLayers(features: Feature[]): Feature[] {
  const seen = new Map<string, Feature>();

  for (const f of features) {
    if (!f.geometry || f.geometry.type !== "Point") continue;

    const [lon, lat] = f.geometry.coordinates;

    const key = `${lat.toFixed(5)}_${lon.toFixed(5)}`;

    if (!seen.has(key)) {
      // Ensure properties exist
      f.properties = f.properties || {};
      f.properties.tags = f.properties.tags || {};
      seen.set(key, f);
    } else {
      const existing = seen.get(key)!;

      // Ensure properties exist
      existing.properties = existing.properties || {};
      existing.properties.tags = existing.properties.tags || {};

      f.properties = f.properties || {};
      f.properties.tags = f.properties.tags || {};

      // Merge tags + properties
      existing.properties = {
        ...existing.properties,
        ...f.properties,
        tags: {
          ...existing.properties.tags,
          ...f.properties.tags
        }
      };
    }
  }

  return Array.from(seen.values());
}
