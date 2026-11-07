
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

// --- Event Data --------------------------------------------------------------

export interface NPSEvent {
  id: string;
  title: string;
  parkCode: string;
  description?: string;
  url?: string;
  dateStart?: string;
  dateEnd?: string;
  times?: any[];
  location?: string;
  types?: string[];
}

// --- Normalization ------------------------------------------------------------

function normalizeEvent(e: any): NPSEvent {
  return {
    id: e.id,
    title: e.title,
    parkCode: e.parkCode,
    description: e.description,
    url: e.url,
    dateStart: e.dateStart,
    dateEnd: e.dateEnd,
    times: e.times ?? [],
    location: e.location,
    types: e.types ?? []
  };
}

// --- Loader ------------------------------------------------------------------

export async function loadEvents(
  params: LoaderParams
): Promise<NPSEvent[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS events: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = new URL("https://developer.nps.gov/api/v1/events");

  url.searchParams.set("stateCode", state);
  url.searchParams.set("limit", "500");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": key
      }
    });

    if (!res.ok) {
      throw new Error(`NPS events request failed: ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.data)) {
      console.warn("NPS events: unexpected API response", json);
      return [];
    }

    return json.data
      .filter((e: any) => e.parkCode)
      .map(normalizeEvent);

  } catch (err) {
    console.warn("NPS events failed:", err);
    return [];
  }
}
