import type { Feature } from "geojson";
import type { LoaderParams } from "./types";

// ---------------------------------------------
// Category → Folder mapping (CURATED)
// ---------------------------------------------
const curatedFolders: Record<string, string> = {
  // water
  waterfalls: "water",

  // mountains
  caves: "mountains",

  // scenic
  viewpoints: "scenic",

  // recreation
  "scenic-roads": "recreation",
  trailheads: "recreation",

  // protected
  "national-parks": "protected",
  "nature-reserves": "protected",
  "nature-preserves": "protected",
  "state-parks": "protected",

  // landforms
  arches: "landforms",
  cliffs: "landforms",
  gorges: "landforms",
  "natural-bridges": "landforms",
  peaks: "landforms",
  ridges: "landforms",
  "river-overlooks": "landforms",
  rockhouses: "landforms",

  // historic
  battlefields: "historic",
  "historic-sites": "historic",
  monuments: "historic",

  // transport
  "parking-garages": "transport",
  "trail-parking": "transport"
};


// ---------------------------------------------
// Haversine distance
// ---------------------------------------------
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------
// Check if feature is inside radius
// ---------------------------------------------
function insideRadius(feature: any, center: [number, number], radiusKm: number) {
  const [cx, cy] = center;
  const coords = feature.geometry.coordinates;

  if (feature.geometry.type === "Point") {
    const [lon, lat] = coords;
    return haversine(lat, lon, cy, cx) <= radiusKm;
  }

  return false;
}

// ---------------------------------------------
// CURATED loader (replacement for deleted OSM loader)
// ---------------------------------------------
export async function loadCurated(
  params: LoaderParams,
  state: string,
  categories: string[]
): Promise<Feature[]> {

  const { latitude, longitude } = params;
  const center: [number, number] = [longitude, latitude];
  const radiusKm = params.radiusKm ?? 150;

  const all: Feature[] = [];

  for (const cat of categories) {
    const folder = curatedFolders[cat];
    if (!folder) continue;

    const urls = [
      `/data/osm/ky_tn_wv/${folder}/${cat}.geojson`,
      `/data/osm/boarder/${folder}/${cat}.geojson`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        const geojson = await res.json();
        //const filtered = geojson.features.filter((f: any) =>
        //  insideRadius(f, center, radiusKm)
        //);
        const filtered = geojson.features;


        all.push(...filtered);
      } catch {
        continue;
      }
    }
  }

  try {
    const res = await fetch(`/data/osm/boarder/mixed/boarder.geojson`);
    if (res.ok) {
      const geojson = await res.json();
      all.push(...geojson.features);
    }
  } catch {}

  return all;   // ✔ Correct — return AFTER all categories + regions are processed
}
