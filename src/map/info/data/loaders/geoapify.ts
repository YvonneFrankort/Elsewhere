import type { Feature, Point } from "geojson";
import type { LoaderParams } from "./types";

import { geoapifyFilters } from "../filters/geoapifyFilters";
import { FALLBACK_WHITELIST } from "../filters/fallbackWhitelist";

import { nominatimFilters } from "../filters/nominatimFilters";
import { loadFromNominatim } from "./nominatim";

import { dedupe } from "../../utils/dedupe";

const BASE_URL = "https://api.geoapify.com/v2/places";
const MAX_CATEGORIES_PER_REQUEST = 1;

export async function load(
  params: LoaderParams,
  categories: string[]
): Promise<Feature<Point>[]> {

  const mapped = categories.flatMap(cat => geoapifyFilters[cat] ?? []);
  const unique = [...new Set(mapped)];

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += MAX_CATEGORIES_PER_REQUEST) {
    chunks.push(unique.slice(i, i + MAX_CATEGORIES_PER_REQUEST));
  }

  const allResults: Feature<Point>[] = [];
  for (const chunk of chunks) {
    if (chunk.length === 0) continue;
    const results = await fetchPlaces(params, chunk);
    allResults.push(...results);
  }

  if (allResults.length > 0) {
    console.log(`[InfoMap] Geoapify returned ${allResults.length} results`);
    return dedupe(allResults);
  }

  console.log("[InfoMap] Geoapify returned 0 results → fallback activated");

  const fallbackResults: Feature<Point>[] = [];

  for (const cat of categories) {
    if (!FALLBACK_WHITELIST.has(cat)) continue;

    console.log(`[InfoMap] Fallback category: ${cat}`);

    const keyword = nominatimFilters[cat];
    if (keyword) {
      const nominatim = await loadFromNominatim(keyword, params);
      console.log(`[InfoMap] Nominatim → ${nominatim.length} results`);
      fallbackResults.push(...nominatim);
    }

    // ⭐ OpenTripMap removed completely
  }

  const final = dedupe(fallbackResults);
  console.log(`[InfoMap] Final fallback results after dedupe: ${final.length}`);

  return final;
}

async function fetchPlaces(
  params: LoaderParams,
  filters: string[]
): Promise<Feature<Point>[]> {
  const { latitude, longitude } = params;

  const url = new URL(BASE_URL);

  // Always 5 km for Geoapify (your original behavior)
  const geoapifyRadius = 5000;

  url.searchParams.set("categories", filters.join(","));
  url.searchParams.set(
    "filter",
    `circle:${longitude},${latitude},${geoapifyRadius}`
  );
  url.searchParams.set("limit", "50");
  url.searchParams.set("apiKey", import.meta.env.VITE_GEOAPIFY_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return [];
  }

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
      categories: f.properties.categories ?? [],
      source: "geoapify",
      sourcePriority: 1
    }
  }));
}
