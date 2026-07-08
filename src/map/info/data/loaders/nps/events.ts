import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon"; // ← updated import

function normalizeEvent(e: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(e.longitude),
        Number(e.latitude)
      ]
    },
    properties: {
      id: e.id,
      name: e.title,
      category: "event",
      source: "nps",
      parkCode: e.parkCode,
      description: e.description,
      url: e.url,
      dateStart: e.dateStart,
      dateEnd: e.dateEnd
    }
  };
}

export async function loadEvents(params: LoaderParams): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;
  if (!key) return [];

  // Use local bounding-box state detection (sync)
  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = `https://developer.nps.gov/api/v1/events?stateCode=${state}&limit=500&api_key=${key}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return json.data
      .filter((e: any) => e.latitude && e.longitude)
      .map(normalizeEvent);

  } catch (err) {
    console.warn("⚠️ NPS events failed:", err);
    return [];
  }
}
