import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon"; // ← updated import

function normalizeAlert(a: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(a.longitude),
        Number(a.latitude)
      ]
    },
    properties: {
      id: a.id,
      name: a.title,
      category: "alert",
      source: "nps",
      parkCode: a.parkCode,
      description: a.description,
      url: a.url,
      type: a.type
    }
  };
}

export async function loadAlerts(params: LoaderParams): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;
  if (!key) return [];

  // Use local bounding-box state detection
  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = `https://developer.nps.gov/api/v1/alerts?stateCode=${state}&limit=500&api_key=${key}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return json.data
      .filter((a: any) => a.latitude && a.longitude)
      .map(normalizeAlert);

  } catch (err) {
    console.warn("⚠️ NPS alerts failed:", err);
    return [];
  }
}
