import { placeCategories } from "../data/placeCategories";
import {
  resolveFilters,
  reverseMap,
  subcategoryColors,
  generateColors,
  generateReverseMapping
} from "../data/placeFilters";

// ---------------------------------------------
// INITIALIZE COLOR + REVERSE MAPPING ONCE
// ---------------------------------------------

generateColors(placeCategories);
generateReverseMapping();

// ---------------------------------------------
// TYPES
// ---------------------------------------------

export interface ApiPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  categories: string[];
}

export interface InfoMapPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  subcategoryId: string;
  color: string;
}

// ---------------------------------------------
// GEOAPIFY REQUEST
// ---------------------------------------------

const GEOAPIFY_URL = "https://api.geoapify.com/v2/places";

const fetchPlaces = async (
  lat: number,
  lon: number,
  filters: string[]
): Promise<ApiPlace[]> => {
  const params = new URLSearchParams({
    categories: filters.join(","),
    filter: `circle:${lon},${lat},50000`,
    limit: "50",
    apiKey: import.meta.env.VITE_GEOAPIFY_KEY
  });

  const url = `${GEOAPIFY_URL}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) return [];

  const data = await res.json();

  return (data.features || []).map((f: any) => ({
    id: f.properties.place_id,
    name: f.properties.name || "Unnamed",
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    categories: f.properties.categories || []
  }));
};

// ---------------------------------------------
// HYBRID SEARCH (strict → fallback)
// ---------------------------------------------

const hybridSearch = async (
  lat: number,
  lon: number,
  itemId: string
): Promise<ApiPlace[]> => {
  const { strict, fallback } = resolveFilters(itemId);

  // 1) Try strict filters
  const strictResults = await fetchPlaces(lat, lon, strict);
  if (strictResults.length > 0) return strictResults;

  // 2) Try fallback filters
  return fetchPlaces(lat, lon, fallback);
};

// ---------------------------------------------
// REVERSE MAP API RESULT → SUBCATEGORY
// ---------------------------------------------

const detectSubcategory = (categories: string[]): string => {
  for (const c of categories) {
    if (reverseMap[c]) return reverseMap[c];
  }
  return "unknown";
};

// ---------------------------------------------
// PUBLIC API: SEARCH BY ITEM ID
// ---------------------------------------------

export const searchPlacesByItem = async (
  lat: number,
  lon: number,
  itemId: string
): Promise<InfoMapPlace[]> => {
  const results = await hybridSearch(lat, lon, itemId);

  return results.map((p) => {
    const subcategoryId = detectSubcategory(p.categories);
    const color = subcategoryColors[subcategoryId] || "#888";

    return {
      id: p.id,
      name: p.name,
      lat: p.lat,
      lon: p.lon,
      subcategoryId,
      color
    };
  });
};
