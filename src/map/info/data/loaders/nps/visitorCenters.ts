import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon"; // ← updated import

function normalizeVisitorCenter(vc: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(vc.longitude),
        Number(vc.latitude)
      ]
    },
    properties: {
      id: vc.id,
      name: vc.name,
      category: "visitor_center",
      source: "nps",
      parkCode: vc.parkCode,
      description: vc.description,
      url: vc.url
    }
  };
}

export async function loadVisitorCenters(
  params: LoaderParams
): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;
  if (!key) return [];

  // Local bounding-box state detection (sync)
  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = `https://developer.nps.gov/api/v1/visitorcenters?stateCode=${state}&limit=500&api_key=${key}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return json.data
      .filter((vc: any) => vc.latitude && vc.longitude)
      .map(normalizeVisitorCenter);

  } catch (err) {
    console.warn("⚠️ NPS visitor centers failed:", err);
    return [];
  }
}
