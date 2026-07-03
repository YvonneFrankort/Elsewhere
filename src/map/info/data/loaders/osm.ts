import type { Feature } from "geojson";
import type { LoaderParams } from "./types";

// ---------------------------------------------
// Category → Folder mapping (OSM ONLY)
// ---------------------------------------------
const categoryToFolder: Record<string, string> = {
  // water
  "lakes": "water",
  "rivers": "water",
  "waterfalls": "water",
  "beaches": "water",

  // trails
  "hiking": "trails",
  "trailheads": "trails",
  "climbing-areas": "trails",
  "ski": "trails",

  // mountains & nature scenic
  "mountain-peaks": "mountains",
  "canyons": "mountains",
  "caves": "mountains",
  "forests": "mountains",
  "desert": "mountains",
  "islands": "mountains",
  "mountains": "mountains",


  // nature scenic (OSM only)
  "scenic-routes": "scenic",

  // protected
  "national-parks": "protected",
  "nature-reserves": "protected",
  "wilderness": "protected",

  // wildlife
  "wildlife-parks": "wildlife"
};

// ---------------------------------------------
// 1. Haversine distance
// ---------------------------------------------
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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
// 2. Check if ANY geometry is inside radius
// ---------------------------------------------
function isInsideRadius(feature: any, center: [number, number], radiusKm: number) {
  const [cx, cy] = center;
  const coords = feature.geometry.coordinates;

  switch (feature.geometry.type) {
    case "Point": {
      const [lon, lat] = coords;
      return haversineDistance(lat, lon, cy, cx) <= radiusKm;
    }

    case "LineString": {
      return coords.some(([lon, lat]: [number, number]) =>
        haversineDistance(lat, lon, cy, cx) <= radiusKm
      );
    }

    case "Polygon": {
      return coords[0].some(([lon, lat]: [number, number]) =>
        haversineDistance(lat, lon, cy, cx) <= radiusKm
      );
    }

    default:
      return false;
  }
}

// ---------------------------------------------
// 3. Load + filter OSM categories (with group folders)
// ---------------------------------------------
export async function load(
  params: LoaderParams,
  state: string,
  categories: string[]
): Promise<Feature[]> {

  const { latitude, longitude } = params;
  const center: [number, number] = [longitude, latitude];
  const radiusKm = params.radiusKm ?? 50;

  const allFeatures: Feature[] = [];

  for (const cat of categories) {
    const folder = categoryToFolder[cat];

    if (!folder) {
      console.warn(`⚠️ No OSM folder mapping for category '${cat}'`);
      continue;
    }

    const url = `/data/osm/${state}/${folder}/${cat}.geojson`;

    try {
      const res = await fetch(url);
      const geojson = await res.json();

      const filtered = geojson.features.filter((f: any) =>
        isInsideRadius(f, center, radiusKm)
      );

      allFeatures.push(...filtered);

    } catch (err) {
      console.warn(`⚠️ Failed to load ${cat} from ${url}`, err);
    }
  }

  return allFeatures;
}
