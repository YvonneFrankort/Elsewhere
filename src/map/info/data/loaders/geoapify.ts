import type { Feature, Point } from "geojson";
import type { LoaderParams } from "./types";
import { geoapifyFilters } from "../filters/geoapifyFilters";

const BASE_URL = "https://api.geoapify.com/v2/places";

// Geoapify can only handle 1–3 categories per request
const MAX_CATEGORIES_PER_REQUEST = 1;

export async function load(
  params: LoaderParams,
  categories: string[]
): Promise<Feature<Point>[]> {

  // 1️⃣ Map UI categories → Geoapify categories
  const mapped = categories.flatMap(cat => geoapifyFilters[cat] ?? []);

  // 2️⃣ Remove duplicates
  const unique = [...new Set(mapped)];

  // 3️⃣ Split into chunks of max 3 categories
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += MAX_CATEGORIES_PER_REQUEST) {
    chunks.push(unique.slice(i, i + MAX_CATEGORIES_PER_REQUEST));
  }

  // 4️⃣ Fetch each chunk separately
  const allResults: Feature<Point>[] = [];
  for (const chunk of chunks) {
    if (chunk.length === 0) continue;
    const results = await fetchPlaces(params, chunk);
    allResults.push(...results);
  }

  return allResults;
}

async function fetchPlaces(
  params: LoaderParams,
  filters: string[]
): Promise<Feature<Point>[]> {
  const { latitude, longitude, radiusKm } = params;

  const url = new URL(BASE_URL);

  url.searchParams.set("categories", filters.join(","));
  url.searchParams.set(
    "filter",
    `circle:${longitude},${latitude},${radiusKm * 1000}`
  );
  url.searchParams.set("limit", "50");
  url.searchParams.set("apiKey", import.meta.env.VITE_GEOAPIFY_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  const features = data.features ?? [];

  return features.map((f: any) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: f.geometry.coordinates
    },
    properties: {
      id: f.properties.place_id,
      name: f.properties.name ?? "Unnamed",
      categories: f.properties.categories ?? []
    }
  }));
}
