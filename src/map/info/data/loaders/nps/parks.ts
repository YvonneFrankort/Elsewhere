
import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

// --- Category Resolution -----------------------------------------------------

function resolveNPSCategory(designation: string = ""): string {
  const d = designation.toLowerCase();

  if (d.includes("historic")) return "national_historic_site";
  if (d.includes("monument")) return "national_monument";
  if (d.includes("preserve")) return "national_preserve";
  if (d.includes("recreation")) return "national_recreation_area";
  if (d.includes("seashore")) return "national_seashore";
  if (d.includes("lakeshore")) return "national_lakeshore";
  if (d.includes("river")) return "national_river";
  if (d.includes("park")) return "national_park";

  return "national_park";
}

// --- Normalization -----------------------------------------------------------

function normalizeNPSPark(p: any): Feature<Point> {
  const images = Array.isArray(p.images) ? p.images : [];

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
      // Existing identifiers
      id: p.id,
      parkCode: p.parkCode,
      name: p.fullName,
      category: resolveNPSCategory(p.designation),
      source: "nps",

      // General information
      description: p.description,
      designation: p.designation,
      states: p.states,

      // Directions and location
      directionsInfo: p.directionsInfo,
      directionsUrl: p.directionsUrl,
      addresses: p.addresses,

      // Contact information
      contacts: p.contacts,
      parkSuperintendent: p.parkSuperintendent,
      pressEmail: p.pressEmail,

      // Visiting information
      operatingHours: p.operatingHours,
      entranceFees: p.entranceFees,
      weatherInfo: p.weatherInfo,

      // Things to explore
      activities: p.activities,
      topics: p.topics,

      // Images
      images,
      imageUrl: images[0]?.url ?? null,

      // Official NPS website
      url: p.url
    }
  };
}

// --- Loader ------------------------------------------------------------------

export async function loadParks(
  params: LoaderParams
): Promise<Feature<Point>[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS parks: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = new URL("https://developer.nps.gov/api/v1/parks");

  url.searchParams.set("stateCode", state);
  url.searchParams.set("limit", "500");

  // Request park images in addition to the default response fields
  url.searchParams.set("fields", "images");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": key
      }
    });

    if (!res.ok) {
      throw new Error(`NPS parks request failed: ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.data)) {
      console.warn("NPS parks: unexpected API response", json);
      return [];
    }

    return json.data
      .filter((p: any) => {
        const lat = Number(p.latitude);
        const lon = Number(p.longitude);

        return (
          p.latitude !== null &&
          p.latitude !== undefined &&
          p.longitude !== null &&
          p.longitude !== undefined &&
          Number.isFinite(lat) &&
          Number.isFinite(lon)
        );
      })
      .map(normalizeNPSPark);

  } catch (err) {
    console.warn("NPS parks failed:", err);
    return [];
  }
}
