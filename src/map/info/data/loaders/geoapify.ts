import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

const BASE_URL = "https://api.geoapify.com/v2/places";

// Categories we want to fetch
const CATEGORIES = [
  "tourism.attraction",
  "tourism.sights",
  "tourism.museum",
  "leisure.park",
  "natural",
  "sport",
  "entertainment",
];

// API key (set later)
let GEOAPIFY_KEY: string | null = null;

export function setGeoapifyApiKey(key: string) {
  GEOAPIFY_KEY = key;
}

// Helper: fetch JSON safely
async function safeFetch(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Helper: calculate distance (Haversine)
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Simple rating generator (always a number)
function computeRating(categories: string[]): number {
  if (categories.some(c => c.includes("museum"))) return 4.4;
  if (categories.some(c => c.includes("attraction"))) return 4.5;
  if (categories.some(c => c.includes("sights"))) return 4.6;
  if (categories.some(c => c.includes("park"))) return 4.3;
  if (categories.some(c => c.includes("natural"))) return 4.4;
  if (categories.some(c => c.includes("entertainment"))) return 4.2;
  return 4.0;
}

// Normalize Geoapify → InfoPlace
function normalize(item: any, center: LoaderParams): InfoPlace {
  const props = item.properties ?? {};
  const lat = props.lat ?? 0;
  const lon = props.lon ?? 0;
  const cats = props.categories ?? [];

  return {
    id: props.place_id ?? crypto.randomUUID(),
    name: props.name ?? "Unknown place",
    category: "attraction",
    latitude: lat,
    longitude: lon,
    description: props.datasource?.raw?.wikipedia_extract ?? undefined,
    image: props.datasource?.raw?.image ?? undefined,
    url: props.datasource?.raw?.wikipedia ?? undefined,
    tags: cats,
    rating: computeRating(cats), // always a number
    source: "Geoapify",
    distance: distanceKm(center.latitude, center.longitude, lat, lon),
  };
}

// Fetch places around a point
async function fetchNearby(params: LoaderParams) {
  if (!GEOAPIFY_KEY) return [];

  const { latitude, longitude, radiusKm } = params;

  const url =
    `${BASE_URL}?` +
    `categories=${CATEGORIES.join(",")}` +
    `&filter=circle:${longitude},${latitude},${radiusKm * 1000}` +
    `&bias=proximity:${longitude},${latitude}` +
    `&limit=50` +
    `&apiKey=${GEOAPIFY_KEY}`;

  const data = await safeFetch(url);
  return Array.isArray(data?.features) ? data.features : [];
}

// Main loader
export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  if (!GEOAPIFY_KEY) return [];

  const nearby = await fetchNearby(params);

  return nearby.map((item: any) => normalize(item, params));
}
