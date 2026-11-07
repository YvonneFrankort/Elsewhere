import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

export interface NPSWebcam {
  id: string;
  title: string;
  description?: string;
  url?: string;
  status?: string;
  statusMessage?: string;
  isStreaming?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  geometryPoiId?: string;
  credit?: string;
  tags?: string[];
  images?: {
    url?: string;
    title?: string;
    caption?: string;
    description?: string;
    altText?: string;
    credit?: string;
  }[];
  relatedParks?: {
    parkCode?: string;
    fullName?: string;
    name?: string;
    states?: string;
    url?: string;
  }[];
}

export async function loadWebcams(
  params: LoaderParams
): Promise<NPSWebcam[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS webcams: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const url = new URL("https://developer.nps.gov/api/v1/webcams");

  url.searchParams.set("stateCode", state);
  url.searchParams.set("limit", "500");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": key
      }
    });

    if (!res.ok) {
      throw new Error(`NPS webcams request failed: ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.data)) {
      console.warn("NPS webcams: unexpected API response", json);
      return [];
    }

    return json.data.filter(
      (webcam: any) => webcam.relatedParks?.length > 0
    );

  } catch (err) {
    console.warn("NPS webcams failed:", err);
    return [];
  }
}