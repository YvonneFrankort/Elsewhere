
import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

function normalizeVisitorCenter(vc: any): Feature<Point> {
  const images = Array.isArray(vc.images) ? vc.images : [];

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

      // General information
      description: vc.description,
      url: vc.url,

      // Directions and address
      directionsInfo: vc.directionsInfo,
      directionsUrl: vc.directionsUrl,
      addresses: vc.addresses,

      // Contact information
      contacts: vc.contacts,

      // Visiting information
      operatingHours: vc.operatingHours,

      // Images
      images,
      imageUrl: images[0]?.url ?? null
    }
  };
}

export async function loadVisitorCenters(
  params: LoaderParams
): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS visitor centers: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = new URL(
    "https://developer.nps.gov/api/v1/visitorcenters"
  );

  url.searchParams.set("stateCode", state);
  url.searchParams.set("limit", "500");
  url.searchParams.set("fields", "images");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": key
      }
    });

    if (!res.ok) {
      throw new Error(
        `NPS visitor centers request failed: ${res.status}`
      );
    }

    const json = await res.json();

    if (!Array.isArray(json.data)) {
      console.warn("NPS visitor centers: unexpected response", json);
      return [];
    }

    return json.data
      .filter((vc: any) => {
        const lat = Number(vc.latitude);
        const lon = Number(vc.longitude);

        return (
          vc.latitude !== null &&
          vc.latitude !== undefined &&
          vc.longitude !== null &&
          vc.longitude !== undefined &&
          Number.isFinite(lat) &&
          Number.isFinite(lon)
        );
      })
      .map(normalizeVisitorCenter);

  } catch (err) {
    console.warn("NPS visitor centers failed:", err);
    return [];
  }
}
