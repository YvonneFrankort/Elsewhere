import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

function normalizeTrail(p: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(p.longitude),
        Number(p.latitude)
      ]
    },
    properties: {
      id: p.id,
      name: p.title,
      category: "trails",
      source: "nps",
      parkCode: p.parkCode,
      description: p.listingDescription,
      difficulty: p.difficultyLevel,
      length_km: p.distance,
      routeType: p.routeType,
      activities: p.activities,
      images: p.images
    }
  };
}

export async function loadTrails(
  params: LoaderParams
): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;
  if (!key) return [];

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = `https://developer.nps.gov/api/v1/places?stateCode=${state}&limit=500&api_key=${key}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return json.data
      .filter((p: any) =>
        p.placeType === "Trail" &&
        p.latitude &&
        p.longitude
      )
      .map(normalizeTrail);

  } catch (err) {
    console.warn("⚠️ NPS trails failed:", err);
    return [];
  }
}
