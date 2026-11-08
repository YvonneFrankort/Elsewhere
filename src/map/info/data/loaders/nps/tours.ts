
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

export interface NPSTour {
  id: string;
  title: string;
  description?: string;
  park?: {
    parkCode?: string;
    fullName?: string;
    name?: string;
    url?: string;
  };
  durationMin?: string;
  durationMax?: string;
  durationUnit?: string;
  type?: string;
  activities?: { id?: string; name?: string }[];
  topics?: { id?: string; name?: string }[];
  tags?: string[];
  images?: {
    url?: string;
    title?: string;
    caption?: string;
    altText?: string;
    credit?: string;
  }[];
  stops?: {
    id?: string;
    ordinal?: string;
    assetId?: string;
    assetName?: string;
    assetType?: string;
    significance?: string;
    directionsToNextStop?: string;
    audioFileUrl?: string;
    audioTranscript?: string;
  }[];
}

export async function loadTours(
  params: LoaderParams
): Promise<NPSTour[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS tours: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const states = state
    .split(",")
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  const stateResults = await Promise.all(
    states.map(async stateCode => {
      try {
        const url = new URL("https://developer.nps.gov/api/v1/tours");

        url.searchParams.set("stateCode", stateCode);
        url.searchParams.set("limit", "500");

        const res = await fetch(url.toString(), {
          headers: {
            "X-Api-Key": key
          }
        });

        if (!res.ok) {
          console.warn(
            `NPS tours failed for ${stateCode}: ${res.status}`
          );
          return [];
        }

        const json = await res.json();

        if (!Array.isArray(json.data)) {
          console.warn(
            `NPS tours: unexpected response for ${stateCode}`,
            json
          );
          return [];
        }

        const stateTours = json.data.filter(
          (tour: any) => tour.park?.parkCode
        );

        console.log(
          `🧭 NPS tours ${stateCode}:`,
          stateTours.length,
          "returned"
        );

        return stateTours as NPSTour[];

      } catch (err) {
        console.warn(
          `NPS tours request failed for ${stateCode}:`,
          err
        );
        return [];
      }
    })
  );

  const uniqueTours = Array.from(
    new Map(
      stateResults
        .flat()
        .map(tour => [tour.id, tour])
    ).values()
  );

  console.log("🧭 NPS unique tours:", uniqueTours.length);

  return uniqueTours;
}
