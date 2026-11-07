
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

// --- Alert Data ---------------------------------------------------------------

export interface NPSAlert {
  id: string;
  title: string;
  parkCode: string;
  description?: string;
  url?: string;
  type?: string;
}

// --- Normalization ------------------------------------------------------------

function normalizeAlert(a: any): NPSAlert {
  return {
    id: a.id,
    title: a.title,
    parkCode: a.parkCode,
    description: a.description,
    url: a.url,
    type: a.type
  };
}

// --- Loader ------------------------------------------------------------------

export async function loadAlerts(
  params: LoaderParams
): Promise<NPSAlert[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS alerts: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = new URL("https://developer.nps.gov/api/v1/alerts");

  url.searchParams.set("stateCode", state);
  url.searchParams.set("limit", "500");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": key
      }
    });

    if (!res.ok) {
      throw new Error(`NPS alerts request failed: ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.data)) {
      console.warn("NPS alerts: unexpected API response", json);
      return [];
    }

    return json.data
      .filter((a: any) => a.parkCode)
      .map(normalizeAlert);

  } catch (err) {
    console.warn("NPS alerts failed:", err);
    return [];
  }
}
