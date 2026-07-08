import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon"; // ← updated import

// --- Category Resolution -----------------------------------------------------

function resolveNPSCategory(designation: string): string {
  const d = designation.toLowerCase();

  if (d.includes("park")) return "national_park";
  if (d.includes("monument")) return "national_monument";
  if (d.includes("preserve")) return "national_preserve";
  if (d.includes("historic")) return "national_historic_site";
  if (d.includes("recreation")) return "national_recreation_area";
  if (d.includes("seashore")) return "national_seashore";
  if (d.includes("river")) return "national_river";
  if (d.includes("lakeshore")) return "national_lakeshore";

  return "national_park"; // fallback
}

// --- Normalization -----------------------------------------------------------

function normalizeNPSPark(p: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(p.longitude), Number(p.latitude)]
    },
    properties: {
      id: p.id,
      name: p.fullName,
      category: resolveNPSCategory(p.designation),
      source: "nps"
    }
  };
}

// --- Loader ------------------------------------------------------------------

export async function loadParks(params: LoaderParams): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("⚠️ NPS loader: missing VITE_NPS_KEY");
    return [];
  }

  // Local bounding-box state detection (sync)
  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return []; // user outside US

  const url = `https://developer.nps.gov/api/v1/parks?stateCode=${state}&limit=500&api_key=${key}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return json.data
      .filter((p: any) => p.latitude && p.longitude)
      .map(normalizeNPSPark);

  } catch (err) {
    console.warn("⚠️ NPS loader failed:", err);
    return [];
  }
}
